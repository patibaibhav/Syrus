/**
 * @module app
 * @description Express application setup with CORS, JSON parsing,
 * API routes, and global error handling.
 */

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── CORS Configuration ──
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  res.json({ status: 'ok', service: 'onboarding-agent-api', timestamp: new Date().toISOString() });
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
