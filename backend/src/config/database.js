/**
 * @module config/database
 * @description PostgreSQL connection pool configuration using node-postgres (pg).
 * Reads DATABASE_URL from environment and creates a shared Pool instance.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log connection errors
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Execute a parameterized SQL query.
 * @param {string} text - SQL query string with $1, $2, ... placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>} Query result
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transaction support.
 * @returns {Promise<import('pg').PoolClient>} Pool client
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
