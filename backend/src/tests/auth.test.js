const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = 'postgresql://unit_test:unit_test@127.0.0.1:5432/fitnexx_test';
const authController = require('../controllers/auth.controller');
const authModel = require('../models/auth.model');
const staffAttendanceModel = require('../models/staffAttendance.model');
const employeesModel = require('../models/employees.model');
const pool = require('../config/db');
const authRoutes = require('../routes/auth.route');
const apiRoutes = require('../routes/api.route');
const { createAuthMiddleware, requirePasswordChanged } = require('../middleware/auth');
if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
else process.env.DATABASE_URL = originalDatabaseUrl;

const TEST_SECRET = 'unit-test-secret-which-is-never-used-outside-tests';

function createRequest(token) {
  return {
    get(name) {
      return name.toLowerCase() === 'authorization' && token ? `Bearer ${token}` : '';
    },
  };
}

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

async function authorize({ role = 'employee', status = 'active', mustChange = false, secret = TEST_SECRET } = {}) {
  let queryCount = 0;
  const middleware = createAuthMiddleware({
    getJwtSecret: () => TEST_SECRET,
    pool: {
      async query() {
        queryCount += 1;
        return {
          rows: [{
            role,
            status,
            must_change_password: mustChange,
            username: 'test-user',
            name: 'Test User',
          }],
        };
      },
    },
  });
  const token = jwt.sign({ empId: 10, role }, secret);
  const req = createRequest(token);
  const res = createResponse();
  let nextError;
  let nextCalls = 0;
  await middleware.requireAuth(req, res, (error) => {
    nextCalls += 1;
    nextError = error;
  });
  return { middleware, req, res, nextError, nextCalls, queryCount };
}

function routeHandlers(router, path, method) {
  const routeLayer = router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]);
  assert.ok(routeLayer, `${method.toUpperCase()} ${path} route exists`);
  return routeLayer.route.stack.map((layer) => layer.handle);
}

test('forced password change blocks protected features but permits the password-change route', async () => {
  const { middleware, req, res, nextCalls } = await authorize({ mustChange: true });
  assert.equal(nextCalls, 1);

  const gateResponse = createResponse();
  let featureReached = false;
  middleware.requirePasswordChanged(req, gateResponse, () => { featureReached = true; });
  assert.equal(gateResponse.statusCode, 403);
  assert.equal(gateResponse.body.code, 'PASSWORD_CHANGE_REQUIRED');
  assert.equal(featureReached, false);

  const handlers = routeHandlers(authRoutes, '/change-password', 'post');
  assert.equal(handlers.length, 2);
  assert.equal(handlers[0].name, 'requireAuth');
  assert.notEqual(handlers[0], requirePasswordChanged);
  assert.deepEqual(
    apiRoutes.stack.slice(0, 2).map((layer) => layer.handle.name),
    ['requireAuth', 'requirePasswordChanged']
  );
});

