require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

pool.query('SELECT version()', (err, res) => {
  if (err) {
    console.error('Failed to connect to NeonDB:', err.stack);
  } else {
    console.log('Connected to NeonDB:', res.rows[0].version);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
});
