require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

const MIGRATION_LOCK_KEYS = [741230, 194522];

async function runMigration() {
  const migrationFiles = (await fs.readdir(__dirname))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  const client = await pool.connect();
  let lockAcquired = false;
  try {
    await client.query('SELECT pg_advisory_lock($1, $2)', MIGRATION_LOCK_KEYS);
    lockAcquired = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const migrationFile of migrationFiles) {
      const { rowCount } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [migrationFile]
      );
      if (rowCount) {
        console.log(`Skipped migration ${migrationFile} (already applied).`);
        continue;
      }

      const migrationPath = path.join(__dirname, migrationFile);
      const sql = await fs.readFile(migrationPath, 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [migrationFile]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      console.log(`Applied migration ${migrationFile}.`);
    }
  } finally {
    try {
      if (lockAcquired) {
        await client.query('SELECT pg_advisory_unlock($1, $2)', MIGRATION_LOCK_KEYS);
      }
    } finally {
      client.release();
    }
  }
}

runMigration()
  .catch((error) => {
    console.error('Failed to apply database migrations:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
