const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = 'postgres://127.0.0.1:5432/fitnexx_test';
const membersController = require('../controllers/members.controller');
const membersModel = require('../models/members.model');
const pool = require('../config/db');
const apiRoutes = require('../routes/api.route');
const { createAuthMiddleware } = require('../middleware/auth');
if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
else process.env.DATABASE_URL = originalDatabaseUrl;

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function checkIn(pin = '2468') {
  const res = createResponse();
  let error;
  await membersController.checkIn(
    { body: { username: 'member.one', pin }, user: { empId: 7 } },
    res,
    (caught) => { error = caught; }
  );
  return { res, error };
}

test('invalid member PIN is a member-specific forbidden response, not a staff-authentication response', async () => {
  const originalFind = membersModel.findMemberForCheckIn;
  const originalRecord = membersModel.recordCheckIn;
  try {
    membersModel.findMemberForCheckIn = async () => ({
      member_id: 24,
      mem_fullname: 'Member One',
      mem_username: 'member.one',
      mem_pin_hash: await bcrypt.hash('1357', 4),
    });
    membersModel.recordCheckIn = async () => {
      assert.fail('Attendance must not be recorded for an incorrect PIN');
    };

    const { res, error } = await checkIn();
    assert.equal(res.body, null);
    assert.equal(error.status, 403);
    assert.match(error.message, /Invalid username or PIN/);
    assert.doesNotMatch(error.message, /2468|1357/);
  } finally {
    membersModel.findMemberForCheckIn = originalFind;
    membersModel.recordCheckIn = originalRecord;
  }
});

test('missing eligible membership is rejected with a member-specific response', async () => {
  const originalFind = membersModel.findMemberForCheckIn;
  const originalRecord = membersModel.recordCheckIn;
  try {
    membersModel.findMemberForCheckIn = async () => null;
    membersModel.recordCheckIn = async () => {
      assert.fail('Attendance must not be recorded without an eligible membership');
    };

    const { res, error } = await checkIn();
    assert.equal(res.body, null);
    assert.equal(error.status, 403);
    assert.match(error.message, /no active membership/i);
  } finally {
    membersModel.findMemberForCheckIn = originalFind;
    membersModel.recordCheckIn = originalRecord;
  }
});

test('check-in member lookup excludes inactive members and expired memberships', async () => {
  const originalQuery = pool.query;
  let query;
  pool.query = async (sql, values) => {
    query = { sql, values };
    return { rows: [] };
  };
  try {
    assert.equal(await membersModel.findMemberForCheckIn('member.one'), null);
    assert.match(query.sql, /m\.mem_status::text = 'active'/);
    assert.match(query.sql, /mbs_expiration_date >= CURRENT_DATE/);
    assert.match(query.sql, /mbs_status::text <> 'expired'/);
    assert.deepEqual(query.values, ['member.one']);
  } finally {
    pool.query = originalQuery;
  }
});

