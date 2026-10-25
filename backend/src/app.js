require('dotenv').config();
const express = require('express');
const cors = require('cors');

const membersRoutes = require('./routes/members.route');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/members', membersRoutes);
  
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Gym ni Lucas Fitness API is running',
  });
});


// 404 handler must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = app;