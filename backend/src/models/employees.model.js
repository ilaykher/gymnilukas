const bcrypt = require('bcrypt');
const pool = require('../config/db');
const dbTransaction = require('../utils/dbTransaction');

async function listEmployees() {
  const result = await pool.query(
    `SELECT
       ea.emp_id,
       ea.emp_name,
       ea.emp_email,
       ea.emp_phone_num,
       ea.emp_status::text AS emp_status,
       ea.emp_job_title,
       la.auth_username,
       la.auth_role::text AS auth_role
     FROM emp_acc ea
     LEFT JOIN login_auth la ON la.emp_id = ea.emp_id
     ORDER BY ea.emp_id`
  );
  return result.rows;
}

async function ensureLoginIdentifiersAvailable(client, { username, email }, employeeId = null) {
  const result = await client.query(
    `SELECT la.emp_id
     FROM login_auth la
     JOIN emp_acc ea ON ea.emp_id = la.emp_id
     WHERE ($3::integer IS NULL OR la.emp_id <> $3)
       AND (
         lower(la.auth_username) IN (lower($1), lower($2))
         OR lower(ea.emp_email) IN (lower($1), lower($2))
       )
     LIMIT 1`,
    [username, email, employeeId]
  );
  if (result.rowCount) {
    const error = new Error('Username or email is already assigned to another employee.');
    error.status = 409;
    throw error;
  }
}

async function createEmployee(employee) {
  return dbTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1)', [847220]);
    await ensureLoginIdentifiersAvailable(client, employee);
    const employeeResult = await client.query(
      `INSERT INTO emp_acc (emp_name, emp_email, emp_phone_num, emp_status, emp_job_title)
       VALUES ($1, $2, $3, $4::status_enum, $5)
       RETURNING emp_id, emp_name, emp_email, emp_phone_num, emp_status::text AS emp_status, emp_job_title`,
      [employee.name, employee.email, employee.phone, employee.isActive ? 'active' : 'inactive', employee.jobTitle]
    );
    const created = employeeResult.rows[0];
    const passwordHash = await bcrypt.hash(employee.password, 12);
    await client.query(
      `INSERT INTO login_auth (auth_username, auth_password, auth_role, emp_id)
       VALUES ($1, $2, 'employee'::auth_role, $3)`,
      [employee.username, passwordHash, created.emp_id]
    );
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
       VALUES ($1, 'employee.created', 'employee', $2, $3::jsonb)`,
      [employee.actorId, created.emp_id, JSON.stringify({ name: created.emp_name })]
    );
    return { ...created, auth_username: employee.username, auth_role: 'employee' };
  });
}

async function updateEmployee(employeeId, employee, actorId) {
  return dbTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1)', [847220]);
    await ensureLoginIdentifiersAvailable(client, employee, employeeId);
    const result = await client.query(
      `UPDATE emp_acc
       SET emp_name = $2,
           emp_email = $3,
           emp_job_title = $4,
           emp_status = $5::status_enum
       WHERE emp_id = $1
       RETURNING emp_id, emp_name, emp_email, emp_phone_num, emp_status::text AS emp_status, emp_job_title`,
      [employeeId, employee.name, employee.email, employee.jobTitle, employee.isActive ? 'active' : 'inactive']
    );
    if (!result.rowCount) return null;
    await client.query(
      `UPDATE login_auth SET auth_username = $2 WHERE emp_id = $1`,
      [employeeId, employee.username]
    );
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id)
       VALUES ($1, 'employee.updated', 'employee', $2)`,
      [actorId, employeeId]
    );
    return result.rows[0];
  });
}

async function resetEmployeePassword(employeeId, password, requireChange, actorId) {
  return dbTransaction(async (client) => {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await client.query(
      `UPDATE login_auth
       SET auth_password = $2, auth_must_change_password = $3
       WHERE emp_id = $1 RETURNING account_id`,
      [employeeId, passwordHash, requireChange]
    );
    if (!result.rowCount) return false;
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id)
       VALUES ($1, 'employee.password_reset', 'employee', $2)`,
      [actorId, employeeId]
    );
    return true;
  });
}

module.exports = {
  listEmployees,
  ensureLoginIdentifiersAvailable,
  createEmployee,
  updateEmployee,
  resetEmployeePassword,
};
