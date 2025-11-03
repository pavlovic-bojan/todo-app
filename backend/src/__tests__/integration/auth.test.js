const request = require('supertest')
const express = require('express')
const mainRoutes = require('../../api/routes')
const errorHandler = require('../../api/middleware/ErrorHandler')
const { prisma } = require('../../config/db')

// Create test app
const createTestApp = () => {
  const app = express()
  app.use(express.json())
  app.use('/api', mainRoutes)
  app.use(errorHandler)
  return app
}

// Mock prisma
jest.mock('../../config/db')

describe('Authentication API Integration Tests', () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/users/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123',
        role: 'client',
        age: 25
      }

      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: 1,
        ...userData,
        createdAt: new Date()
      })

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201)

      expect(response.body.message).toBe('User registered successfully')
      expect(response.body.user).toBeDefined()
    })

    it('should reject registration with weak password', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'weak',
        role: 'client'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })

    it('should reject registration with invalid email', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'Password123'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })

    it('should reject registration with short username', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'Password123'
      }

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword: 'hashed_password',
        role: 'client'
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.update.mockResolvedValue(mockUser)

      // Mock bcrypt to return true
      const bcrypt = require('bcrypt')
      bcrypt.compare = jest.fn().mockResolvedValue(true)

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200)

      expect(response.body.message).toBe('Login successful')
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.user).toBeDefined()
    })

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ username: 'testuser' })
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('POST /api/users/forgot-password', () => {
    it('should handle forgot password request', async () => {
      const email = 'test@example.com'

      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: email
      })
      prisma.user.update.mockResolvedValue({})

      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email })
        .expect(200)

      expect(response.body.message).toContain('reset')
    })

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })
  })
})

