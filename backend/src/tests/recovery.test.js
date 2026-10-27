const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcrypt');
const {
  TARGETS,
  validateAccounts,
  validatePasswordHashes,
  validPassword,
  assertApplyConfiguration,
  assertTargetConfiguration,
  readHiddenInput,
  runCli,
  runForTests,
} = require('../../scripts/recover-accounts');

process.env.NODE_ENV = 'test';

const accounts = TARGETS.map(({ accountId, employeeId, role }) => ({
  account_id: accountId,
  emp_id: employeeId,
  role,
  status: 'active',
}));

const approvedEnvironment = () => ({
  RECOVERY_ENVIRONMENT: 'production',
  RECOVERY_OWNER_APPROVED: 'YES',
  RECOVERY_JWT_SECRET_ROTATED: 'YES',
  JWT_SECRET: 'test-only-jwt-secret-that-is-not-used-in-production',
  DATABASE_URL: 'postgresql://neon-test.invalid/fitnexx_test',
});

const passwordsForFour = [
  'RECOVER ACCOUNTS 1,2,3,4 ON neon-test.invalid/fitnexx_test',
  'UniquePass1!', 'UniquePass1!',
  'UniquePass2!', 'UniquePass2!',
  'UniquePass3!', 'UniquePass3!',
  'UniquePass4!', 'UniquePass4!',
];

async function expectFailure(args, options, pattern) {
  try {
    await runForTests(args, options);
    assert.fail('Expected recovery mock to reject.');
  } catch (error) {
    if (pattern) assert.match(error.message, pattern);
    return error;
  }
}

test('fixed targets reject missing, extra, account, employee, role, and status mismatches', () => {
  assert.deepEqual(TARGETS, [
    { accountId: 1, employeeId: 1, role: 'admin' },
    { accountId: 2, employeeId: 2, role: 'employee' },
    { accountId: 3, employeeId: 3, role: 'employee' },
    { accountId: 4, employeeId: 4, role: 'employee' },
  ]);
  assert.doesNotThrow(() => validateAccounts(accounts));
  assert.throws(() => validateAccounts(accounts.slice(0, 3)), /expected account set/);
  assert.throws(() => validateAccounts([...accounts, accounts[0]]), /expected account set/);
  for (const mutate of [
    (row) => ({ ...row, account_id: 99 }),
    (row) => ({ ...row, emp_id: 99 }),
    (row) => ({ ...row, role: 'employee' }),
    (row) => ({ ...row, status: 'inactive' }),
  ]) {
    assert.throws(
      () => validateAccounts(accounts.map((row, index) => index === 0 ? mutate(row) : row)),
      /no longer matches/
    );
  }
});

test('password policy requires the configured minimum and character classes', () => {
  assert.equal(validPassword('StrongPass9!'), true);
  assert.equal(validPassword('short1!'), false);
  assert.equal(validPassword('alllowercase9!'), false);
  assert.equal(validPassword('NoNumber!'), false);
  assert.equal(validPassword('NoSpecial99'), false);
  assert.equal(validPassword('x'.repeat(257) + 'Aa1!'), false);
});

test('bcrypt cost-12 hashes work with the existing verifier', async () => {
  const password = 'UniquePass42!';
  const hash = await bcrypt.hash(password, 12);
  assert.match(hash, /^\$2[aby]\$12\$/);
  assert.equal(await bcrypt.compare(password, hash), true);
  assert.equal(await bcrypt.compare('IncorrectPass42!', hash), false);
});

test('mutation hash validation requires exactly four valid bcrypt cost-12 hashes', () => {
  const validHashes = new Map(TARGETS.map(({ accountId }) => [
    accountId,
    `$2b$12$${'A'.repeat(53)}`,
  ]));
  assert.doesNotThrow(() => validatePasswordHashes(validHashes));
  assert.throws(() => validatePasswordHashes(new Map()), /separate password hash/);
  assert.throws(() => validatePasswordHashes(new Map([...validHashes, [5, validHashes.get(1)]])), /separate password hash/);
  for (const invalidHash of ['plaintext', '$2b$10$' + 'A'.repeat(53), '$2b$12$bad']) {
    const hashes = new Map(validHashes);
    hashes.set(1, invalidHash);
    assert.throws(() => validatePasswordHashes(hashes), /valid bcrypt cost-12 hash/);
  }
});

test('owner approval and configured production target are required', () => {
  const env = approvedEnvironment();
  assert.deepEqual(assertApplyConfiguration(env), {
    expectedDatabase: 'fitnexx_test',
    expectedHost: 'neon-test.invalid',
  });
  for (const [key, value] of [
    ['RECOVERY_OWNER_APPROVED', undefined],
    ['RECOVERY_OWNER_APPROVED', 'NO'],
    ['RECOVERY_ENVIRONMENT', 'staging'],
    ['RECOVERY_JWT_SECRET_ROTATED', 'NO'],
  ]) {
    assert.throws(() => assertApplyConfiguration({ ...env, [key]: value }));
  }
});

