const pool = require('../config/db');

async function recordLogin(empId) {
  const result = await pool.query(
    `INSERT INTO staff_shift_attendance (emp_id)
     VALUES ($1)
     ON CONFLICT (emp_id) WHERE time_out IS NULL
     DO UPDATE SET emp_id = EXCLUDED.emp_id
     RETURNING staff_shift_attendance_id, emp_id, time_in, time_out, attendance_date`,
    [empId]
  );
  return result.rows[0];
}

async function recordLogout(empId) {
  const result = await pool.query(
    `UPDATE staff_shift_attendance
     SET time_out = CURRENT_TIMESTAMP
     WHERE emp_id = $1 AND time_out IS NULL
     RETURNING staff_shift_attendance_id, emp_id, time_in, time_out, attendance_date`,
    [empId]
  );
  return result.rows[0] || null;
}

async function listRecent(limit) {
  const result = await pool.query(
    `SELECT
       sa.staff_shift_attendance_id,
       sa.emp_id,
       ea.emp_name AS staff_name,
       to_char(sa.attendance_date, 'YYYY-MM-DD') AS attendance_date,
       sa.time_in,
       sa.time_out,
       CASE
         WHEN sa.time_out IS NULL THEN NULL
         ELSE round((extract(epoch FROM (sa.time_out - sa.time_in)) / 3600)::numeric, 2)
       END AS total_hours,
       CASE WHEN sa.time_out IS NULL THEN 'On shift' ELSE 'Completed' END AS status
     FROM staff_shift_attendance sa
     JOIN emp_acc ea ON ea.emp_id = sa.emp_id
     ORDER BY sa.time_in DESC, sa.staff_shift_attendance_id DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { recordLogin, recordLogout, listRecent };
