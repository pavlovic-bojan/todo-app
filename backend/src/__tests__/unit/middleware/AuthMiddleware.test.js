const authenticateAndAuthorize = require('../../../api/middleware/AuthenticateAndAuthorize')
const jwt = require('jsonwebtoken')

jest.mock('jsonwebtoken')

describe('AuthenticateAndAuthorize Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      headers: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should authenticate valid token', () => {
      req.headers.authorization = 'Bearer valid_token'
      
      const mockUser = { id: 1, username: 'testuser', role: 'client' }
      jwt.verify.mockReturnValue(mockUser)

      const middleware = authenticateAndAuthorize([])
      middleware(req, res, next)

      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should reject request without authorization header', () => {
      const middleware = authenticateAndAuthorize([])
      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authorization header missing or malformed'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat token'

      const middleware = authenticateAndAuthorize([])
      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authorization header missing or malformed'
      })
    })

    it('should reject invalid token', () => {
      req.headers.authorization = 'Bearer invalid_token'
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const middleware = authenticateAndAuthorize([])
      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Authorization', () => {
    it('should allow user with correct role', () => {
      req.headers.authorization = 'Bearer valid_token'
      
      const mockUser = { id: 1, username: 'admin', role: 'admin' }
      jwt.verify.mockReturnValue(mockUser)

      const middleware = authenticateAndAuthorize(['admin'])
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should reject user with insufficient permissions', () => {
      req.headers.authorization = 'Bearer valid_token'
      
      const mockUser = { id: 1, username: 'client', role: 'client' }
      jwt.verify.mockReturnValue(mockUser)

      const middleware = authenticateAndAuthorize(['admin'])
      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        message: 'You do not have the required permissions'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should allow user with any of multiple allowed roles', () => {
      req.headers.authorization = 'Bearer valid_token'
      
      const mockUser = { id: 1, username: 'client', role: 'client' }
      jwt.verify.mockReturnValue(mockUser)

      const middleware = authenticateAndAuthorize(['admin', 'client'])
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should allow access when no roles specified', () => {
      req.headers.authorization = 'Bearer valid_token'
      
      const mockUser = { id: 1, username: 'user', role: 'client' }
      jwt.verify.mockReturnValue(mockUser)

      const middleware = authenticateAndAuthorize([])
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})

