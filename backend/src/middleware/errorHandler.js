/**
 * @module middleware/errorHandler
 * @description Global Express error handler. Catches all unhandled errors,
 * logs them, and returns a consistent JSON error response.
 */

/**
 * Global error handling middleware.
 * @param {Error} err - The error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Invalid JSON in request body.',
    });
  }

  if (err.code === '23505') {
    // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      data: null,
      error: 'A record with that value already exists.',
    });
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Referenced record does not exist.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
  });
};

module.exports = errorHandler;
