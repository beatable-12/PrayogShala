import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import { addToBlacklist } from '../utils/tokenBlacklist.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  preferredLang: user.preferredLang,
  xp: user.xp,
  lastActive: user.lastActive,
  unlockedTopics: user.unlockedTopics,
  completedTopics: user.completedTopics,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferredLang } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, email, password, preferredLang });

  return successResponse(res, 201, 'Account created successfully.', {
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  return successResponse(res, 200, 'Login successful.', {
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('unlockedTopics', 'title slug difficulty')
    .populate('completedTopics', 'title slug difficulty');

  return successResponse(res, 200, 'User profile retrieved.', { user: sanitizeUser(user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.preferredLang !== undefined) updates.preferredLang = req.body.preferredLang;

  if (Object.keys(updates).length === 0) {
    return errorResponse(res, 400, 'No valid fields provided to update.');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, 'Profile updated.', { user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    addToBlacklist(token);
  }
  return successResponse(res, 200, 'Logged out successfully.');
});
