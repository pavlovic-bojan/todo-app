const { body, param, validationResult } = require('express-validator')

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        })
    }
    next()
}

// User validation rules
const validateUserRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores and hyphens')
        .escape(),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .escape(),
    body('password')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password must be between 6 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['client', 'admin'])
        .withMessage('Role must be either client or admin'),
    body('age')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('Age must be between 1 and 120'),
    handleValidationErrors
]

const validateUserLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .escape(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
]

const validateForgotPassword = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .escape(),
    handleValidationErrors
]

const validateResetPassword = [
    body('resetToken')
        .trim()
        .notEmpty()
        .withMessage('Reset token is required')
        .isUUID()
        .withMessage('Invalid reset token format'),
    body('newPassword')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password must be between 6 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
]

const validateUserUpdate = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid user ID'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .escape(),
    body('password')
        .optional()
        .isLength({ min: 6, max: 100 })
        .withMessage('Password must be between 6 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['client', 'admin'])
        .withMessage('Role must be either client or admin'),
    body('age')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('Age must be between 1 and 120'),
    handleValidationErrors
]

// Todo validation rules
const validateTodoCreate = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters')
        .escape(),
    handleValidationErrors
]

const validateTodoUpdate = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid todo ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters')
        .escape(),
    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean'),
    handleValidationErrors
]

const validateIdParam = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid ID format'),
    handleValidationErrors
]

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateForgotPassword,
    validateResetPassword,
    validateUserUpdate,
    validateTodoCreate,
    validateTodoUpdate,
    validateIdParam,
    handleValidationErrors
}