test('password-change handler rejects an incorrect current password and accepts the correct one', async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;
  const originalGetAccount = authModel.getAccountWithPassword;
  const originalUpdatePassword = authModel.updatePassword;
  const currentHash = await bcrypt.hash('CurrentPass9!', 4);
  let updatedHash;
  try {
    authModel.getAccountWithPassword = async () => ({
      auth_password: currentHash,
      status: 'active',
      role: 'employee',
      name: 'Test User',
      email: 'test@example.invalid',
      username: 'test-user',
    });
    authModel.updatePassword = async (_empId, hash) => { updatedHash = hash; };

    let error;
    await authController.changePassword(
      { user: { empId: 10 }, body: { currentPassword: 'WrongPass9!', newPassword: 'NewPass42!' } },
      createResponse(),
      (caught) => { error = caught; }
    );
    assert.equal(error.status, 401);
    assert.equal(updatedHash, undefined);

    error = undefined;
    const response = createResponse();
    await authController.changePassword(
      { user: { empId: 10 }, body: { currentPassword: 'CurrentPass9!', newPassword: 'NewPass42!' } },
      response,
      (caught) => { error = caught; }
    );
    assert.equal(error, undefined);
    assert.equal(response.statusCode, 200);
    assert.match(updatedHash, /^\$2[aby]\$12\$/);
    assert.equal(await bcrypt.compare('NewPass42!', updatedHash), true);
    assert.equal(jwt.verify(response.body.data.token, TEST_SECRET).mustChangePassword, false);
  } finally {
    authModel.getAccountWithPassword = originalGetAccount;
    authModel.updatePassword = originalUpdatePassword;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('inactive accounts cannot authenticate protected requests', async () => {
  const { res, nextCalls, queryCount } = await authorize({ status: 'inactive' });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalls, 0);
  assert.equal(queryCount, 1);
});

test('admin, staff, and member role restrictions are enforced by backend middleware', async () => {
  const admin = await authorize({ role: 'admin' });
  const staff = await authorize({ role: 'employee' });
  const member = await authorize({ role: 'member' });

  const adminOnly = admin.middleware.requireRole('admin');
  let adminReached = false;
  adminOnly(admin.req, createResponse(), () => { adminReached = true; });
  assert.equal(adminReached, true);

  const staffAttempt = createResponse();
  let staffReached = false;
  admin.middleware.requireRole('admin')(staff.req, staffAttempt, () => { staffReached = true; });
  assert.equal(staffAttempt.statusCode, 403);
  assert.equal(staffReached, false);

  const employeeOnly = staff.middleware.requireRole('employee');
  let employeeReached = false;
  employeeOnly(staff.req, createResponse(), () => { employeeReached = true; });
  assert.equal(employeeReached, true);

  assert.equal(member.res.statusCode, 401);
  assert.equal(member.queryCount, 0);
});

test('tokens signed with an old JWT secret fail under the rotated verifier secret', async () => {
  const middleware = createAuthMiddleware({
    getJwtSecret: () => 'rotated-secret-used-only-in-this-test',
    pool: { async query() { assert.fail('Old-secret token must fail before database access'); } },
  });
  const oldToken = jwt.sign({ empId: 10, role: 'admin' }, 'old-secret-used-only-in-this-test');
  const res = createResponse();
  let nextCalls = 0;
  await middleware.requireAuth(createRequest(oldToken), res, () => { nextCalls += 1; });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalls, 0);
});

test('inactive account login is rejected by the login controller', async () => {
  const originalFindAccount = authModel.findAccount;
  const hash = await bcrypt.hash('ValidPass9!', 4);
  try {
    authModel.findAccount = async () => ({
      auth_password: hash,
      status: 'inactive',
      emp_id: 10,
      role: 'employee',
      auth_must_change_password: false,
    });
    const res = createResponse();
    let error;
    await authController.login(
      { body: { username: 'test-user', password: 'ValidPass9!' } },
      res,
      (caught) => { error = caught; }
    );
    assert.equal(error.status, 401);
    assert.equal(res.body, null);
  } finally {
    authModel.findAccount = originalFindAccount;
  }
});

