
const pool = require('../config/db');

const getAllMembers = async () => {
  const result = await pool.query(`
    SELECT
      member_id,
      mem_fullname,
      mem_contact_num,
      mem_status
    FROM members
    ORDER BY member_id ASC
  `);

  return result.rows;
};

const getMemberById = async (memberId) => {
  const result = await pool.query(
    `SELECT
       member_id,
       mem_fullname,
       mem_contact_num,
       mem_status
     FROM members
     WHERE member_id = $1`,
    [memberId]
  );

  return result.rows[0] || null;
};

module.exports = {
  getAllMembers,
  getMemberById,
};
