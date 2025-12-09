const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Allow self-signed certificates for Supabase (only for development)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

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
initDatabase().catch(err => {
  console.error('\n❌ Failed to initialize database');
  console.error('   Error:', err.message);
  console.error('\n📖 To fix this:');
  console.error('   1. Create a Supabase account at https://supabase.com');
  console.error('   2. Create a new project');
  console.error('   3. Get your connection string from Settings → Database');
  console.error('   4. Add DATABASE_URL to your .env file');
  console.error('   5. See SUPABASE_SETUP.md for detailed instructions\n');
  process.exit(1);
});

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

