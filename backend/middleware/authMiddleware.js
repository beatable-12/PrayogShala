import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { errorResponse } from '../utils/apiResponse.js';
import User from '../models/User.js';

/**
 * middleware/authMiddleware.js
 *
 * protect  → Verifies JWT from Authorization header. Attaches req.user.
 * adminOnly → Restricts route access to admin-role users only.
 *
 * Token is expected as: Authorization: Bearer <token>
 */

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request, excluding the password hash
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return errorResponse(res, 401, 'User belonging to this token no longer exists.');
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Not authorized. Token invalid.');
  }
});

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return errorResponse(res, 403, 'Access denied. Admin only.');
};
