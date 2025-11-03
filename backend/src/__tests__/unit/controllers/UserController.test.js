const UserController = require('../../../api/controllers/UserController')
const UserService = require('../../../api/services/UserService')

// Mock UserService
jest.mock('../../../api/services/UserService')

describe('UserController', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {},
      cookies: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    }
    next = jest.fn()
    jest.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should register user and return 201', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      }

      const mockResult = {
        message: 'User registered successfully',
        user: { id: 1, ...userData }
      }

      req.body = userData
      UserService.registerUser.mockResolvedValue(mockResult)

      await UserController.registerUser(req, res, next)

      expect(UserService.registerUser).toHaveBeenCalledWith(userData)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockResult)
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next with error on failure', async () => {
      const error = new Error('Registration failed')
      UserService.registerUser.mockRejectedValue(error)

      await UserController.registerUser(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe('loginUser', () => {
    it('should login user and set refresh token cookie', async () => {
      const loginData = {
        username: 'testuser',
        password: 'Test123'
      }

      const mockResult = {
        message: 'Login successful',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: { id: 1, username: 'testuser' }
      }

      req.body = loginData
      UserService.loginUser.mockResolvedValue(mockResult)

      await UserController.loginUser(req, res, next)

      expect(UserService.loginUser).toHaveBeenCalledWith(loginData)
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict'
        })
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({ refreshToken: expect.anything() })
      )
    })
  })

  describe('refreshToken', () => {
    it('should refresh access token from cookie', async () => {
      req.cookies.refreshToken = 'valid_refresh_token'

      const mockResult = {
        message: 'Access token refreshed',
        accessToken: 'new_access_token'
      }

      UserService.refreshAccessToken.mockResolvedValue(mockResult)

      await UserController.refreshToken(req, res, next)

      expect(UserService.refreshAccessToken).toHaveBeenCalledWith('valid_refresh_token')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should return 401 if refresh token not found in cookies', async () => {
      req.cookies = {}

      await UserController.refreshToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token not found' })
    })
  })

  describe('logoutUser', () => {
    it('should logout user and clear cookie', async () => {
      req.user = { id: 1 }

      UserService.logoutUser.mockResolvedValue({ message: 'Logged out successfully' })

      await UserController.logoutUser(req, res, next)

      expect(UserService.logoutUser).toHaveBeenCalledWith(1)
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken')
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('forgotPassword', () => {
    it('should process forgot password request', async () => {
      req.body = { email: 'test@example.com' }

      const mockResult = {
        message: 'Reset token sent',
        resetToken: 'token123'
      }

      UserService.forgotPassword.mockResolvedValue(mockResult)

      await UserController.forgotPassword(req, res, next)

      expect(UserService.forgotPassword).toHaveBeenCalledWith('test@example.com')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('resetPassword', () => {
    it('should reset password with valid data', async () => {
      req.body = {
        resetToken: 'valid_token',
        newPassword: 'NewPassword123'
      }

      const mockResult = { message: 'Password reset successfully' }

      UserService.resetPassword.mockResolvedValue(mockResult)

      await UserController.resetPassword(req, res, next)

      expect(UserService.resetPassword).toHaveBeenCalledWith('valid_token', 'NewPassword123')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
      ]

      UserService.getAllUsers.mockResolvedValue(mockUsers)

      await UserController.getAllUsers(req, res, next)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockUsers)
    })
  })

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      req.params.id = '1'

      const mockUser = { id: 1, username: 'testuser' }

      UserService.getUserById.mockResolvedValue(mockUser)

      await UserController.getUserById(req, res, next)

      expect(UserService.getUserById).toHaveBeenCalledWith('1')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockUser)
    })
  })

  describe('updateUser', () => {
    it('should update user', async () => {
      req.params.id = '1'
      req.body = { email: 'new@example.com' }

      const mockResult = {
        message: 'User updated successfully',
        user: { id: 1, email: 'new@example.com' }
      }

      UserService.updateUser.mockResolvedValue(mockResult)

      await UserController.updateUser(req, res, next)

      expect(UserService.updateUser).toHaveBeenCalledWith('1', req.body)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      req.params.id = '1'

      const mockResult = { message: 'User deleted successfully' }

      UserService.deleteUser.mockResolvedValue(mockResult)

      await UserController.deleteUser(req, res, next)

      expect(UserService.deleteUser).toHaveBeenCalledWith('1')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('Error Handling', () => {
    it('should call next with error for any controller method', async () => {
      const error = new Error('Service error')
      UserService.registerUser.mockRejectedValue(error)

      await UserController.registerUser(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})

