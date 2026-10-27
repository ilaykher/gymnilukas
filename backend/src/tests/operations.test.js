const assert = require('node:assert/strict');
const test = require('node:test');

const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = 'postgres://127.0.0.1:5432/fitnexx_test';
const operationsController = require('../controllers/operations.controller');
const operationsModel = require('../models/operations.model');
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

async function callActivity(role) {
  const res = createResponse();
  let error;
  await operationsController.activity(
    { query: {}, user: { role } },
    res,
    (caught) => { error = caught; }
  );
  return { res, error };
}

test('employee activity requests are limited to attendance actions; admin retains full activity', async () => {
  const originalListActivity = operationsModel.listActivity;
  const requests = [];
  try {
    operationsModel.listActivity = async (filters) => {
      requests.push(filters);
      return [];
    };

    const employee = await callActivity('employee');
    assert.equal(employee.error, undefined);
    assert.deepEqual(requests[0].actions, ['member.checked_in', 'walk_in.registered']);

    const admin = await callActivity('admin');
    assert.equal(admin.error, undefined);
    assert.equal(requests[1].actions, null);
  } finally {
    operationsModel.listActivity = originalListActivity;
  }
});

test('activity date filters reject impossible calendar dates before model access', async () => {
  const originalListActivity = operationsModel.listActivity;
  let modelCalled = false;
  try {
    operationsModel.listActivity = async () => {
      modelCalled = true;
      return [];
    };
    const res = createResponse();
    let error;
    await operationsController.activity(
      { query: { from: '2026-02-31' }, user: { role: 'admin' } },
      res,
      (caught) => { error = caught; }
    );
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Dates must use YYYY-MM-DD format.');
    assert.equal(modelCalled, false);
  } finally {
    operationsModel.listActivity = originalListActivity;
  }
});

test('activity endpoint is authenticated and limited to admin or employee roles', () => {
  const route = apiRoutes.stack.find(
    (layer) => layer.route?.path === '/activity' && layer.route.methods.get
  );
  assert.ok(route, 'GET /activity route exists');
  assert.equal(route.route.stack.length, 2, 'route permits both admins and employees');
  const [requireAllowedRole] = route.route.stack.map((layer) => layer.handle);
  const employeeResponse = createResponse();
  let employeeReached = false;
  requireAllowedRole({ user: { role: 'employee' } }, employeeResponse, () => { employeeReached = true; });
  assert.equal(employeeReached, true);

  const adminResponse = createResponse();
  let adminReached = false;
  requireAllowedRole({ user: { role: 'admin' } }, adminResponse, () => { adminReached = true; });
  assert.equal(adminReached, true);

  const otherRoleResponse = createResponse();
  let otherRoleReached = false;
  requireAllowedRole({ user: { role: 'member' } }, otherRoleResponse, () => { otherRoleReached = true; });
  assert.equal(otherRoleResponse.statusCode, 403);
  assert.equal(otherRoleReached, false);

  assert.deepEqual(
    apiRoutes.stack.slice(0, 2).map((layer) => layer.handle.name),
    ['requireAuth', 'requirePasswordChanged']
  );
});

test('activity model applies the employee action allowlist in parameterized SQL', async () => {
  const originalQuery = pool.query;
  let request;
  pool.query = async (sql, values) => {
    request = { sql, values };
    return { rows: [] };
  };
  try {
    await operationsModel.listActivity({
      from: null,
      to: null,
      limit: 200,
      actions: ['member.checked_in', 'walk_in.registered'],
    });
    assert.match(request.sql, /l\.activity_action = ANY\(\$4::text\[\]\)/);
    assert.deepEqual(request.values, [null, null, 200, ['member.checked_in', 'walk_in.registered']]);
  } finally {
    pool.query = originalQuery;
  }
});

