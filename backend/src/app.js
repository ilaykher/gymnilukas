require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const apiRoutes = require('./routes/api.route');

const app = express();
const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '32kb' }));
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Fitnexx API is running.' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' });
  }

  if (error.code === '23505') {
    return res.status(409).json({ success: false, message: 'A record with those details already exists.' });
  }
  if (error.code === '23503' || error.code === '23514' || error.code === '22P02') {
    return res.status(400).json({ success: false, message: 'The submitted data is invalid for this operation.' });
  }

  console.error('API request failed:', error.code || error.name || 'UnknownError');
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

module.exports = app;
