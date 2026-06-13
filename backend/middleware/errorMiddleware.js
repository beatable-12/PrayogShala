import { errorResponse } from '../utils/apiResponse.js';

/**
 * middleware/errorMiddleware.js
 *
 * Two-phase global error handling:
 *
 * 1. notFound      → Catches requests to undefined routes (404).
 * 2. errorHandler  → Catches all errors forwarded via next(error).
 *                    Translates known Mongoose errors into readable messages.
 *
 * Must be registered LAST in server.js after all route definitions.
 */

// 404 handler — fires when no route matched
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose: Document not found
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Mongoose: Duplicate key violation (e.g., email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // JWT errors handled in authMiddleware, but catch any stragglers
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  const isDev = process.env.NODE_ENV === 'development';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }), // Only expose stack in dev mode
  });
};
