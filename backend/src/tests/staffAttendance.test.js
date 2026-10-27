const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = 'postgres://127.0.0.1:5432/fitnexx_test';
const staffAttendanceModel = require('../models/staffAttendance.model');
const staffAttendanceController = require('../controllers/staffAttendance.controller');
const pool = require('../config/db');
const apiRoutes = require('../routes/api.route');
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

test('employee login attendance uses a parameterized insert with retry-safe open-shift conflict handling', async () => {
  const originalQuery = pool.query;
  const requests = [];
  pool.query = async (sql, values) => {
    requests.push({ sql, values });
    return { rows: [{ staff_shift_attendance_id: 8, emp_id: values[0] }], rowCount: 1 };
  };
  try {
    const first = await staffAttendanceModel.recordLogin(42);
    const retry = await staffAttendanceModel.recordLogin(42);
    assert.equal(first.emp_id, 42);
    assert.equal(retry.emp_id, 42);
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0].values, [42]);
    assert.match(requests[0].sql, /INSERT INTO staff_shift_attendance \(emp_id\)/);
    assert.match(requests[0].sql, /ON CONFLICT \(emp_id\) WHERE time_out IS NULL/);
    assert.match(requests[0].sql, /DO UPDATE SET emp_id = EXCLUDED\.emp_id/);
    assert.doesNotMatch(requests[0].sql, /CURRENT_DATE|new Date/i);
  } finally {
    pool.query = originalQuery;
  }
});

test('logout closes only an open row for the authenticated employee and retries do not update completed shifts', async () => {
  const originalQuery = pool.query;
  const requests = [];
  let updateCount = 0;
  pool.query = async (sql, values) => {
    requests.push({ sql, values });
    updateCount += 1;
    return {
      rows: updateCount === 1 ? [{
        emp_id: values[0],
        time_out: '2026-10-28T00:00:00.000Z',
      }] : [],
      rowCount: updateCount === 1 ? 1 : 0,
    };
  };
  try {
    const closedShift = await staffAttendanceModel.recordLogout(42);
    assert.equal(closedShift.emp_id, 42);
    assert.equal(closedShift.time_out, '2026-10-28T00:00:00.000Z');
    assert.equal(await staffAttendanceModel.recordLogout(42), null);
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0].values, [42]);
    assert.match(requests[0].sql, /SET time_out = CURRENT_TIMESTAMP/);
    assert.match(requests[0].sql, /WHERE emp_id = \$1 AND time_out IS NULL/);
  } finally {
    pool.query = originalQuery;
  }
});

test('attendance listing returns named staff, Manila date, elapsed hours and derived status in newest-first order', async () => {
  const originalQuery = pool.query;
  let request;
  pool.query = async (sql, values) => {
    request = { sql, values };
    return {
      rows: [{
        staff_name: 'Staff User',
        attendance_date: '2026-10-27',
        time_in: '2026-10-27T15:00:00.000Z',
        time_out: '2026-10-28T01:00:00.000Z',
        total_hours: '10.00',
        status: 'Completed',
      }],
    };
  };
  try {
    const rows = await staffAttendanceModel.listRecent(50);
    assert.deepEqual(request.values, [50]);
    assert.match(request.sql, /JOIN emp_acc ea ON ea\.emp_id = sa\.emp_id/);
    assert.match(request.sql, /round\(\(extract\(epoch FROM \(sa\.time_out - sa\.time_in\)\) \/ 3600\)::numeric, 2\)/);
    assert.match(request.sql, /ORDER BY sa\.time_in DESC, sa\.staff_shift_attendance_id DESC/);
    assert.equal(rows[0].total_hours, '10.00');
    assert.equal(rows[0].status, 'Completed');
    assert.equal(new Date(rows[0].time_out) - new Date(rows[0].time_in), 10 * 60 * 60 * 1000);
  } finally {
    pool.query = originalQuery;
  }
});

test('staff attendance endpoint validates limit and returns rows', async () => {
  const originalListRecent = staffAttendanceModel.listRecent;
  const requests = [];
  try {
    staffAttendanceModel.listRecent = async (limit) => {
      requests.push(limit);
      return [{ staff_shift_attendance_id: 1, staff_name: 'Staff User' }];
    };
    const response = createResponse();
    let error;
    await staffAttendanceController.list({ query: { limit: '25' } }, response, (caught) => { error = caught; });
    assert.equal(error, undefined);
    assert.deepEqual(requests, [25]);
    assert.equal(response.body.count, 1);
    assert.equal(response.body.data[0].staff_name, 'Staff User');

    let invalidError;
    await staffAttendanceController.list(
      { query: { limit: '501' } },
      createResponse(),
      (caught) => { invalidError = caught; }
    );
    assert.equal(invalidError.status, 400);
    assert.deepEqual(requests, [25]);
  } finally {
    staffAttendanceModel.listRecent = originalListRecent;
  }
});

test('staff attendance endpoint is restricted to admins', () => {
  const route = apiRoutes.stack.find(
    (layer) => layer.route?.path === '/staff-attendance' && layer.route.methods.get
  );
  assert.ok(route);
  assert.equal(route.route.stack.length, 2);
  const [adminOnly] = route.route.stack.map((layer) => layer.handle);
  const employeeResponse = createResponse();
  let employeeReached = false;
  adminOnly({ user: { role: 'employee' } }, employeeResponse, () => { employeeReached = true; });
  assert.equal(employeeResponse.statusCode, 403);
  assert.equal(employeeReached, false);

  const adminResponse = createResponse();
  let adminReached = false;
  adminOnly({ user: { role: 'admin' } }, adminResponse, () => { adminReached = true; });
  assert.equal(adminReached, true);
  assert.deepEqual(
    apiRoutes.stack.slice(0, 2).map((layer) => layer.handle.name),
    ['requireAuth', 'requirePasswordChanged']
  );
});

test('additive migration defines one open shift per employee with Manila attendance date and timestamp fields', () => {
  const migration = fs.readFileSync(
    path.join(__dirname, '../migrations/003_staff_shift_attendance.sql'),
    'utf8'
  );
  assert.match(migration, /CREATE TABLE IF NOT EXISTS staff_shift_attendance/);
  assert.match(migration, /emp_id integer NOT NULL REFERENCES emp_acc\(emp_id\)/);
  assert.match(migration, /time_in timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP/);
  assert.match(migration, /time_out timestamp with time zone/);
  assert.match(migration, /CURRENT_TIMESTAMP AT TIME ZONE 'Asia\/Manila'/);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS[\s\S]*WHERE time_out IS NULL/);
  assert.match(migration, /CHECK \(time_out IS NULL OR time_out >= time_in\)/);
});
