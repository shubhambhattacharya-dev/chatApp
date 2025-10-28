import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const validateSignup = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long.')
    .escape(), // Sanitize for XSS

  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(), // Canonicalize email

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),

  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];

export const validateUpdateProfile = [
  body('profilePic')
    .notEmpty().withMessage('No profile picture provided.'),

  handleValidationErrors,
];

export const validateSendMessage = [
  body('text')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Message text cannot exceed 1000 characters.')
    .escape(), // Sanitize for XSS

  body('imageUrl')
    .optional({ checkFalsy: true }) // Allow empty string or null
    .isURL().withMessage('Image URL must be a valid URL.'),

  // Custom validation to ensure at least one field is present
  body().custom((value, { req }) => {
    if (!req.body.text && !req.body.imageUrl) {
      throw new Error('Message content cannot be empty');
    }
    return true;
  }),

  handleValidationErrors,
];