const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Configure Node.js to prefer IPv6 for DNS resolution
dns.setDefaultResultOrder('ipv6first');

let pool = null;

function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      // Use Supabase connection string from environment variable
      const connectionString = process.env.DATABASE_URL;
      
      if (!connectionString) {
        console.error('⚠️  DATABASE_URL environment variable is not set');
        console.error('   Please set DATABASE_URL in your .env file');
        console.error('   See SUPABASE_SETUP.md for instructions');
        reject(new Error('DATABASE_URL is required. See SUPABASE_SETUP.md for setup instructions.'));
        return;
      }

      pool = new Pool({
        connectionString: connectionString,
        // Always set SSL config to allow self-signed certificates
        // This works even when sslmode is in the connection string
        ssl: {
          rejectUnauthorized: false // Allow self-signed certificates for Supabase
        },
        connectionTimeoutMillis: 15000, // 15 second timeout
        idleTimeoutMillis: 30000,
      });

      // Test connection
      pool.query('SELECT NOW()', (err, res) => {
        if (err) {
          console.error('❌ Error connecting to database:', err.message);
          console.error('   Please check your DATABASE_URL in .env file');
          console.error('   Make sure your Supabase project is active and the connection string is correct');
          console.error('   See SUPABASE_SETUP.md for help');
          reject(err);
          return;
        }
        console.log('✅ Connected to Supabase PostgreSQL database');
        createTables().then(() => resolve()).catch(reject);
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      reject(error);
    }
  });
}

async function createTables() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        home_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        frequency_days INTEGER,
        reminder_days_before INTEGER DEFAULT 3,
        last_completed DATE,
        next_due_date DATE NOT NULL,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add reminder_days_before column if it doesn't exist (migration)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'reminder_days_before'
        ) THEN
          ALTER TABLE tasks ADD COLUMN reminder_days_before INTEGER DEFAULT 3;
        END IF;
      END $$;
    `).catch(() => {
      // Column might already exist, ignore error
    });

    // Task history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_history (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL,
        completed_date DATE NOT NULL,
        notes TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created/verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

function getDb() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

// Helper function to convert callback-style queries to promises
function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  initDatabase,
  getDb,
  query
};
