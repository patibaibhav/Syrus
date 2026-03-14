/**
 * @module app
 * @description Express application setup with CORS, JSON parsing,
 * API routes, and global error handling.
 */

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const localStore = require('./data/localStore');

const app = express();
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

// ── CORS Configuration ──
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'onboarding-agent-api',
    mode: localStore.getMode(),
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──
app.use('/api', apiRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: `Route ${req.method} ${req.path} not found.`,
  });
});

// ── Global Error Handler ──
app.use(errorHandler);

module.exports = app;
