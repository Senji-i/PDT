// supabase_db.js
// Helper to connect to Supabase Postgres using `pg` and `DATABASE_URL` from .env
// Install dependency: npm install pg

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not configured. Database helper will not work until you set DATABASE_URL in .env');
}

const pool = new Pool({
  connectionString,
  // For Supabase hosted Postgres, SSL is recommended. If you get SSL errors locally, set rejectUnauthorized false.
  ssl: connectionString ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
