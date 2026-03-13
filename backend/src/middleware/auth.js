/**
 * @module middleware/auth
 * @description JWT authentication middleware. Verifies the Authorization bearer
 * token on every protected route and attaches the decoded user payload to req.user.
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded payload { id, email, role } to req.user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists in database
    const result = await db.query(
      'SELECT id, email, name, role, persona_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Token is valid but user no longer exists.',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Token has expired. Please login again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Invalid token.',
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      error: 'Authentication error.',
    });
  }
};

/**
 * Middleware to restrict access to manager role only.
 * Must be used AFTER verifyToken middleware.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      data: null,
      error: 'Access denied. Manager role required.',
    });
  }
  next();
};

module.exports = { verifyToken, requireManager };
