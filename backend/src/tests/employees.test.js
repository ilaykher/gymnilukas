const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const bcrypt = require('bcrypt');

const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = 'postgres://127.0.0.1:5432/fitnexx_test';
const employeesController = require('../controllers/employees.controller');
const employeesModel = require('../models/employees.model');
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

async function callCreate(body, user = { empId: 7 }) {
  const res = createResponse();
  let error;
  await employeesController.create({ body, user }, res, (caught) => { error = caught; });
  return { res, error };
}

const validEmployee = {
  name: 'Taylor Staff',
  jobTitle: 'Front-Desk',
  username: 'taylor.staff',
  email: 'taylor@example.invalid',
  phone: '09123456789',
  password: 'StrongPass9!',
  isActive: true,
};

test('Add Staff sends the API jobTitle field, not the authorization role field', () => {
  const component = fs.readFileSync(
    path.join(__dirname, '../../../client/src/pages/Admin/RegisterEmployee.jsx'),
    'utf8'
  );
  const request = component.match(/createEmployee\(\{([\s\S]*?)\}\)/);
  assert.ok(request, 'the form submits a createEmployee request');
  assert.match(request[1], /jobTitle:\s*formData\.role/);
  assert.match(request[1], /username:\s*formData\.username\.trim\(\)/);
  assert.doesNotMatch(request[1], /^\s*role\s*:/m);

  const employeeManagement = fs.readFileSync(
    path.join(__dirname, '../../../client/src/pages/Admin/Employees.jsx'),
    'utf8'
  );
  assert.match(employeeManagement, /<option value="Front-Desk"[^>]*>Front-Desk<\/option>/);
});

test('Add Staff collects a distinct login username and employee edit sends it independently from email', () => {
  const registration = fs.readFileSync(
    path.join(__dirname, '../../../client/src/pages/Admin/RegisterEmployee.jsx'),
    'utf8'
  );
  assert.match(registration, /name="username"/);
  assert.match(registration, /name="email"/);
  assert.match(registration, /username:\s*formData\.username\.trim\(\)/);

  const edit = fs.readFileSync(
    path.join(__dirname, '../../../client/src/pages/Admin/Employees.jsx'),
    'utf8'
  );
  assert.match(edit, /username:\s*employee\.auth_username \|\| employee\.emp_email/);
  assert.match(edit, /username:\s*saved\.username/);
  assert.match(edit, /email:\s*saved\.email/);

  const migration = fs.readFileSync(
    path.join(__dirname, '../migrations/002_case_insensitive_auth_username.sql'),
    'utf8'
  );
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS[\s\S]*ON login_auth \(lower\(auth_username\)\)/);
});

test('employee creation accepts a valid job title and never returns plaintext password', async () => {
  const originalCreate = employeesModel.createEmployee;
  let receivedEmployee;
  try {
    employeesModel.createEmployee = async (employee) => {
      receivedEmployee = employee;
      return {
        emp_id: 24,
        emp_name: employee.name,
        emp_job_title: employee.jobTitle,
        auth_username: employee.username,
        auth_role: 'employee',
      };
    };

    const { res, error } = await callCreate({ ...validEmployee, username: 'Taylor.Staff' });
    assert.equal(error, undefined);
    assert.equal(res.statusCode, 201);
    assert.equal(receivedEmployee.jobTitle, 'Front-Desk');
    assert.equal(receivedEmployee.username, validEmployee.username);
    assert.equal(receivedEmployee.actorId, 7);
    assert.equal(res.body.data.emp_job_title, 'Front-Desk');
    assert.equal(res.body.data.auth_role, 'employee');
    assert.equal(JSON.stringify(res.body).includes(validEmployee.password), false);
  } finally {
    employeesModel.createEmployee = originalCreate;
  }
});

test('employee creation rejects a missing, too-long, or unsupported job title', async () => {
  const originalCreate = employeesModel.createEmployee;
  let modelCalled = false;
  try {
    employeesModel.createEmployee = async () => {
      modelCalled = true;
      throw new Error('model should not be called for invalid input');
    };

    const missing = await callCreate({ ...validEmployee, jobTitle: undefined });
    assert.equal(missing.error.status, 400);
    assert.equal(missing.error.message, 'Role is required and must be no more than 50 characters.');

    const tooLong = await callCreate({ ...validEmployee, jobTitle: 'x'.repeat(51) });
    assert.equal(tooLong.error.status, 400);
    assert.equal(tooLong.error.message, 'Role is required and must be no more than 50 characters.');

    const unsupported = await callCreate({ ...validEmployee, jobTitle: 'Owner' });
    assert.equal(unsupported.error.status, 400);
    assert.equal(unsupported.error.message, 'Select a valid employee role.');
    assert.equal(modelCalled, false);
  } finally {
    employeesModel.createEmployee = originalCreate;
  }
});

