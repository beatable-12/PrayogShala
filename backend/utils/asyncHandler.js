/**
 * utils/asyncHandler.js
 * Higher-order function that wraps async Express route handlers.
 * Eliminates repetitive try-catch blocks in every controller.
 * Automatically forwards any thrown error to Express error middleware.
 *
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
