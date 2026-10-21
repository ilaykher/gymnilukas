require('dotenv').config();

const pool = require('../config/db');

async function testDatabase() {
  try {
    const result = await pool.query(
      'SELECT version() AS version, current_database() AS database_name'
    );

    console.log('Connected to Neon successfully');
    console.log('Database:', result.rows[0].database_name);
    console.log('Version:', result.rows[0].version);

    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to NeonDB:');
    console.error(error.message);
    process.exit(1);
  }
}   

testDatabase();