test('employee creation requires a valid login username', async () => {
  const originalCreate = employeesModel.createEmployee;
  let modelCalled = false;
  try {
    employeesModel.createEmployee = async () => { modelCalled = true; };
    for (const username of [undefined, 'ab', 'contains spaces']) {
      const { error } = await callCreate({ ...validEmployee, username });
      assert.equal(error.status, 400);
    }
    assert.equal(modelCalled, false);
  } finally {
    employeesModel.createEmployee = originalCreate;
  }
});

test('employee edits accept the canonical Front-Desk job title', async () => {
  const originalUpdate = employeesModel.updateEmployee;
  let updated;
  try {
    employeesModel.updateEmployee = async (id, employee, actorId) => {
      updated = { id, employee, actorId };
      return { emp_id: id, emp_job_title: employee.jobTitle };
    };

    const res = createResponse();
    let error;
    await employeesController.update(
      {
        params: { id: '24' },
        body: {
          name: 'Taylor Staff',
          username: 'taylor.staff',
          email: 'taylor@example.invalid',
          jobTitle: 'Front-Desk',
          isActive: true,
        },
        user: { empId: 7 },
      },
      res,
      (caught) => { error = caught; }
    );
    assert.equal(error, undefined);
    assert.equal(res.statusCode, 200);
    assert.equal(updated.id, 24);
    assert.equal(updated.employee.jobTitle, 'Front-Desk');
    assert.equal(updated.employee.username, 'taylor.staff');
    assert.equal(updated.actorId, 7);

    error = undefined;
    await employeesController.update(
      {
        params: { id: '24' },
        body: {
          name: 'Taylor Staff',
          username: 'taylor.staff',
          email: 'taylor@example.invalid',
          jobTitle: 'Front Desk',
          isActive: true,
        },
        user: { empId: 7 },
      },
      createResponse(),
      (caught) => { error = caught; }
    );
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Select a valid employee role.');
  } finally {
    employeesModel.updateEmployee = originalUpdate;
  }
});

test('employee email edits preserve the separately submitted login username', async () => {
  const originalConnect = pool.connect;
  const statements = [];
  const client = {
    async query(sql, values = []) {
      statements.push({ sql, values });
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
      if (sql.includes('pg_advisory_xact_lock') || sql.includes('SELECT la.emp_id')) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith('UPDATE emp_acc')) {
        return { rows: [{ emp_id: 24, emp_email: values[2] }], rowCount: 1 };
      }
      if (sql.startsWith('UPDATE login_auth')) return { rows: [], rowCount: 1 };
      if (sql.includes('INSERT INTO activity_logs')) return { rows: [], rowCount: 1 };
      assert.fail(`Unexpected SQL in mocked test: ${sql}`);
    },
    release() {},
  };
  pool.connect = async () => client;

  try {
    await employeesModel.updateEmployee(24, {
      name: 'Taylor Staff',
      email: 'new.email@example.invalid',
      username: 'taylor.staff',
      jobTitle: 'Front-Desk',
      isActive: true,
    }, 7);
    const usernameUpdate = statements.find(({ sql }) => sql.startsWith('UPDATE login_auth'));
    assert.deepEqual(usernameUpdate.values, [24, 'taylor.staff']);
    assert.doesNotMatch(usernameUpdate.sql, /emp_email/);
  } finally {
    pool.connect = originalConnect;
  }
});

test('employee creation rejects case-insensitive collisions across username and email identifiers', async () => {
  const originalConnect = pool.connect;
  const statements = [];
  const client = {
    async query(sql, values = []) {
      statements.push({ sql, values });
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.includes('SELECT la.emp_id')) return { rows: [{ emp_id: 99 }], rowCount: 1 };
      assert.fail(`No employee insert should occur after a login identifier collision: ${sql}`);
    },
    release() {},
  };
  pool.connect = async () => client;

  try {
    await assert.rejects(
      employeesModel.createEmployee({
        name: validEmployee.name,
        email: validEmployee.email,
        username: 'TAylor.Staff',
        phone: validEmployee.phone,
        jobTitle: validEmployee.jobTitle,
        isActive: true,
        password: validEmployee.password,
        actorId: 7,
      }),
      { status: 409, message: 'Username or email is already assigned to another employee.' }
    );
    const collisionCheck = statements.find(({ sql }) => sql.includes('SELECT la.emp_id'));
    assert.match(collisionCheck.sql, /lower\(la\.auth_username\) IN \(lower\(\$1\), lower\(\$2\)\)/);
    assert.deepEqual(collisionCheck.values, ['TAylor.Staff', validEmployee.email, null]);
    assert.equal(statements.at(-1).sql, 'ROLLBACK');
    assert.equal(statements.some(({ sql }) => sql.includes('INSERT INTO emp_acc')), false);
  } finally {
    pool.connect = originalConnect;
  }
});

