const { validationResult } = require('express-validator')

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    isUUID: jest.fn().mockReturnThis()
  })),
  param: jest.fn(() => ({
    isInt: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn()
}))

const ValidationMiddleware = require('../../../api/middleware/ValidationMiddleware')

describe('ValidationMiddleware', () => {
  let req, res, next

  beforeEach(() => {
    req = { body: {}, params: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    jest.clearAllMocks()
  })

  describe('handleValidationErrors', () => {
    it('should call next if no validation errors', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      })

      const { handleValidationErrors } = require('../../../api/middleware/ValidationMiddleware')
      handleValidationErrors(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should return 400 if validation errors exist', () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { path: 'email', msg: 'Invalid email' },
          { path: 'password', msg: 'Password too short' }
        ]
      })

      const { handleValidationErrors } = require('../../../api/middleware/ValidationMiddleware')
      handleValidationErrors(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Password too short' }
        ]
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Validation Rules', () => {
    it('should export validateUserRegistration', () => {
      expect(ValidationMiddleware.validateUserRegistration).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateUserRegistration)).toBe(true)
    })

    it('should export validateUserLogin', () => {
      expect(ValidationMiddleware.validateUserLogin).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateUserLogin)).toBe(true)
    })

    it('should export validateForgotPassword', () => {
      expect(ValidationMiddleware.validateForgotPassword).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateForgotPassword)).toBe(true)
    })

    it('should export validateResetPassword', () => {
      expect(ValidationMiddleware.validateResetPassword).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateResetPassword)).toBe(true)
    })

    it('should export validateUserUpdate', () => {
      expect(ValidationMiddleware.validateUserUpdate).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateUserUpdate)).toBe(true)
    })

    it('should export validateTodoCreate', () => {
      expect(ValidationMiddleware.validateTodoCreate).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateTodoCreate)).toBe(true)
    })

    it('should export validateTodoUpdate', () => {
      expect(ValidationMiddleware.validateTodoUpdate).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateTodoUpdate)).toBe(true)
    })

    it('should export validateIdParam', () => {
      expect(ValidationMiddleware.validateIdParam).toBeDefined()
      expect(Array.isArray(ValidationMiddleware.validateIdParam)).toBe(true)
    })
  })
})