test('admin login retains its admin role and admin landing route', async () => {
  const previousSecret = process.env.JWT_SECRET;
  const originalFindAccount = authModel.findAccount;
  process.env.JWT_SECRET = TEST_SECRET;
  const hash = await bcrypt.hash('AdminPass9!', 4);
  try {
    authModel.findAccount = async (identifier) => {
      assert.ok(['admin@example.invalid', 'admin.login'].includes(identifier));
      return {
        auth_username: 'admin.login',
        auth_password: hash,
        auth_must_change_password: false,
        role: 'admin',
        emp_id: 3,
        emp_name: 'Admin User',
        emp_email: 'admin@example.invalid',
        status: 'active',
      };
    };
    for (const identifier of ['admin@example.invalid', 'admin.login']) {
      const response = createResponse();
      let error;
      await authController.login(
        { body: { username: identifier, password: 'AdminPass9!' } },
        response,
        (caught) => { error = caught; }
      );
      assert.equal(error, undefined);
      assert.equal(response.body.data.user.role, 'admin');
      assert.equal(jwt.verify(response.body.data.token, TEST_SECRET).role, 'admin');
    }

    const clientRoot = path.join(__dirname, '../../../client/src');
    const loginSource = fs.readFileSync(path.join(clientRoot, 'pages/Login.jsx'), 'utf8');
    assert.match(loginSource, /user\.role === 'admin' \? '\/admin' : '\/dashboard'/);
  } finally {
    authModel.findAccount = originalFindAccount;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('successful employee login records a shift using the verified employee identity before returning a token', async () => {
  const previousSecret = process.env.JWT_SECRET;
  const originalFindAccount = authModel.findAccount;
  const originalRecordLogin = staffAttendanceModel.recordLogin;
  process.env.JWT_SECRET = TEST_SECRET;
  let attendanceEmpId;
  const hash = await bcrypt.hash('StaffPass9!', 4);
  try {
    authModel.findAccount = async () => ({
      auth_username: 'trusted-staff',
      auth_password: hash,
      auth_must_change_password: false,
      role: 'employee',
      emp_id: 42,
      emp_name: 'Staff User',
      emp_email: 'staff@example.invalid',
      status: 'active',
    });
    staffAttendanceModel.recordLogin = async (empId) => {
      attendanceEmpId = empId;
      return { staff_shift_attendance_id: 1 };
    };
    const response = createResponse();
    let error;
    await authController.login(
      { body: { username: 'trusted-staff', password: 'StaffPass9!' } },
      response,
      (caught) => { error = caught; }
    );
    assert.equal(error, undefined);
    assert.equal(attendanceEmpId, 42);
    assert.equal(jwt.verify(response.body.data.token, TEST_SECRET).empId, 42);
  } finally {
    authModel.findAccount = originalFindAccount;
    staffAttendanceModel.recordLogin = originalRecordLogin;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('failed employee login and admin login do not record staff attendance', async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;
  const originalFindAccount = authModel.findAccount;
  const originalRecordLogin = staffAttendanceModel.recordLogin;
  const hash = await bcrypt.hash('StaffPass9!', 4);
  let recorded = 0;
  try {
    staffAttendanceModel.recordLogin = async () => { recorded += 1; };
    authModel.findAccount = async () => ({
      auth_password: hash,
      auth_must_change_password: false,
      role: 'employee',
      emp_id: 42,
      emp_name: 'Staff User',
      auth_username: 'trusted-staff',
      status: 'active',
    });
    let error;
    await authController.login(
      { body: { username: 'trusted-staff', password: 'WrongPass9!' } },
      createResponse(),
      (caught) => { error = caught; }
    );
    assert.equal(error.status, 401);
    assert.equal(recorded, 0);

    authModel.findAccount = async () => ({
      auth_password: hash,
      auth_must_change_password: false,
      role: 'admin',
      emp_id: 3,
      emp_name: 'Admin User',
      auth_username: 'admin-user',
      status: 'active',
    });
    const response = createResponse();
    await authController.login(
      { body: { username: 'admin-user', password: 'StaffPass9!' } },
      response,
      (caught) => { if (caught) throw caught; }
    );
    assert.equal(response.body.data.user.role, 'admin');
    assert.equal(recorded, 0);
  } finally {
    authModel.findAccount = originalFindAccount;
    staffAttendanceModel.recordLogin = originalRecordLogin;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('attendance write failure prevents a partially authenticated login response', async () => {
  const previousSecret = process.env.JWT_SECRET;
  const originalFindAccount = authModel.findAccount;
  const originalRecordLogin = staffAttendanceModel.recordLogin;
  process.env.JWT_SECRET = TEST_SECRET;
  const hash = await bcrypt.hash('StaffPass9!', 4);
  try {
    authModel.findAccount = async () => ({
      auth_password: hash,
      auth_must_change_password: false,
      role: 'employee',
      emp_id: 42,
      emp_name: 'Staff User',
      auth_username: 'trusted-staff',
      status: 'active',
    });
    staffAttendanceModel.recordLogin = async () => { throw new Error('database unavailable'); };
    const response = createResponse();
    let error;
    await authController.login(
      { body: { username: 'trusted-staff', password: 'StaffPass9!' } },
      response,
      (caught) => { error = caught; }
    );
    assert.equal(response.body, null);
    assert.ok(error);
  } finally {
    authModel.findAccount = originalFindAccount;
    staffAttendanceModel.recordLogin = originalRecordLogin;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('logout closes only the authenticated employee shift and is safe for admin accounts', async () => {
  const originalRecordLogout = staffAttendanceModel.recordLogout;
  const employees = [];
  try {
    const logoutHandlers = routeHandlers(authRoutes, '/logout', 'post');
    assert.equal(logoutHandlers[0].name, 'requireAuth');
    assert.equal(logoutHandlers[1], authController.logout);

    staffAttendanceModel.recordLogout = async (empId) => { employees.push(empId); };
    const employeeResponse = createResponse();
    await authController.logout({ user: { empId: 42, role: 'employee' } }, employeeResponse, (error) => { if (error) throw error; });
    const adminResponse = createResponse();
    await authController.logout({ user: { empId: 3, role: 'admin' } }, adminResponse, (error) => { if (error) throw error; });
    assert.deepEqual(employees, [42]);
    assert.deepEqual(employeeResponse.body, { success: true });
    assert.deepEqual(adminResponse.body, { success: true });
  } finally {
    staffAttendanceModel.recordLogout = originalRecordLogout;
  }
});

test('a newly created employee can log in by email or username and reach employee routes', async () => {
  const previousSecret = process.env.JWT_SECRET;
  const originalConnect = pool.connect;
  const originalQuery = pool.query;
  const originalRecordLogin = staffAttendanceModel.recordLogin;
  const employeePassword = 'StaffPass9!';
  const employeeEmail = 'new.staff@example.invalid';
  const employeeUsername = 'new.staff';
  let loginValues;
  let loginInsertSql;
  const attendanceLogins = [];
  let accountStatus = 'active';
  process.env.JWT_SECRET = TEST_SECRET;

  const createdEmployee = {
    emp_id: 24,
    emp_name: 'New Staff',
    emp_email: employeeEmail,
    emp_phone_num: '09123456789',
    emp_status: 'active',
    emp_job_title: 'Front-Desk',
  };
  const transactionClient = {
    async query(sql, values = []) {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
      if (sql.includes('pg_advisory_xact_lock') || sql.includes('SELECT la.emp_id')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT INTO emp_acc')) return { rows: [createdEmployee], rowCount: 1 };
      if (sql.includes('INSERT INTO login_auth')) {
        loginValues = values;
        loginInsertSql = sql;
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO activity_logs')) return { rows: [], rowCount: 1 };
      assert.fail(`Unexpected transaction query: ${sql}`);
    },
    release() {},
  };

  pool.connect = async () => transactionClient;
  staffAttendanceModel.recordLogin = async (empId) => { attendanceLogins.push(empId); };
  pool.query = async (sql, values) => {
    assert.match(sql, /FROM login_auth la\s+JOIN emp_acc ea ON ea\.emp_id = la\.emp_id/);
    assert.match(sql, /lower\(la\.auth_username\) = lower\(\$1\)/);
    assert.match(sql, /lower\(ea\.emp_email\) = lower\(\$1\)/);
    const storedUsername = loginValues[0];
    if (![storedUsername, employeeEmail].includes(String(values[0]).toLowerCase())) return { rows: [] };
    return {
      rows: [{
        auth_username: storedUsername,
        auth_password: loginValues[1],
        auth_must_change_password: false,
        role: 'employee',
        emp_id: createdEmployee.emp_id,
        emp_name: createdEmployee.emp_name,
        emp_email: createdEmployee.emp_email,
        status: accountStatus,
      }],
    };
  };

  try {
    const created = await employeesModel.createEmployee({
      name: createdEmployee.emp_name,
      email: employeeEmail,
      phone: createdEmployee.emp_phone_num,
      jobTitle: createdEmployee.emp_job_title,
      isActive: true,
      username: employeeUsername,
      password: employeePassword,
      actorId: 7,
    });
    assert.equal(created.auth_username, employeeUsername);
    assert.equal(created.auth_role, 'employee');
    assert.equal(loginValues[0], employeeUsername);
    assert.match(loginInsertSql, /'employee'::auth_role/);
    assert.equal(loginValues[2], createdEmployee.emp_id);
    assert.match(loginValues[1], /^\$2[aby]\$12\$/);
    assert.equal(await bcrypt.compare(employeePassword, loginValues[1]), true);

    const loginResults = [];
    for (const identifier of [employeeEmail, employeeUsername, employeeUsername.toUpperCase()]) {
      const loginResponse = createResponse();
      let loginError;
      await authController.login(
        { body: { username: identifier, password: employeePassword } },
        loginResponse,
        (error) => { loginError = error; }
      );
      assert.equal(loginError, undefined);
      assert.equal(loginResponse.statusCode, 200);
      assert.equal(loginResponse.body.data.user.role, 'employee');
      assert.equal(loginResponse.body.data.user.username, employeeUsername);
      assert.equal(jwt.verify(loginResponse.body.data.token, TEST_SECRET).role, 'employee');
      assert.equal(JSON.stringify(loginResponse.body).includes(employeePassword), false);
      loginResults.push(loginResponse.body.data.user.empId);
    }
    assert.deepEqual(loginResults, [createdEmployee.emp_id, createdEmployee.emp_id, createdEmployee.emp_id]);
    assert.deepEqual(attendanceLogins, [24, 24, 24]);

    const employeeMiddleware = createAuthMiddleware({
      getJwtSecret: () => TEST_SECRET,
      pool: {
        async query() {
          return {
            rows: [{
              role: 'employee',
              status: 'active',
              must_change_password: false,
              username: employeeUsername,
              name: createdEmployee.emp_name,
            }],
          };
        },
      },
    });
    const protectedResponse = createResponse();
    const staffLogin = createResponse();
    await authController.login(
      { body: { username: employeeUsername, password: employeePassword } },
      staffLogin,
      (error) => { if (error) throw error; }
    );
    const protectedRequest = createRequest(staffLogin.body.data.token);
    let protectedRouteReached = false;
    await employeeMiddleware.requireAuth(protectedRequest, protectedResponse, () => {
      employeeMiddleware.requireRole('employee')(protectedRequest, protectedResponse, () => {
        protectedRouteReached = true;
      });
    });
    assert.equal(protectedRouteReached, true);

    for (const identifier of [employeeEmail, employeeUsername]) {
      const invalidPasswordResponse = createResponse();
      let invalidPasswordError;
      await authController.login(
        { body: { username: identifier, password: 'WrongPass9!' } },
        invalidPasswordResponse,
        (error) => { invalidPasswordError = error; }
      );
      assert.equal(invalidPasswordError.status, 401);
    }

    accountStatus = 'inactive';
    for (const identifier of [employeeEmail, employeeUsername]) {
      const inactiveResponse = createResponse();
      let inactiveError;
      await authController.login(
        { body: { username: identifier, password: employeePassword } },
        inactiveResponse,
        (error) => { inactiveError = error; }
      );
      assert.equal(inactiveError.status, 401);
    }

    const clientRoot = path.join(__dirname, '../../../client/src');
    const loginSource = fs.readFileSync(path.join(clientRoot, 'pages/Login.jsx'), 'utf8');
    const appSource = fs.readFileSync(path.join(clientRoot, 'App.jsx'), 'utf8');
    const authContextSource = fs.readFileSync(path.join(clientRoot, 'context/AuthContext.jsx'), 'utf8');
    assert.match(loginSource, /user\.role === 'admin' \? '\/admin' : '\/dashboard'/);
    assert.match(appSource, /roles=\{\['employee'\]\}><DashboardLayout \/>/);
    assert.match(authContextSource, /writeSession\(next\);\s*setSession\(next\);\s*return result\.user/);
  } finally {
    pool.connect = originalConnect;
    pool.query = originalQuery;
    staffAttendanceModel.recordLogin = originalRecordLogin;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