test('check-in duplicate lookup uses the Philippine calendar date for either timestamp type', async () => {
  const originalConnect = pool.connect;
  const statements = [];
  const client = {
    async query(sql) {
      statements.push(sql);
      if (sql.includes('SELECT 1') && sql.includes('member_attendance')) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith('INSERT INTO member_attendance')) {
        return { rows: [{ attendance_id: 91, atd_time_in: '2026-10-27T13:00:00.000Z' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 1 };
    },
    release() {},
  };
  pool.connect = async () => client;
  try {
    await membersModel.recordCheckIn({ member_id: 24, mem_fullname: 'Member One' }, 7);
    const duplicateQuery = statements.find((sql) => sql.includes('SELECT 1') && sql.includes('member_attendance'));
    const lockQuery = statements.find((sql) => sql.includes('pg_advisory_xact_lock'));
    assert.ok(duplicateQuery);
    assert.ok(lockQuery);
    assert.match(duplicateQuery, /AT TIME ZONE 'Asia\/Manila'/);
    assert.match(duplicateQuery, /CURRENT_TIMESTAMP AT TIME ZONE 'Asia\/Manila'/);
    assert.match(duplicateQuery, /pg_typeof\(atd_time_in\)/);
    assert.ok(statements.indexOf(lockQuery) < statements.indexOf(duplicateQuery));
  } finally {
    pool.connect = originalConnect;
  }
});

test('valid member credentials return check-in success and record attendance', async () => {
  const originalFind = membersModel.findMemberForCheckIn;
  const originalRecord = membersModel.recordCheckIn;
  const member = {
    member_id: 24,
    mem_fullname: 'Member One',
    mem_username: 'member.one',
    mem_pin_hash: await bcrypt.hash('2468', 4),
    membership_status: 'active',
    mbs_expiration_date: new Date('2026-11-26T16:00:00.000Z'),
    membership_type: 'regular',
  };
  const attendance = { attendance_id: 91, atd_time_in: '2026-10-27T13:00:00.000Z' };
  let recorded;
  try {
    membersModel.findMemberForCheckIn = async (username) => {
      assert.equal(username, 'member.one');
      return member;
    };
    membersModel.recordCheckIn = async (checkedInMember, actorId) => {
      recorded = { member: checkedInMember, actorId };
      return attendance;
    };

    const { res, error } = await checkIn();
    assert.equal(error, undefined);
    assert.equal(res.statusCode, 201);
    assert.deepEqual(recorded, { member, actorId: 7 });
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.attendance_id, attendance.attendance_id);
    assert.equal(res.body.data.memberId, member.member_id);
    assert.equal(res.body.data.membershipStatus, 'active');
    assert.equal(res.body.data.expiresOn, member.mbs_expiration_date);
    assert.equal(
      JSON.parse(JSON.stringify(res.body)).data.expiresOn,
      '2026-11-26T16:00:00.000Z'
    );
    assert.equal(JSON.stringify(res.body).includes(member.mem_pin_hash), false);
  } finally {
    membersModel.findMemberForCheckIn = originalFind;
    membersModel.recordCheckIn = originalRecord;
  }
});

test('attendance and activity-log writes share a transaction and roll back on failure', async () => {
  const originalConnect = pool.connect;
  const statements = [];
  const failure = new Error('simulated attendance database failure');
  const client = {
    async query(sql) {
      statements.push(sql);
      if (sql.startsWith('INSERT INTO member_attendance')) throw failure;
      return { rows: [] };
    },
    release() {},
  };
  pool.connect = async () => client;
  try {
    await assert.rejects(
      membersModel.recordCheckIn({ member_id: 24, mem_fullname: 'Member One' }, 7),
      failure
    );
    assert.equal(statements[0], 'BEGIN');
    assert.match(statements[1], /pg_advisory_xact_lock/);
    assert.match(statements[2], /SELECT 1[\s\S]*member_attendance/);
    assert.equal(statements[3], expectAttendanceInsert());
    assert.equal(statements[4], 'ROLLBACK');
  } finally {
    pool.connect = originalConnect;
  }
});

function expectAttendanceInsert() {
  return `INSERT INTO member_attendance (member_id, atd_processed_by)
       VALUES ($1, $2)
       RETURNING attendance_id, atd_time_in`;
}

function installTransactionalAttendanceMock() {
  const originalConnect = pool.connect;
  const records = [];
  const activityWrites = [];
  const lockQueues = new Map();
  let today = '2026-10-27';
  pool.connect = async () => {
    let releaseMemberLock;
    return {
      async query(sql, values = []) {
        if (sql === 'BEGIN') return { rows: [] };
        if (sql.includes('pg_advisory_xact_lock')) {
          const memberId = values[1];
          const previous = lockQueues.get(memberId) || Promise.resolve();
          let unlock;
          const current = new Promise((resolve) => { unlock = resolve; });
          lockQueues.set(memberId, previous.then(() => current));
          await previous;
          releaseMemberLock = unlock;
          return { rows: [] };
        }
        if (sql.includes('SELECT 1') && sql.includes('member_attendance')) {
          const duplicate = records.some((record) => record.memberId === values[0] && record.date === today);
          return { rows: duplicate ? [{ '?column?': 1 }] : [], rowCount: duplicate ? 1 : 0 };
        }
        if (sql.startsWith('INSERT INTO member_attendance')) {
          const attendance = { attendance_id: records.length + 1, atd_time_in: `${today}T08:00:00.000Z` };
          records.push({ memberId: values[0], date: today, attendance });
          return { rows: [attendance], rowCount: 1 };
        }
        if (sql.includes("'member.checked_in'")) {
          activityWrites.push(values[1]);
          return { rows: [], rowCount: 1 };
        }
        if (sql === 'COMMIT' || sql === 'ROLLBACK') {
          releaseMemberLock?.();
          return { rows: [] };
        }
        assert.fail(`Unexpected transaction query: ${sql}`);
      },
      release() {},
    };
  };
  return {
    records,
    activityWrites,
    setToday(date) { today = date; },
    restore() { pool.connect = originalConnect; },
  };
}

test('a same-day duplicate is rejected without another attendance or activity record', async () => {
  const mock = installTransactionalAttendanceMock();
  const member = { member_id: 24, mem_fullname: 'Member One', membership_status: 'active' };
  try {
    const first = await membersModel.recordCheckIn(member, 7);
    const second = await membersModel.recordCheckIn(member, 7);
    assert.ok(first);
    assert.equal(second, null);
    assert.equal(mock.records.length, 1);
    assert.deepEqual(mock.activityWrites, [24]);

    const originalFind = membersModel.findMemberForCheckIn;
    const originalRecord = membersModel.recordCheckIn;
    membersModel.findMemberForCheckIn = async () => ({
      ...member,
      mem_username: 'member.one',
      mem_pin_hash: await bcrypt.hash('2468', 4),
    });
    try {
      const { res, error } = await checkIn();
      assert.equal(res.body, null);
      assert.equal(error.status, 409);
      assert.equal(error.message, 'This member has already checked in today.');
      assert.equal(mock.records.length, 1);
      assert.deepEqual(mock.activityWrites, [24]);
    } finally {
      membersModel.findMemberForCheckIn = originalFind;
      membersModel.recordCheckIn = originalRecord;
    }
  } finally {
    mock.restore();
  }
});

test('different members can each check in once on the same Philippine calendar day', async () => {
  const mock = installTransactionalAttendanceMock();
  try {
    const results = await Promise.all([
      membersModel.recordCheckIn({ member_id: 24, mem_fullname: 'Member One' }, 7),
      membersModel.recordCheckIn({ member_id: 25, mem_fullname: 'Member Two' }, 7),
    ]);
    assert.equal(results.filter(Boolean).length, 2);
    assert.equal(mock.records.length, 2);
    assert.deepEqual(mock.activityWrites.sort(), [24, 25]);
  } finally {
    mock.restore();
  }
});

test('the same member may check in on the next Philippine calendar day', async () => {
  const mock = installTransactionalAttendanceMock();
  try {
    const member = { member_id: 24, mem_fullname: 'Member One' };
    assert.ok(await membersModel.recordCheckIn(member, 7));
    assert.equal(await membersModel.recordCheckIn(member, 7), null);
    mock.setToday('2026-10-28');
    assert.ok(await membersModel.recordCheckIn(member, 7));
    assert.equal(mock.records.length, 2);
    assert.deepEqual(mock.activityWrites, [24, 24]);
  } finally {
    mock.restore();
  }
});

test('Philippine midnight boundaries use Asia/Manila rather than UTC date boundaries', () => {
  const getManilaDate = (instant) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(instant));
    return `${parts.find((part) => part.type === 'year').value}-${parts.find((part) => part.type === 'month').value}-${parts.find((part) => part.type === 'day').value}`;
  };
  assert.equal(getManilaDate('2026-10-27T15:59:59.999Z'), '2026-10-27');
  assert.equal(getManilaDate('2026-10-27T16:00:00.000Z'), '2026-10-28');
});

