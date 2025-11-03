const UserService = require('../../../api/services/UserService')
const { prisma } = require('../../../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Mock dependencies
jest.mock('../../../config/db')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123',
        role: 'client',
        age: 25
      }

      prisma.user.findFirst.mockResolvedValue(null)
      bcrypt.hash.mockResolvedValue('hashed_password')
      prisma.user.create.mockResolvedValue({
        id: 1,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        age: userData.age,
        createdAt: new Date()
      })

      const result = await UserService.registerUser(userData)

      expect(result.message).toBe('User registered successfully')
      expect(result.user.username).toBe(userData.username)
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12)
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('should throw error if username already exists', async () => {
      const userData = {
        username: 'existing',
        email: 'test@example.com',
        password: 'Test123'
      }

      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        username: 'existing'
      })

      await expect(UserService.registerUser(userData)).rejects.toThrow('User already exists')
    })

    it('should throw error if email already exists', async () => {
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Test123'
      }

      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'existing@example.com'
      })

      await expect(UserService.registerUser(userData)).rejects.toThrow('Email already exists')
    })
  })

  describe('loginUser', () => {
    it('should successfully login user and return tokens', async () => {
      const loginData = {
        username: 'testuser',
        password: 'Test123'
      }

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword: 'hashed_password',
        role: 'client'
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue('mock_token')
      prisma.user.update.mockResolvedValue(mockUser)

      const result = await UserService.loginUser(loginData)

      expect(result.message).toBe('Login successful')
      expect(result.accessToken).toBe('mock_token')
      expect(result.refreshToken).toBe('mock_token')
      expect(result.user.username).toBe(loginData.username)
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.hashedPassword)
    })

    it('should throw error for invalid credentials (user not found)', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'Test123'
      }

      prisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.loginUser(loginData)).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for invalid credentials (wrong password)', async () => {
      const loginData = {
        username: 'testuser',
        password: 'WrongPassword'
      }

      const mockUser = {
        id: 1,
        username: 'testuser',
        hashedPassword: 'hashed_password'
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)

      await expect(UserService.loginUser(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('forgotPassword', () => {
    it('should generate reset token for valid email', async () => {
      const email = 'test@example.com'

      const mockUser = {
        id: 1,
        email: email
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.update.mockResolvedValue(mockUser)

      const result = await UserService.forgotPassword(email)

      expect(result.message).toContain('Password reset token generated successfully')
      expect(result.resetToken).toBeDefined()
      expect(prisma.user.update).toHaveBeenCalled()
    })

    it('should not reveal if email does not exist', async () => {
      const email = 'nonexistent@example.com'

      prisma.user.findUnique.mockResolvedValue(null)

      const result = await UserService.forgotPassword(email)

      expect(result.message).toContain('If the email exists')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const resetToken = 'valid_token'
      const newPassword = 'NewPassword123'

      const mockUser = {
        id: 1,
        hashedResetToken: 'hashed_token',
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }

      prisma.user.findFirst.mockResolvedValue(mockUser)
      bcrypt.hash.mockResolvedValue('new_hashed_password')
      prisma.user.update.mockResolvedValue(mockUser)

      const result = await UserService.resetPassword(resetToken, newPassword)

      expect(result.message).toBe('Password reset successfully')
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12)
      expect(prisma.user.update).toHaveBeenCalled()
    })

    it('should throw error for invalid reset token', async () => {
      const resetToken = 'invalid_token'
      const newPassword = 'NewPassword123'

      prisma.user.findFirst.mockResolvedValue(null)

      await expect(UserService.resetPassword(resetToken, newPassword)).rejects.toThrow('Invalid or expired reset token')
    })

    it('should require both token and password', async () => {
      await expect(UserService.resetPassword('', 'NewPassword123')).rejects.toThrow()
      await expect(UserService.resetPassword('token', '')).rejects.toThrow()
    })
  })

  describe('refreshAccessToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token'

      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'client',
        refreshToken: refreshToken,
        refreshTokenExpiry: new Date(Date.now() + 86400000)
      }

      jwt.verify.mockReturnValue({ id: 1, username: 'testuser' })
      prisma.user.findUnique.mockResolvedValue(mockUser)
      jwt.sign.mockReturnValue('new_access_token')

      const result = await UserService.refreshAccessToken(refreshToken)

      expect(result.message).toBe('Access token refreshed')
      expect(result.accessToken).toBe('new_access_token')
    })

    it('should throw error for invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(UserService.refreshAccessToken('invalid_token')).rejects.toThrow('Invalid or expired refresh token')
    })

    it('should throw error if refresh token is missing', async () => {
      await expect(UserService.refreshAccessToken(null)).rejects.toThrow('Refresh token is required')
    })
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@test.com', role: 'client' },
        { id: 2, username: 'user2', email: 'user2@test.com', role: 'admin' }
      ]

      prisma.user.findMany.mockResolvedValue(mockUsers)

      const result = await UserService.getAllUsers()

      expect(result).toEqual(mockUsers)
      expect(result.length).toBe(2)
    })
  })

  describe('getUserById', () => {
    it('should return user by valid ID', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'client'
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await UserService.getUserById('1')

      expect(result).toEqual(mockUser)
    })

    it('should throw error for invalid ID format', async () => {
      await expect(UserService.getUserById('invalid')).rejects.toThrow('Invalid ID format')
    })

    it('should throw error if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.getUserById('999')).rejects.toThrow('User not found')
    })
  })

  describe('updateUser', () => {
    it('should successfully update user', async () => {
      const userId = '1'
      const updates = {
        email: 'newemail@example.com',
        age: 30
      }

      const mockExistingUser = { id: 1, username: 'testuser', email: 'old@example.com' }
      const mockUpdatedUser = { ...mockExistingUser, ...updates }

      prisma.user.findUnique.mockResolvedValue(mockExistingUser)
      prisma.user.update.mockResolvedValue(mockUpdatedUser)

      const result = await UserService.updateUser(userId, updates)

      expect(result.message).toBe('User updated successfully')
      expect(result.user.email).toBe(updates.email)
      expect(prisma.user.update).toHaveBeenCalled()
    })

    it('should hash password when updating password', async () => {
      const userId = '1'
      const updates = { password: 'NewPassword123' }

      const mockUser = { id: 1, username: 'testuser' }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      bcrypt.hash.mockResolvedValue('new_hashed_password')
      prisma.user.update.mockResolvedValue(mockUser)

      await UserService.updateUser(userId, updates)

      expect(bcrypt.hash).toHaveBeenCalledWith(updates.password, 12)
    })

    it('should throw error if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.updateUser('999', {})).rejects.toThrow('User not found')
    })
  })

  describe('logoutUser', () => {
    it('should clear refresh token on logout', async () => {
      const userId = 1

      prisma.user.update.mockResolvedValue({})

      const result = await UserService.logoutUser(userId)

      expect(result.message).toBe('Logged out successfully')
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpiry: null
        }
      })
    })
  })

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      const mockUser = { id: 1, username: 'testuser' }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.delete.mockResolvedValue(mockUser)

      const result = await UserService.deleteUser('1')

      expect(result.message).toBe('User deleted successfully')
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should throw error if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.deleteUser('999')).rejects.toThrow('User not found')
    })
  })
})

