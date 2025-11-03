const request = require('supertest')
const express = require('express')
const mainRoutes = require('../../api/routes')
const errorHandler = require('../../api/middleware/ErrorHandler')
const { prisma } = require('../../config/db')
const jwt = require('jsonwebtoken')

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
jest.mock('jsonwebtoken')

describe('Todo API Integration Tests', () => {
  let app
  let authToken

  beforeAll(() => {
    app = createTestApp()
    authToken = 'valid_test_token'
    
    // Mock JWT verification
    jwt.verify.mockReturnValue({
      id: 1,
      username: 'testuser',
      role: 'client'
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/todos', () => {
    it('should create a new todo with valid data', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Test description'
      }

      const mockTodo = {
        id: 1,
        ...todoData,
        userId: 1,
        completed: false,
        createdAt: new Date(),
        user: { id: 1, username: 'testuser', email: 'test@test.com' }
      }

      prisma.todo.create.mockResolvedValue(mockTodo)

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201)

      expect(response.body.message).toBe('Todo created successfully')
      expect(response.body.todo.title).toBe(todoData.title)
    })

    it('should reject todo creation without auth token', async () => {
      const todoData = {
        title: 'New Todo'
      }

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(401)

      expect(response.body.message).toContain('Authorization')
    })

    it('should reject todo with empty title', async () => {
      const todoData = {
        title: ''
      }

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })

    it('should reject todo with too long title', async () => {
      const todoData = {
        title: 'a'.repeat(256)
      }

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('GET /api/todos', () => {
    it('should return all todos for authenticated user', async () => {
      const mockTodos = [
        { id: 1, title: 'Todo 1', userId: 1, completed: false },
        { id: 2, title: 'Todo 2', userId: 1, completed: true }
      ]

      prisma.todo.findMany.mockResolvedValue(mockTodos)

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
    })

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401)

      expect(response.body.message).toContain('Authorization')
    })
  })

  describe('GET /api/todos/:id', () => {
    it('should return todo by ID for owner', async () => {
      const mockTodo = {
        id: 1,
        title: 'Test Todo',
        userId: 1,
        user: { id: 1, username: 'testuser', email: 'test@test.com' }
      }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)

      const response = await request(app)
        .get('/api/todos/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.title).toBe('Test Todo')
    })

    it('should reject invalid ID format', async () => {
      const response = await request(app)
        .get('/api/todos/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('PATCH /api/todos/:id', () => {
    it('should update todo with valid data', async () => {
      const updates = {
        title: 'Updated Title',
        completed: true
      }

      const mockExistingTodo = { id: 1, userId: 1, title: 'Old' }
      const mockUpdatedTodo = { ...mockExistingTodo, ...updates }

      prisma.todo.findFirst.mockResolvedValue(mockExistingTodo)
      prisma.todo.update.mockResolvedValue(mockUpdatedTodo)

      const response = await request(app)
        .patch('/api/todos/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200)

      expect(response.body.message).toBe('Todo updated successfully')
    })

    it('should reject update with invalid data', async () => {
      const updates = {
        completed: 'not-boolean'
      }

      const response = await request(app)
        .patch('/api/todos/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(400)

      expect(response.body.message).toBe('Validation failed')
    })
  })

  describe('DELETE /api/todos/:id', () => {
    it('should delete todo by ID', async () => {
      const mockTodo = { id: 1, userId: 1 }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)
      prisma.todo.delete.mockResolvedValue(mockTodo)

      const response = await request(app)
        .delete('/api/todos/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toBe('Todo deleted successfully')
    })

    it('should reject delete without auth', async () => {
      const response = await request(app)
        .delete('/api/todos/1')
        .expect(401)

      expect(response.body.message).toContain('Authorization')
    })
  })

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle todo completion status', async () => {
      const mockTodo = { id: 1, userId: 1, completed: false }
      const mockToggledTodo = { ...mockTodo, completed: true }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)
      prisma.todo.update.mockResolvedValue(mockToggledTodo)

      const response = await request(app)
        .patch('/api/todos/1/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toContain('toggled')
    })
  })
})

