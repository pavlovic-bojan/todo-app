const errorHandler = require('../../../api/middleware/ErrorHandler')
const logger = require('../../../config/logger')

// Mock logger
jest.mock('../../../config/logger', () => ({
  error: jest.fn()
}))

describe('ErrorHandler Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      originalUrl: '/api/test',
      method: 'POST',
      ip: '127.0.0.1'
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    jest.clearAllMocks()
    process.env.NODE_ENV = 'development'
  })

  it('should log error details', () => {
    const error = new Error('Test error')
    error.stack = 'Error stack trace'

    errorHandler(error, req, res, next)

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
        stack: 'Error stack trace',
        url: '/api/test',
        method: 'POST'
      })
    )
  })

  it('should handle "User not found" error with 404', () => {
    const error = new Error('User not found')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not found'
      })
    )
  })

  it('should handle "Todo not found" error with 404', () => {
    const error = new Error('Todo not found')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Todo not found'
      })
    )
  })

  it('should handle "Invalid ID format" error with 400', () => {
    const error = new Error('Invalid ID format')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid ID format'
      })
    )
  })

  it('should handle "User already exists" error with 409', () => {
    const error = new Error('User already exists')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('should handle "Invalid credentials" error with 401', () => {
    const error = new Error('Invalid credentials')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('should handle "Invalid or expired reset token" error with 400', () => {
    const error = new Error('Invalid or expired reset token')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should handle unknown errors with 500', () => {
    const error = new Error('Unknown error')

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unknown error'
      })
    )
  })

  it('should include stack trace in development', () => {
    process.env.NODE_ENV = 'development'
    const error = new Error('Test error')
    error.stack = 'Stack trace'

    errorHandler(error, req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: 'Stack trace'
      })
    )
  })

  it('should not include stack trace in production', () => {
    process.env.NODE_ENV = 'production'
    const error = new Error('Test error')
    error.stack = 'Stack trace'

    errorHandler(error, req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({
        stack: expect.anything()
      })
    )
  })

  it('should handle custom status codes', () => {
    const error = new Error('Custom error')
    error.status = 418

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(418)
  })
})