test('employee creation route remains admin-only', () => {
  const route = apiRoutes.stack.find(
    (layer) => layer.route?.path === '/employees' && layer.route.methods.post
  );
  assert.ok(route, 'POST /employees route exists');
  const [requireAdmin] = route.route.stack.map((layer) => layer.handle);
  const employeeResponse = createResponse();
  let employeeReached = false;
  requireAdmin({ user: { role: 'employee' } }, employeeResponse, () => { employeeReached = true; });
  assert.equal(employeeResponse.statusCode, 403);
  assert.equal(employeeReached, false);

  const adminResponse = createResponse();
  let adminReached = false;
  requireAdmin({ user: { role: 'admin' } }, adminResponse, () => { adminReached = true; });
  assert.equal(adminReached, true);
});

test('employee and login account writes hash passwords and share a rollback transaction', async () => {
  const originalConnect = pool.connect;
  const statements = [];
  let failLoginInsert = false;
  const createdEmployee = {
    emp_id: 24,
    emp_name: validEmployee.name,
    emp_email: validEmployee.email,
    emp_phone_num: validEmployee.phone,
    emp_status: 'active',
    emp_job_title: validEmployee.jobTitle,
  };
  const client = {
    async query(sql, values = []) {
      statements.push({ sql, values });
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.includes('SELECT la.emp_id')) return { rows: [], rowCount: 0 };
      if (sql.includes('INSERT INTO emp_acc')) return { rows: [createdEmployee], rowCount: 1 };
      if (sql.includes('INSERT INTO login_auth')) {
        if (failLoginInsert) throw new Error('simulated login insert failure');
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO activity_logs')) return { rows: [], rowCount: 1 };
      throw new Error(`Unexpected SQL in mocked test: ${sql}`);
    },
    release() {},
  };
  pool.connect = async () => client;

  try {
    const result = await employeesModel.createEmployee({
      name: validEmployee.name,
      email: validEmployee.email,
      username: validEmployee.username,
      phone: validEmployee.phone,
      jobTitle: validEmployee.jobTitle,
      isActive: true,
      username: validEmployee.username,
      password: validEmployee.password,
      actorId: 7,
    });

    const loginInsert = statements.find(({ sql }) => sql.includes('INSERT INTO login_auth'));
    assert.ok(loginInsert);
    assert.match(loginInsert.values[1], /^\$2[aby]\$12\$/);
    assert.equal(await bcrypt.compare(validEmployee.password, loginInsert.values[1]), true);
    assert.equal(JSON.stringify(statements).includes(validEmployee.password), false);
    assert.match(loginInsert.sql, /'employee'::auth_role/);
    assert.equal(result.emp_job_title, validEmployee.jobTitle);
    assert.equal(result.auth_role, 'employee');
    assert.equal(Object.hasOwn(result, 'password'), false);
    assert.equal(Object.hasOwn(result, 'auth_password'), false);
    assert.equal(statements[0].sql, 'BEGIN');
    assert.equal(statements.at(-1).sql, 'COMMIT');

    statements.length = 0;
    failLoginInsert = true;
    await assert.rejects(
      employeesModel.createEmployee({
        name: validEmployee.name,
        email: validEmployee.email,
        phone: validEmployee.phone,
        jobTitle: validEmployee.jobTitle,
        isActive: true,
        username: validEmployee.username,
        password: validEmployee.password,
        actorId: 7,
      }),
      /simulated login insert failure/
    );
    assert.equal(statements[0].sql, 'BEGIN');
    assert.ok(statements.some(({ sql }) => sql.includes('INSERT INTO emp_acc')));
    assert.ok(statements.some(({ sql }) => sql.includes('INSERT INTO login_auth')));
    assert.equal(statements.at(-1).sql, 'ROLLBACK');
    assert.equal(statements.some(({ sql }) => sql === 'COMMIT'), false);
  } finally {
    pool.connect = originalConnect;
  }
});
