/**
 * @module routes/api
 * @description Central route definitions for all API endpoints.
 * Mounts controllers with authentication and role-based middleware.
 */

const express = require('express');
const router = express.Router();

const { verifyToken, requireManager } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const chatController = require('../controllers/chatController');
const docController = require('../controllers/docController');
const pitfallController = require('../controllers/pitfallController');
const ticketController = require('../controllers/ticketController');
const analyticsController = require('../controllers/analyticsController');

// ══════════════════════════════════════════
// AUTH (public — no token required)
// ══════════════════════════════════════════
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// ══════════════════════════════════════════
// All routes below require authentication
// ══════════════════════════════════════════

// USER
router.get('/user/profile', verifyToken, userController.getProfile);
router.put('/user/persona', verifyToken, userController.updatePersona);

// TASKS
router.get('/tasks', verifyToken, taskController.listTasks);
router.get('/tasks/:id', verifyToken, taskController.getTask);
router.post('/tasks/:id/start', verifyToken, taskController.startTask);
router.post('/tasks/:id/verify', verifyToken, taskController.verifyTask);
router.post('/tasks/:id/complete', verifyToken, taskController.completeTask);

// CHAT
router.post('/chat', verifyToken, chatController.sendMessage);
router.get('/chat/history', verifyToken, chatController.getHistory);

// DOCS
router.get('/docs/search', verifyToken, docController.searchDocs);

// PITFALLS
router.get('/pitfalls', verifyToken, pitfallController.getPitfalls);

// TICKETS
router.get('/tickets/starter', verifyToken, ticketController.getStarterTickets);
router.put('/tickets/starter/:id', verifyToken, ticketController.updateTicketStatus);

// ANALYTICS
router.get('/analytics/progress', verifyToken, analyticsController.getProgress);
router.get('/analytics/risk', verifyToken, analyticsController.getRisk);
router.get('/analytics/productivity-estimate', verifyToken, analyticsController.getProductivityEstimate);

// MANAGER ONLY
router.get('/analytics/all-developers', verifyToken, requireManager, analyticsController.getAllDevelopers);
router.get('/reports/onboarding/:userId', verifyToken, requireManager, analyticsController.getOnboardingReport);

module.exports = router;
