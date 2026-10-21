require('dotenv').config();

const pool = require('../config/db');

async function readMockData() {
  try {
    const members = await pool.query(
      'SELECT member_id, mem_fullname, mem_contact_num, mem_status FROM members ORDER BY member_id'
    );

    const memberships = await pool.query(
      `SELECT 
        ms.membership_id,
        mem.mem_fullname,
        ms.mbs_start_date,
        ms.mbs_expiration_date,
        ms.mbs_status,
        (ms.mbs_expiration_date - CURRENT_DATE) AS days_remaining
       FROM membership ms
       JOIN members mem ON mem.member_id = ms.member_id
       ORDER BY ms.membership_id`
    );

   
    console.log('=== MEMBERS ===');
    console.table(members.rows);

    console.log('=== MEMBERSHIPS ===');
    console.table(memberships.rows);

    process.exit(0);
  
  } catch (error) {
    console.error('Failed to read mock data:');
    console.error(error.message);
    process.exit(1);
  }
}

readMockData(); 