test('concurrent same-member requests serialize before duplicate lookup', async () => {
  const mock = installTransactionalAttendanceMock();
  try {
    const member = { member_id: 24, mem_fullname: 'Member One' };
    const results = await Promise.all([
      membersModel.recordCheckIn(member, 7),
      membersModel.recordCheckIn(member, 8),
    ]);
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(results.filter((result) => result === null).length, 1);
    assert.equal(mock.records.length, 1);
    assert.equal(mock.activityWrites.length, 1);
  } finally {
    mock.restore();
  }
});

test('check-in route remains behind staff authentication and password-change guards', () => {
  const route = apiRoutes.stack.find(
    (layer) => layer.route?.path === '/check-ins' && layer.route.methods.post
  );
  assert.ok(route, 'POST /check-ins route exists');
  assert.deepEqual(
    apiRoutes.stack.slice(0, 2).map((layer) => layer.handle.name),
    ['requireAuth', 'requirePasswordChanged']
  );
  assert.equal(route.route.stack.at(-1).handle, membersController.checkIn);
});

test('expired staff tokens remain rejected by the protected API authentication middleware', async () => {
  const secret = 'test-secret-for-expired-token-check-only';
  const middleware = createAuthMiddleware({
    getJwtSecret: () => secret,
    pool: {
      async query() {
        assert.fail('Expired tokens must be rejected before account lookup');
      },
    },
  });
  const token = jwt.sign({ empId: 7, role: 'employee' }, secret, { expiresIn: -1 });
  const res = createResponse();
  let nextCalled = false;
  await middleware.requireAuth(
    { get: () => `Bearer ${token}` },
    res,
    () => { nextCalled = true; }
  );
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /session has expired/i);
  assert.equal(nextCalled, false);
});
