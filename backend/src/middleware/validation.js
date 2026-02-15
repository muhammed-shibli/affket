const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[0-9]{10,15}$/).withMessage('Invalid mobile number'),
  body('company_name')
    .trim()
    .notEmpty().withMessage('Company/Channel name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Company name must be 2-200 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('confirm_password')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateOffer = [
  body('name')
    .trim()
    .notEmpty().withMessage('Offer name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Offer name must be 2-255 characters'),
  body('description')
    .optional()
    .trim(),
  body('category_id')
    .notEmpty().withMessage('Category is required')
    .isInt().withMessage('Invalid category'),
  body('offer_type')
    .notEmpty().withMessage('Offer type is required')
    .isIn(['CPA', 'CPI', 'CPS', 'CPL', 'CPC']).withMessage('Invalid offer type'),
  body('payout_type')
    .notEmpty().withMessage('Payout type is required')
    .isIn(['fixed', 'percentage', 'dynamic']).withMessage('Invalid payout type'),
  body('payout_amount')
    .notEmpty().withMessage('Payout amount is required')
    .isFloat({ min: 0 }).withMessage('Payout must be a positive number'),
  handleValidationErrors
];

const validatePostback = [
  body('offer_id')
    .notEmpty().withMessage('Offer ID is required')
    .isInt().withMessage('Invalid offer ID'),
  body('goal_id')
    .optional()
    .isInt().withMessage('Invalid goal ID'),
  body('postback_url')
    .trim()
    .notEmpty().withMessage('Postback URL is required')
    .isURL().withMessage('Invalid URL format'),
  handleValidationErrors
];

const validateWithdrawal = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Minimum withdrawal amount is $1'),
  handleValidationErrors
];

const validateBankDetails = [
  body('bank_account_number')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 }).withMessage('Invalid account number'),
  body('bank_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Invalid bank name'),
  body('ifsc_code')
    .optional()
    .trim()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),
  body('upi_id')
    .optional()
    .trim()
    .matches(/^[\w.-]+@[\w.-]+$/).withMessage('Invalid UPI ID'),
  handleValidationErrors
];

const validateGateway = [
  body('type')
    .notEmpty().withMessage('Gateway type is required')
    .isIn(['payment', 'sms']).withMessage('Invalid gateway type'),
  body('name')
    .trim()
    .notEmpty().withMessage('Gateway name is required'),
  body('method')
    .notEmpty().withMessage('Method is required')
    .isIn(['GET', 'POST']).withMessage('Invalid method'),
  body('api_url')
    .trim()
    .notEmpty().withMessage('API URL is required')
    .isURL().withMessage('Invalid URL format'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateOffer,
  validatePostback,
  validateWithdrawal,
  validateBankDetails,
  validateGateway
};
