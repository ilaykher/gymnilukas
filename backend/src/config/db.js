const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured before starting the backend.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true },
  connectionTimeoutMillis: 10000,
});

module.exports = pool;