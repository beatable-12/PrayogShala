import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * middleware/validateMiddleware.js
 *
 * validateRequest → A middleware that reads results from express-validator chains.
 * If any validation rule failed, it short-circuits the request and returns
 * a structured 422 error with all field-level error messages.
 *
 * Usage: Place after your validator array in any route definition:
 *   router.post('/register', [validators...], validateRequest, controller)
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, 422, 'Validation failed.', formattedErrors);
  }
  next();
};
