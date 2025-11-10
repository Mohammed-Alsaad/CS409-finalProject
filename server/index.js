const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const suggestionRoutes = require('./routes/suggestions');
const testRoutes = require('./routes/test');
const { initDatabase } = require('./database/db');
const { startReminderScheduler } = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/test', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Home Maintenance Planner API is running' });
});

// Start reminder scheduler
startReminderScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

