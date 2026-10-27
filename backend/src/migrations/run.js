require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

async function runMigration() {
  const migrationFiles = (await fs.readdir(__dirname))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();
  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(__dirname, migrationFile);
    const sql = await fs.readFile(migrationPath, 'utf8');
    await pool.query(sql);
    console.log(`Applied migration ${migrationFile}.`);
  }
}

runMigration()
  .catch((error) => {
    console.error('Failed to apply database migrations:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