test('staff dashboard activity selects the membership that covers the Manila check-in date', async () => {
  const originalQuery = pool.query;
  const queries = [];
  pool.query = async (sql, values) => {
    queries.push({ sql, values });
    if (sql.includes("CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'")) {
      return { rows: [{ today: '2026-10-28' }] };
    }
    if (sql.includes('FROM activity_logs l')) {
      return {
        rows: [{
          entity_type: 'member',
          entity_id: 24,
          membership_expires_on: '2026-11-27',
        }],
      };
    }
    return {
      rows: [{
        member_checkins_today: 1,
        walk_ins_today: 1,
        revenue_today: 250,
        memberships_expiring_today: 0,
      }],
    };
  };
  try {
    const data = await operationsModel.getDashboard();
    const activityQuery = queries.find(({ sql }) => sql.includes('FROM activity_logs l'));
    assert.ok(activityQuery);
    assert.match(activityQuery.sql, /LEFT JOIN LATERAL/);
    assert.match(activityQuery.sql, /ms\.member_id = l\.entity_id/);
    assert.match(activityQuery.sql, /ms\.mbs_start_date <= \(CASE[\s\S]*l\.activity_date_created AT TIME ZONE 'Asia\/Manila'[\s\S]*\)::date/);
    assert.match(activityQuery.sql, /ms\.mbs_expiration_date >= \(CASE[\s\S]*l\.activity_date_created AT TIME ZONE 'Asia\/Manila'[\s\S]*\)::date/);
    assert.match(activityQuery.sql, /ORDER BY ms\.mbs_expiration_date DESC, ms\.membership_id DESC/);
    assert.match(activityQuery.sql, /to_char\(member_membership\.mbs_expiration_date, 'YYYY-MM-DD'\) AS membership_expires_on/);
    assert.match(activityQuery.sql, /l\.activity_date_created AT TIME ZONE 'Asia\/Manila'[\s\S]*>= \$1::date::timestamp/);
    assert.match(activityQuery.sql, /< \(\$1::date \+ 1\)::timestamp/);
    assert.deepEqual(activityQuery.values, ['2026-10-28']);
    assert.deepEqual(data.activity, [{
      entity_type: 'member',
      entity_id: 24,
      membership_expires_on: '2026-11-27',
    }]);
  } finally {
    pool.query = originalQuery;
  }
});

test('daily dashboard statistics use one Manila date and half-open local-day bounds for timestamp records', async () => {
  const originalQuery = pool.query;
  const queries = [];
  pool.query = async (sql, values) => {
    queries.push({ sql, values });
    if (sql.includes("CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'")) {
      return { rows: [{ today: '2026-10-28' }] };
    }
    if (sql.includes('FROM activity_logs l')) return { rows: [] };
    return {
      rows: [{
        member_checkins_today: 1,
        walk_ins_today: 2,
        revenue_today: '250.00',
        memberships_expiring_today: 3,
      }],
    };
  };
  try {
    const data = await operationsModel.getDashboard();
    const stats = queries.find(({ sql }) => sql.includes('member_checkins_today'));
    assert.ok(stats);
    assert.deepEqual(stats.values, ['2026-10-28']);
    assert.match(stats.sql, /atd_time_in AT TIME ZONE 'Asia\/Manila'[\s\S]*>= bounds\.today::timestamp/);
    assert.match(stats.sql, /atd_time_in AT TIME ZONE 'Asia\/Manila'[\s\S]*< \(bounds\.today \+ 1\)::timestamp/);
    assert.match(stats.sql, /wiatd_time_in AT TIME ZONE 'Asia\/Manila'[\s\S]*>= bounds\.today::timestamp/);
    assert.match(stats.sql, /wiatd_time_in AT TIME ZONE 'Asia\/Manila'[\s\S]*< \(bounds\.today \+ 1\)::timestamp/);
    assert.match(stats.sql, /FROM walk_in_attendance, bounds/);
    assert.match(stats.sql, /FROM member_attendance, bounds/);
    assert.match(stats.sql, /transaction_date_created AT TIME ZONE 'Asia\/Manila'[\s\S]*>= bounds\.today::timestamp/);
    assert.match(stats.sql, /transaction_date_created AT TIME ZONE 'Asia\/Manila'[\s\S]*< \(bounds\.today \+ 1\)::timestamp/);
    assert.match(stats.sql, /mbs_expiration_date = bounds\.today/);
    assert.doesNotMatch(stats.sql, /CURRENT_DATE/);
    for (const { sql } of queries) {
      assert.doesNotMatch(sql, /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP)\b/i);
    }
    assert.deepEqual(data, {
      member_checkins_today: 1,
      walk_ins_today: 2,
      revenue_today: '250.00',
      memberships_expiring_today: 3,
      activity: [],
    });
  } finally {
    pool.query = originalQuery;
  }
});

test('dashboard API preserves the canonical PostgreSQL date string in its activity rows', async () => {
  const originalGetDashboard = operationsModel.getDashboard;
  const expiry = '2026-11-27';
  try {
    operationsModel.getDashboard = async () => ({
      member_checkins_today: 1,
      walk_ins_today: 0,
      revenue_today: '250.00',
      memberships_expiring_today: 0,
      activity: [{
        activity_id: 22,
        activity_action: 'member.checked_in',
        entity_type: 'member',
        entity_id: 12,
        membership_expires_on: expiry,
      }],
    });
    const response = createResponse();
    let error;
    await operationsController.dashboard({}, response, (caught) => { error = caught; });
    assert.equal(error, undefined);
    assert.equal(response.body.data.activity[0].membership_expires_on, expiry);
    assert.equal(typeof response.body.data.activity[0].membership_expires_on, 'string');
  } finally {
    operationsModel.getDashboard = originalGetDashboard;
  }
});

