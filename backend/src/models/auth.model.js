const pool = require('../config/db');

async function findAccount(username) {
  const result = await pool.query(
    `SELECT
       la.account_id,
       la.auth_username,
       la.auth_password,
       la.auth_must_change_password,
       la.auth_role::text AS role,
       ea.emp_id,
       ea.emp_name,
       ea.emp_email,
       ea.emp_status::text AS status
     FROM login_auth la
     JOIN emp_acc ea ON ea.emp_id = la.emp_id
     WHERE lower(la.auth_username) = lower($1)
        OR lower(ea.emp_email) = lower($1)
     ORDER BY CASE WHEN lower(la.auth_username) = lower($1) THEN 0 ELSE 1 END
     LIMIT 2`,
    [username]
  );
  if (result.rows.length > 1) {
    const error = new Error('Login identifier matches more than one account.');
    error.code = 'AMBIGUOUS_LOGIN_IDENTIFIER';
    error.status = 409;
    throw error;
  }
  return result.rows[0] || null;
}

async function getAccountByEmployeeId(empId) {
  const result = await pool.query(
    `SELECT
       la.auth_username AS username,
       la.auth_role::text AS role,
       la.auth_must_change_password AS must_change_password,
       ea.emp_id,
       ea.emp_name AS name,
       ea.emp_email AS email,
       ea.emp_status::text AS status
     FROM login_auth la
     JOIN emp_acc ea ON ea.emp_id = la.emp_id
     WHERE ea.emp_id = $1`,
    [empId]
  );
  return result.rows[0] || null;
}

async function getAccountWithPassword(empId) {
  const result = await pool.query(
    `SELECT la.auth_password, la.auth_must_change_password AS must_change_password,
            la.auth_username AS username, la.auth_role::text AS role,
            ea.emp_name AS name, ea.emp_email AS email, ea.emp_status::text AS status
     FROM login_auth la JOIN emp_acc ea ON ea.emp_id = la.emp_id
     WHERE ea.emp_id = $1`,
    [empId]
  );
  return result.rows[0] || null;
}

async function updatePassword(empId, passwordHash) {
  await pool.query(
    `UPDATE login_auth SET auth_password = $2, auth_must_change_password = false
     WHERE emp_id = $1`,
    [empId, passwordHash]
  );
}

module.exports = { findAccount, getAccountByEmployeeId, getAccountWithPassword, updatePassword };
