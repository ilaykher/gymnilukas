require('dotenv').config();

const bcrypt = require('bcrypt');

const TARGETS = Object.freeze([
  { accountId: 1, employeeId: 1, role: 'admin' },
  { accountId: 2, employeeId: 2, role: 'employee' },
  { accountId: 3, employeeId: 3, role: 'employee' },
  { accountId: 4, employeeId: 4, role: 'employee' },
]);

const ACCOUNT_IDS = TARGETS.map(({ accountId }) => accountId);
const MUTATION_CAPABILITY = Symbol('owner-approved recovery');
const BCRYPT_COST_12_HASH = /^\$2[aby]\$12\$[./A-Za-z0-9]{53}$/;

function validateAccounts(rows) {
  if (!Array.isArray(rows) || rows.length !== TARGETS.length) {
    throw new Error('The expected account set was not found; recovery aborted.');
  }

  for (const expected of TARGETS) {
    const account = rows.find((row) => Number(row.account_id) === expected.accountId);
    if (
      !account ||
      Number(account.emp_id) !== expected.employeeId ||
      account.role !== expected.role ||
      account.status !== 'active'
    ) {
      throw new Error(`Account ${expected.accountId} no longer matches the approved mapping; recovery aborted.`);
    }
  }
}

async function fetchAccounts(client, { forUpdate = false } = {}) {
  const lock = forUpdate ? 'FOR UPDATE OF la, ea' : '';
  const result = await client.query(
    `SELECT la.account_id, la.emp_id, la.auth_role::text AS role,
            ea.emp_status::text AS status
     FROM login_auth la
     JOIN emp_acc ea ON ea.emp_id = la.emp_id
     WHERE la.account_id = ANY($1::integer[])
     ORDER BY la.account_id
     ${lock}`,
    [ACCOUNT_IDS]
  );
  validateAccounts(result.rows);
  return result.rows;
}

function validatePasswordHashes(passwordHashes) {
  if (
    !(passwordHashes instanceof Map) ||
    passwordHashes.size !== TARGETS.length ||
    ACCOUNT_IDS.some((id) => !passwordHashes.has(id))
  ) {
    throw new Error('A separate password hash is required for each approved account.');
  }
  if (ACCOUNT_IDS.some((id) => !BCRYPT_COST_12_HASH.test(passwordHashes.get(id)))) {
    throw new Error('Every account requires a valid bcrypt cost-12 hash; no changes made.');
  }
}

