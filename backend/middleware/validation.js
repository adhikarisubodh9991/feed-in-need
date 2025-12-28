/**
 * Validation Middleware
 * Express validator rules for API endpoints
 */

import { body, validationResult } from 'express-validator';

// Handle validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// User registration validation
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(97|98)\d{8}$/)
    .withMessage('Please enter a valid Nepali phone number (10 digits starting with 97 or 98)'),
  body('role')
    .optional()
    .isIn(['donor', 'receiver'])
    .withMessage('Invalid role'),
];

// Receiver registration validation
export const receiverRegisterValidation = [
  ...registerValidation,
  body('receiverType')
    .notEmpty()
    .withMessage('Receiver type is required')
    .isIn(['individual', 'organization'])
    .withMessage('Invalid receiver type'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Donation validation
export const donationValidation = [
  body('donorPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('foodTitle')
    .trim()
    .notEmpty()
    .withMessage('Food title is required')
    .isLength({ max: 200 })
    .withMessage('Food title cannot exceed 200 characters'),
  body('foodDescription')
    .trim()
    .notEmpty()
    .withMessage('Food description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required'),
  body('expiryDateTime')
    .notEmpty()
    .withMessage('Expiry date/time is required'),
  body('latitude')
    .notEmpty()
    .withMessage('Location is required')
    .custom((value) => {
      const lat = parseFloat(value);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error('Invalid latitude');
      }
      return true;
    }),
  body('longitude')
    .notEmpty()
    .withMessage('Location is required')
    .custom((value) => {
      const lng = parseFloat(value);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error('Invalid longitude');
      }
      return true;
    }),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
];

// Food request validation
export const requestValidation = [
  body('donationId')
    .notEmpty()
    .withMessage('Donation ID is required')
    .isMongoId()
    .withMessage('Invalid donation ID'),
  body('message')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ min: 20, max: 500 })
    .withMessage('Message must be between 20 and 500 characters'),
];
