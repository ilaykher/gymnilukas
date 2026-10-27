require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');
const { getJwtSecret } = require('./middleware/auth');

const PORT = Number(process.env.PORT || 5000);
let server;

async function start() {
  getJwtSecret();
  await pool.query('SELECT 1');
  server = app.listen(PORT, () => {
    console.log(`Fitnexx API listening on port ${PORT}`);
  });
}

async function shutdown() {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  await pool.end();
}

start().catch(async (error) => {
  const detail = error.message === 'JWT_SECRET must contain at least 32 characters.'
    ? error.message
    : error.code || error.name;
  console.error('Backend startup failed:', detail);
  process.exitCode = 1;
  await pool.end();
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Backend shutdown failed:', error.code || error.name);
        process.exit(1);
      });
  });
}
