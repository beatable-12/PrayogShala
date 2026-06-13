import jwt from 'jsonwebtoken';

/**
 * utils/generateToken.js
 * Generates a signed JWT token for authenticated user sessions.
 *
 * @param {string} id - The MongoDB ObjectId of the user
 * @returns {string} - Signed JWT string
 *
 * Token payload contains: user id only (minimal surface area for security).
 * Expiry is pulled from JWT_EXPIRES_IN env variable (default: 7d).
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export default generateToken;
