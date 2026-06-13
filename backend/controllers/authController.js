import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';

/**
 * controllers/authController.js
 *
 * register → Creates a new user account, returns JWT
 * login    → Validates credentials, returns JWT
 * getMe    → Returns the authenticated user's profile
 * updateMe → Updates name, preferredLang; password change requires current password
 */

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferredLang } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, email, password, preferredLang });
  const token = generateToken(user._id);

  return successResponse(res, 201, 'Account created successfully.', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLang: user.preferredLang,
      xp: user.xp,
      role: user.role,
    },
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password since it is set to select: false in schema
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  const token = generateToken(user._id);

  return successResponse(res, 200, 'Login successful.', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLang: user.preferredLang,
      xp: user.xp,
      role: user.role,
    },
  });
});

// @desc   Get current logged-in user's profile
// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  const user = await User.findById(req.user._id)
    .populate('unlockedTopics', 'title slug difficulty')
    .populate('completedTopics', 'title slug difficulty');

  return successResponse(res, 200, 'User profile retrieved.', { user });
});

// @desc   Update user profile (name, language)
// @route  PATCH /api/auth/me
// @access Private
export const updateMe = asyncHandler(async (req, res) => {
  const { name, preferredLang } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name && { name }), ...(preferredLang && { preferredLang }) },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Profile updated.', { user: updatedUser });
});