test('read-only preflight derives expected database name and host from DATABASE_URL', () => {
  const env = approvedEnvironment();
  assert.deepEqual(assertTargetConfiguration(env), {
    expectedDatabase: 'fitnexx_test',
    expectedHost: 'neon-test.invalid',
  });
  for (const invalid of [
    { ...env, DATABASE_URL: undefined },
    { ...env, DATABASE_URL: 'not a url' },
    { ...env, DATABASE_URL: 'https://neon-test.invalid/fitnexx_test' },
    { ...env, DATABASE_URL: 'postgresql:///fitnexx_test' },
    { ...env, DATABASE_URL: 'postgresql://neon-test.invalid/' },
    { ...env, DATABASE_URL: 'postgresql://neon-test.invalid/name/extra' },
    { ...env, DATABASE_URL: 'postgresql://neon-test.invalid/%ZZ' },
  ]) {
    assert.throws(() => assertTargetConfiguration(invalid));
  }
});

test('read-only preflight derives a changed host from DATABASE_URL and compares it to the connected host', async () => {
  const hostMismatch = await expectFailure(
    ['--check'],
    {
      env: {
        ...approvedEnvironment(),
        DATABASE_URL: 'postgresql://other.invalid/fitnexx_test',
      },
    },
    /Connected database host does not match/
  );
  assert.equal(hostMismatch.testState.calls.length, 0);

  assert.deepEqual(assertTargetConfiguration({
    ...approvedEnvironment(),
    DATABASE_URL: 'postgresql://neon-test.invalid/other_database',
  }), {
    expectedDatabase: 'other_database',
    expectedHost: 'neon-test.invalid',
  });
});

test('read-only preflight verifies actual connected host and database name without mutation SQL', async () => {
  const { state } = await runForTests(['--check'], { env: approvedEnvironment() });
  assert.equal(state.calls.length, 2);
  assert(state.calls.every(({ sql }) =>
    !/\b(UPDATE|INSERT|DELETE|BEGIN|COMMIT|ROLLBACK|ALTER|CREATE|DROP|TRUNCATE)\b/i.test(sql)
  ));
  assert(state.calls.some(({ sql }) => sql.includes('current_database()')));
  assert(state.calls.some(({ sql }) => sql.includes('FROM login_auth la')));
});

test('read-only preflight rejects connected database-name and host mismatches', async () => {
  const wrongName = await expectFailure(
    ['--check'],
    { env: approvedEnvironment(), databaseName: 'wrong_database' },
    /does not match the explicitly approved target/
  );
  assert.equal(wrongName.testState.updates.length, 0);

  const wrongHost = await expectFailure(
    ['--check'],
    { env: approvedEnvironment(), databaseHost: 'other.invalid' },
    /Connected database host does not match the approved target/
  );
  assert.equal(wrongHost.testState.calls.length, 0);
  assert.equal(wrongHost.testState.updates.length, 0);
});

test('read-only preflight fails closed when connected host information is unavailable', async () => {
  const unverifiableHost = await expectFailure(
    ['--check'],
    { env: approvedEnvironment(), databaseHost: null },
    /Connected database host could not be verified/
  );
  assert.equal(unverifiableHost.testState.updates.length, 0);
});

test('production CLI rejects injected dependencies before creating a pool or reading input', () => {
  const pool = { connect() { assert.fail('Injected pool must never be used.'); } };
  const input = () => assert.fail('Injected input must never be used.');
  assert.throws(() => runCli(['--apply'], { pool, input }), /does not accept injected dependencies/);
  assert.throws(() => runCli({ env: approvedEnvironment(), pool, readInput: input }), /does not accept injected dependencies/);
});

