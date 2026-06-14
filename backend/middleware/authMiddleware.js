import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { errorResponse } from '../utils/apiResponse.js';
import User from '../models/User.js';
import { isBlacklisted } from '../utils/tokenBlacklist.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized. No token provided.');
  }

  if (isBlacklisted(token)) {
    return errorResponse(res, 401, 'Token has been revoked. Please log in again.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    return errorResponse(res, 401, 'User belonging to this token no longer exists.');
  }

  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return errorResponse(res, 403, 'Access denied. Admin privileges required.');
};