test('report query groups by selected granularity and uses inclusive Manila date bounds', async () => {
  const originalQuery = pool.query;
  const queries = [];
  pool.query = async (sql, values) => {
    queries.push({ sql, values });
    return {
      rows: [
        { bucket: '2026-01-01', membership: '100.00', walk_in: '25.00' },
        { bucket: '2026-02-01', membership: '200.00', walk_in: '50.00' },
      ],
    };
  };
  try {
    const monthly = await operationsModel.getReport('Monthly', '2026-01-01', '2026-02-28');
    assert.deepEqual(monthly.labels, ['Jan', 'Feb']);
    assert.deepEqual(monthly.membership, [100, 200]);
    assert.deepEqual(monthly.walkIn, [25, 50]);
    assert.deepEqual(queries[0].values, ['2026-01-01', '2026-02-28']);
    assert.match(queries[0].sql, /INTERVAL '1 month'/);
    assert.match(queries[0].sql, /date_trunc\('month'/);
    assert.match(queries[0].sql, /< \(\$2::date \+ 1\)::timestamp/);
    assert.match(queries[0].sql, /AT TIME ZONE 'Asia\/Manila'/);

    await operationsModel.getReport('Daily', '2026-01-31', '2026-02-01');
    assert.match(queries[1].sql, /INTERVAL '1 day'/);
    await operationsModel.getReport('Yearly', '2024-01-01', '2026-12-31');
    assert.match(queries[2].sql, /INTERVAL '1 year'/);
    assert.match(queries[2].sql, /date_trunc\('year'/);
  } finally {
    pool.query = originalQuery;
  }
});

test('filtered transactions use the same inclusive date range and Manila calendar boundaries', async () => {
  const originalQuery = pool.query;
  let request;
  pool.query = async (sql, values) => {
    request = { sql, values };
    return { rows: [] };
  };
  try {
    await operationsModel.listTransactions({ from: '2026-10-21', to: '2026-10-27' });
    assert.deepEqual(request.values, ['2026-10-21', '2026-10-27']);
    assert.match(request.sql, /< \(\$2::date \+ 1\)::timestamp/);
    assert.match(request.sql, /AT TIME ZONE 'Asia\/Manila'/);
  } finally {
    pool.query = originalQuery;
  }
});

test('report controller rejects reversed ranges and forwards valid mode and bounds', async () => {
  const originalGetReport = operationsModel.getReport;
  const requests = [];
  try {
    operationsModel.getReport = async (...args) => {
      requests.push(args);
      return { labels: [], membership: [], walkIn: [] };
    };

    const invalidResponse = createResponse();
    let invalidError;
    await operationsController.report(
      { query: { timeframe: 'Monthly', from: '2026-03-01', to: '2026-01-31' } },
      invalidResponse,
      (error) => { invalidError = error; }
    );
    assert.equal(invalidError.status, 400);
    assert.equal(requests.length, 0);

    const incompleteResponse = createResponse();
    let incompleteError;
    await operationsController.report(
      { query: { timeframe: 'Yearly', from: '2024-06-01', to: '2026-12-31' } },
      incompleteResponse,
      (error) => { incompleteError = error; }
    );
    assert.equal(incompleteError.status, 400);
    assert.equal(requests.length, 0);

    const validResponse = createResponse();
    let validError;
    await operationsController.report(
      { query: { timeframe: 'Yearly', from: '2024-01-01', to: '2026-12-31' } },
      validResponse,
      (error) => { validError = error; }
    );
    assert.equal(validError, undefined);
    assert.deepEqual(requests[0], ['Yearly', '2024-01-01', '2026-12-31']);
  } finally {
    operationsModel.getReport = originalGetReport;
  }
});

test('transaction controller rejects invalid or incomplete date ranges', async () => {
  const originalListTransactions = operationsModel.listTransactions;
  let modelCalled = false;
  try {
    operationsModel.listTransactions = async () => {
      modelCalled = true;
      return [];
    };
    const response = createResponse();
    let error;
    await operationsController.transactions(
      { query: { from: '2026-10-21' } },
      response,
      (caught) => { error = caught; }
    );
    assert.equal(error.status, 400);
    assert.equal(modelCalled, false);
  } finally {
    operationsModel.listTransactions = originalListTransactions;
  }
});
