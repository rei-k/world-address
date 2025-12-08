import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation Result Handler
 * Checks for validation errors and returns 400 if any exist
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation Error',
      errors: errors.array()
    });
    return;
  }
  next();
}

/**
 * Address Validation Rules
 */
export const validateAddress = [
  body('country').isString().isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  body('postal_code').optional().isString().withMessage('Postal code must be a string'),
  body('province').optional().isString().withMessage('Province must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('street_address').optional().isString().withMessage('Street address must be a string'),
  body('recipient').optional().isString().withMessage('Recipient must be a string'),
  handleValidationErrors
];

/**
 * Webhook Validation Rules
 */
export const validateWebhook = [
  body('url').isURL().withMessage('URL must be a valid URL'),
  body('events').isArray({ min: 1 }).withMessage('Events must be a non-empty array'),
  body('events.*').isIn(['address.created', 'address.updated', 'address.deleted']).withMessage('Invalid event type'),
  body('secret').isString().isLength({ min: 8 }).withMessage('Secret must be at least 8 characters'),
  handleValidationErrors
];

/**
 * ID Parameter Validation
 */
export const validateId = [
  param('id').isString().notEmpty().withMessage('ID parameter is required'),
  handleValidationErrors
];

/**
 * Login Validation Rules
 */
export const validateLogin = [
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleValidationErrors
];
