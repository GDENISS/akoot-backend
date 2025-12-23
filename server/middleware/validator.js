const { body, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Blog validation rules
exports.validateBlog = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('author.name')
    .trim()
    .notEmpty().withMessage('Author name is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Technology', 'Business', 'Startup', 'Development', 'Design', 'Marketing', 'Other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Contact validation rules
exports.validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  handleValidationErrors
];

// Email subscription validation rules
exports.validateSubscription = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('subscriptionType')
    .optional()
    .isIn(['newsletter', 'blog_updates', 'product_updates', 'all'])
    .withMessage('Invalid subscription type'),
  handleValidationErrors
];
