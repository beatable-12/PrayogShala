/**
 * utils/apiResponse.js
 * Standardizes all API response shapes across the entire application.
 * Every controller uses these helpers to guarantee consistent JSON structure.
 *
 * Success shape:  { success: true,  message, data }
 * Error shape:    { success: false, message, errors? }
 */

export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