async function applyReset(client, passwordHashes, capability) {
  if (capability !== MUTATION_CAPABILITY) {
    throw new Error('Recovery safeguards were not completed; no changes made.');
  }
  validatePasswordHashes(passwordHashes);

  await client.query('BEGIN');
  try {
    await fetchAccounts(client, { forUpdate: true });
    for (const target of TARGETS) {
      const result = await client.query(
        `UPDATE login_auth
         SET auth_password = $1, auth_must_change_password = true
         WHERE account_id = $2 AND emp_id = $3 AND auth_role::text = $4
         RETURNING account_id`,
        [passwordHashes.get(target.accountId), target.accountId, target.employeeId, target.role]
      );
      if (result.rowCount !== 1) {
        throw new Error(`Account ${target.accountId} changed during recovery; transaction aborted.`);
      }
    }

    for (const target of TARGETS) {
      await client.query(
        `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
         VALUES (NULL, 'auth.owner_recovery', 'login_auth', $1, '{}'::jsonb)`,
        [target.accountId]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

function validPassword(password) {
  return typeof password === 'string' &&
    password.length >= 8 &&
    password.length <= 256 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password);
}

function readHiddenInput(prompt, input = process.stdin, output = process.stdout) {
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new Error('Recovery requires an interactive local terminal.');
  }

  output.write(prompt);
  return new Promise((resolve, reject) => {
    const bytes = [];
    let finished = false;
    const finish = (error) => {
      if (finished) return;
      finished = true;
      input.removeListener('data', onData);
      input.setRawMode(false);
      input.pause();
      output.write('\n');
      if (error) reject(error);
      else resolve(Buffer.from(bytes).toString('utf8'));
    };
    const onData = (chunk) => {
      for (const byte of chunk) {
        if (byte === 3) {
          finish(new Error('Recovery cancelled.'));
          return;
        }
        if (byte === 10 || byte === 13) {
          finish();
          return;
        }
        if (byte === 8 || byte === 127) {
          bytes.pop();
          continue;
        }
        if (byte >= 32 && byte !== 127 && bytes.length < 256) bytes.push(byte);
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}

function normalizeExpectedHost(host) {
  if (typeof host !== 'string' || host !== host.trim() || !host) {
    throw new Error('Expected Neon host is missing or malformed.');
  }
  let parsed;
  try {
    parsed = new URL(`https://${host}`);
  } catch {
    throw new Error('Expected Neon host is missing or malformed.');
  }
  if (
    parsed.hostname.toLowerCase() !== host.toLowerCase() ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))+$/.test(parsed.hostname.toLowerCase())
  ) {
    throw new Error('Expected Neon host is missing or malformed.');
  }
  return parsed.hostname.toLowerCase();
}

function assertTargetConfiguration(env = process.env) {
  let connection;
  try {
    connection = new URL(env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL is missing or invalid.');
  }
  if (!['postgres:', 'postgresql:'].includes(connection.protocol)) {
    throw new Error('DATABASE_URL is missing or invalid.');
  }
  const expectedHost = normalizeExpectedHost(connection.hostname);
  let expectedDatabase;
  try {
    expectedDatabase = decodeURIComponent(connection.pathname.slice(1));
  } catch {
    throw new Error('DATABASE_URL is missing or invalid.');
  }
  if (!expectedDatabase || expectedDatabase.includes('/') || expectedDatabase !== expectedDatabase.trim()) {
    throw new Error('DATABASE_URL is missing or invalid.');
  }
  return { expectedDatabase, expectedHost };
}

function assertApplyConfiguration(env = process.env) {
  if (env.RECOVERY_ENVIRONMENT !== 'production') {
    throw new Error('Set RECOVERY_ENVIRONMENT=production only for the owner-approved production run.');
  }
  if (env.RECOVERY_OWNER_APPROVED !== 'YES') {
    throw new Error('The system owner must explicitly approve the recovery operation first.');
  }
  if (env.RECOVERY_JWT_SECRET_ROTATED !== 'YES') {
    throw new Error('Rotate JWT_SECRET on every API instance and confirm it before resetting accounts.');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters before recovery.');
  }
  return assertTargetConfiguration(env);
}

async function assertDatabaseTarget(client, { expectedDatabase, expectedHost }) {
  const connectedHost = client.connectionParameters?.host;
  const connectedDatabase = client.connectionParameters?.database;
  if (typeof connectedHost !== 'string' || !connectedHost.trim()) {
    throw new Error('Connected database host could not be verified.');
  }
  if (normalizeExpectedHost(connectedHost) !== expectedHost) {
    throw new Error('Connected database host does not match the approved target.');
  }
  if (typeof connectedDatabase !== 'string' || connectedDatabase !== expectedDatabase) {
    throw new Error('Connected database does not match the explicitly approved target.');
  }
  const result = await client.query(
    `SELECT current_database() AS database_name,
            EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = current_schema()
                AND table_name = 'login_auth'
                AND column_name = 'auth_must_change_password'
            ) AS has_password_change_flag,
            to_regclass('public.activity_logs') IS NOT NULL AS has_activity_logs`
  );
  const target = result.rows[0];
  if (!target?.has_password_change_flag || !target.has_activity_logs) {
    throw new Error('Required recovery fields or audit table are unavailable; no changes made.');
  }
  if (!target?.database_name || target.database_name !== expectedDatabase) {
    throw new Error('Connected database does not match the explicitly approved target.');
  }
  return target.database_name;
}

async function collectPasswordHashes(readInput = (prompt) => readHiddenInput(prompt)) {
  const passwords = new Map();
  const hashes = new Map();
  try {
    for (const target of TARGETS) {
      let password;
      let confirmation;
      do {
        password = await readInput(`Enter a new unique password for account ${target.accountId}: `);
        if (!validPassword(password)) {
          process.stdout.write('Password does not meet the existing password requirements. Try again.\n');
          password = null;
          continue;
        }
        if ([...passwords.values()].includes(password)) {
          process.stdout.write('Each account must have a different password. Choose another one.\n');
          password = null;
          continue;
        }
        confirmation = await readInput(`Re-enter the new password for account ${target.accountId}: `);
        if (password !== confirmation) {
          process.stdout.write('Entries did not match. Try again for this account.\n');
          password = null;
        }
      } while (!password || password !== confirmation);

      passwords.set(target.accountId, password);
      hashes.set(target.accountId, await bcrypt.hash(password, 12));
      password = null;
      confirmation = null;
    }
    return hashes;
  } finally {
    passwords.clear();
  }
}

async function runCommand(args, { env, poolFactory, readInput }) {
  if (args.length !== 1 || !['--check', '--apply'].includes(args[0])) {
    throw new Error('Use --check for read-only inspection, or --apply after explicit owner approval.');
  }

  const apply = args[0] === '--apply';
  const target = apply ? assertApplyConfiguration(env) : assertTargetConfiguration(env);

  const pool = poolFactory();
  let client;
  try {
    client = await pool.connect();
    const databaseName = await assertDatabaseTarget(client, target);
    const accounts = await fetchAccounts(client);
    if (!apply) {
      process.stdout.write(`Read-only recovery preflight passed for ${accounts.length} fixed accounts.\n`);
      process.stdout.write('Database target: match.\n');
      return;
    }

    const targetConfirmation = `RECOVER ACCOUNTS 1,2,3,4 ON ${target.expectedHost}/${databaseName}`;
    const confirmation = await readInput(
      `Type ${targetConfirmation} to authorize these four resets: `
    );
    if (confirmation !== targetConfirmation) {
      throw new Error('Confirmation did not match; no changes made.');
    }

    const hashes = await collectPasswordHashes(readInput);
    await applyReset(client, hashes, MUTATION_CAPABILITY);
    process.stdout.write('Recovery completed for the four approved account IDs. No credentials were displayed.\n');
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

function createMockPool({ accountsToReturn = TARGETS.map(({ accountId, employeeId, role }) => ({
  account_id: accountId,
  emp_id: employeeId,
  role,
  status: 'active',
})), databaseName = 'fitnexx_test', databaseHost = 'neon-test.invalid', failUpdateAt = 0, failAuditAt = 0 } = {}) {
  const state = {
    calls: [],
    updates: [],
    committed: false,
    rolledBack: false,
  };
  const client = {
    async query(sql, values) {
      state.calls.push({ sql, values });
      if (sql === 'BEGIN') return { rows: [] };
      if (sql === 'COMMIT') {
        state.committed = true;
        return { rows: [] };
      }
      if (sql === 'ROLLBACK') {
        state.rolledBack = true;
        state.updates.length = 0;
        return { rows: [] };
      }
      if (sql.includes('current_database()')) {
        return { rows: [{
          database_name: databaseName,
          has_password_change_flag: true,
          has_activity_logs: true,
        }] };
      }
      if (sql.includes('FROM login_auth la')) return { rows: accountsToReturn };
      if (sql.includes('UPDATE login_auth')) {
        if (state.updates.length + 1 === failUpdateAt) throw new Error('mock update failure');
        state.updates.push(values[1]);
        return { rowCount: 1, rows: [{ account_id: values[1] }] };
      }
      if (sql.includes('INSERT INTO activity_logs')) {
        if (state.calls.filter((call) => call.sql.includes('INSERT INTO activity_logs')).length === failAuditAt) {
          throw new Error('mock audit failure');
        }
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    },
    release() {},
    connectionParameters: { host: databaseHost, database: databaseName },
  };
  return {
    state,
    pool: {
      async connect() { return client; },
      async end() {},
    },
  };
}

async function runForTests(args, options = {}) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('The isolated recovery test interface is available only in test processes.');
  }
  const { state, pool } = createMockPool(options);
  const inputs = [...(options.inputValues || [])];
  state.prompts = [];
  const readInput = async (prompt) => {
    state.prompts.push(prompt);
    if (!inputs.length) throw new Error('Mock input exhausted.');
    const value = inputs.shift();
    if (value instanceof Error) throw value;
    return value;
  };
  try {
    await runCommand(args, {
      env: options.env || {},
      poolFactory: () => pool,
      readInput,
    });
    return { state };
  } catch (error) {
    error.testState = state;
    throw error;
  }
}


function runCli(...unexpectedDependencies) {
  if (unexpectedDependencies.length > 0) {
    throw new Error('The production recovery entry point does not accept injected dependencies.');
  }

  const readline = require('node:readline/promises');

  const readVisibleInput = async (prompt) => {
    const { stdin, stdout } = process;

    if (!stdin.isTTY || !stdout.isTTY) {
      throw new Error('Recovery requires an interactive local terminal.');
    }

    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
    });

    try {
      return await rl.question(prompt);
    } finally {
      rl.close();
    }
  };

  let inputCount = 0;

  return runCommand(
    process.argv.slice(2),
    {
      env: process.env,
      poolFactory: () => require('../src/config/db'),
      readInput: (prompt) => {
        inputCount += 1;

        // First input for --apply is the visible confirmation phrase.
        if (
          process.argv.includes('--apply') &&
          inputCount === 1 &&
          prompt.startsWith('Type RECOVER ACCOUNTS')
        ) {
          return readVisibleInput(prompt);
        }

        // All passwords remain hidden.
        return readHiddenInput(prompt);
      },
    }
  );
}


if (require.main === module) {
  runCli().catch((error) => {
    const detail = error.message?.startsWith('Account ') ||
      error.message?.startsWith('Set ') ||
      error.message?.startsWith('The ') ||
      error.message?.startsWith('Rotate ') ||
      error.message?.startsWith('JWT_SECRET') ||
      error.message?.startsWith('DATABASE_URL') ||
      error.message?.startsWith('Connected ') ||
      error.message?.startsWith('Required ') ||
      error.message?.startsWith('Recovery ') ||
      error.message?.startsWith('Use ') ||
      error.message?.startsWith('Each ') ||
      error.message?.startsWith('Password ') ||
      error.message?.startsWith('Confirmation ') ||
      error.message?.startsWith('The system owner')
      ? error.message
      : `Recovery failed safely (${error.code || error.name || 'UnknownError'}).`;
    process.stderr.write(`${detail}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  TARGETS,
  validateAccounts,
  validatePasswordHashes,
  validPassword,
  assertTargetConfiguration,
  assertApplyConfiguration,
  readHiddenInput,
  runCli,
  runForTests,
};