test('test-only runner is unavailable outside a test process', async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(
      runForTests(['--apply'], { env: approvedEnvironment(), inputValues: passwordsForFour }),
      /available only in test processes/
    );
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test('invalid owner approval stops before mock database queries', async () => {
  const error = await expectFailure(
    ['--apply'],
    { env: { ...approvedEnvironment(), RECOVERY_OWNER_APPROVED: 'NO' } },
    /owner must explicitly approve/
  );
  assert.equal(error.testState.calls.length, 0);
});

test('database-name mismatch aborts before writes', async () => {
  const error = await expectFailure(
    ['--apply'],
    { env: { ...approvedEnvironment(), DATABASE_URL: 'postgresql://neon-test.invalid/wrong_database' } },
    /does not match the explicitly approved target/
  );
  assert.equal(error.testState.updates.length, 0);
  assert.equal(error.testState.rolledBack, false);
});

test('wrong or cancelled interactive confirmation aborts before any update', async () => {
  for (const inputValues of [
    ['incorrect confirmation'],
    [new Error('Recovery cancelled.')],
  ]) {
    const error = await expectFailure(
      ['--apply'],
      { env: approvedEnvironment(), inputValues }
    );
    assert.equal(error.testState.updates.length, 0);
    assert.equal(error.testState.committed, false);
    assert.equal(error.testState.prompts.length, 1);
  }
});

test('confirmation requires the exact validated hostname and database name', async () => {
  const wrongConfirmations = [
    'RECOVER ACCOUNTS 1,2,3,4 ON another-host.invalid/fitnexx_test',
    'RECOVER ACCOUNTS 1,2,3,4 ON neon-test.invalid/another_database',
  ];

  for (const confirmation of wrongConfirmations) {
    const error = await expectFailure(
      ['--apply'],
      { env: approvedEnvironment(), inputValues: [confirmation] },
      /Confirmation did not match/
    );
    assert.equal(error.testState.prompts.length, 1);
    assert.match(error.testState.prompts[0], /neon-test\.invalid\/fitnexx_test/);
    assert.equal(error.testState.updates.length, 0);
    assert.equal(error.testState.calls.some(({ sql }) =>
      sql === 'BEGIN' || sql.includes('UPDATE login_auth') || sql.includes('INSERT INTO activity_logs')
    ), false);
  }
});

test('non-TTY input is rejected and interactive password input is not echoed', async () => {
  assert.throws(
    () => readHiddenInput('prompt', { isTTY: false }, { write() {} }),
    /interactive local terminal/
  );

  const { EventEmitter } = require('node:events');
  const input = new EventEmitter();
  const output = { text: '', write(text) { this.text += text; } };
  input.isTTY = true;
  input.setRawMode = (mode) => { input.rawMode = mode; };
  input.resume = () => {};
  input.pause = () => {};
  const result = readHiddenInput('Password: ', input, output);
  await new Promise((resolve) => setImmediate(resolve));
  input.emit('data', Buffer.from('HiddenPass9!\n'));
  assert.equal(await result, 'HiddenPass9!');
  assert.equal(output.text.includes('HiddenPass9!'), false);
  assert.equal(input.rawMode, false);
});

test('duplicate passwords are rejected and four unique passwords are hashed before writes', async () => {
  const inputValues = [
    passwordsForFour[0],
    passwordsForFour[1], passwordsForFour[2],
    passwordsForFour[1],
    ...passwordsForFour.slice(3),
  ];
  const { state } = await runForTests(['--apply'], {
    env: approvedEnvironment(),
    inputValues,
  });
  assert.match(state.prompts[0], /neon-test\.invalid\/fitnexx_test/);
  assert.equal(state.committed, true);
  assert.equal(state.updates.length, 4);
  assert.equal(state.calls.filter(({ sql }) => sql.includes('UPDATE login_auth')).length, 4);
  for (const call of state.calls.filter(({ sql }) => sql.includes('UPDATE login_auth'))) {
    assert.match(call.values[0], /^\$2[aby]\$12\$/);
  }
  const auditCalls = state.calls.filter(({ sql }) => sql.includes('INSERT INTO activity_logs'));
  assert.equal(auditCalls.length, 4);
  assert(auditCalls.every(({ sql, values }) =>
    sql.includes('VALUES (NULL,') && values.length === 1 && [1, 2, 3, 4].includes(values[0])
  ));
  assert(state.calls.filter(({ sql }) => sql.includes('UPDATE login_auth'))
    .every(({ sql }) => sql.includes('auth_must_change_password = true')));
});

test('mutation helper is private; test runner accepts no pool or input provider', () => {
  const recovery = require('../../scripts/recover-accounts');
  assert.equal(Object.hasOwn(recovery, 'applyReset'), false);
  assert.equal(Object.hasOwn(recovery, 'run'), false);
});

test('update failure after earlier updates rolls the entire transaction back', async () => {
  const error = await expectFailure(
    ['--apply'],
    { env: approvedEnvironment(), inputValues: passwordsForFour, failUpdateAt: 2 },
    /mock update failure/
  );
  assert.equal(error.testState.rolledBack, true);
  assert.equal(error.testState.committed, false);
  assert.equal(error.testState.updates.length, 0);
});

test('audit insert failure rolls back all password updates', async () => {
  const error = await expectFailure(
    ['--apply'],
    { env: approvedEnvironment(), inputValues: passwordsForFour, failAuditAt: 1 },
    /mock audit failure/
  );
  assert.equal(error.testState.rolledBack, true);
  assert.equal(error.testState.committed, false);
  assert.equal(error.testState.updates.length, 0);
});

test('unexpected account mapping in the mocked database aborts before transaction', async () => {
  const altered = accounts.map((row) => row.account_id === 2 ? { ...row, emp_id: 99 } : row);
  const error = await expectFailure(
    ['--apply'],
    { env: approvedEnvironment(), accountsToReturn: altered, inputValues: passwordsForFour }
  );
  assert.equal(error.testState.updates.length, 0);
  assert.equal(error.testState.calls.some(({ sql }) => sql === 'BEGIN'), false);
});
