/**
 * Database Helper
 * Direct PostgreSQL database access for testing via Prisma
 */
const path = require('path')
const bcrypt = require('bcrypt')
const { allure } = require('allure-playwright')

// Try to load PrismaClient from backend folder first, then fallback to test folder
let PrismaClient
try {
  // Try to load from backend node_modules (where Prisma Client is generated)
  const backendPrismaPath = path.resolve(__dirname, '../../backend/node_modules/@prisma/client')
  PrismaClient = require(backendPrismaPath).PrismaClient
} catch (error) {
  // Fallback to test folder's node_modules
  try {
    PrismaClient = require('@prisma/client').PrismaClient
  } catch (fallbackError) {
    throw new Error('PrismaClient not found! Please run "npm install" in test folder and "npm run prisma:generate" in backend folder.')
  }
}

// Load environment variables from .env file
// Try to load from test folder first, then from backend folder (where DATABASE_URL is usually stored)
const testEnvPath = path.resolve(__dirname, '../.env')
const backendEnvPath = path.resolve(__dirname, '../../backend/.env')

// Load .env from test folder if it exists
require('dotenv').config({ path: testEnvPath })

// Load .env from backend folder (this will override test/.env if both exist)
// This ensures DATABASE_URL from backend/.env is used
require('dotenv').config({ path: backendEnvPath })

class DBHelper {
  constructor() {
    this._prisma = null
  }

  /**
   * Connect to database
   */
  connect() {
    try {
      if (!this._prisma) {
        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
          throw new Error('DATABASE_URL environment variable is not set! Please create .env file in backend/ folder with DATABASE_URL.')
        }
        
        // Log database type for debugging
        const dbUrl = process.env.DATABASE_URL
        const dbType = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') 
          ? 'PostgreSQL' 
          : dbUrl.startsWith('file:') 
            ? 'SQLite' 
            : 'Unknown'
        
        console.log(`📊 Connecting to ${dbType} database...`)
        console.log(`📊 Database URL: ${dbUrl.substring(0, Math.min(50, dbUrl.length))}...`)
        
        // PrismaClient automatically uses DATABASE_URL from environment
        // No need to explicitly set datasources if DATABASE_URL is set
        this._prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['error'] : []
        })
      }
      return this._prisma
    } catch (error) {
      console.error('❌ Database connection error:', error.message)
      if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing!')
        console.error('❌ Please create .env file in backend/ folder with:')
        console.error('❌ DATABASE_URL="your-postgresql-connection-string"')
      }
      throw error
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this._prisma) {
      await this._prisma.$disconnect()
      this._prisma = null
    }
  }

  /**
   * Execute raw SQL query
   */
  async query(sql, params = []) {
    try {
      this.connect()
      const result = await this._prisma.$queryRawUnsafe(sql, ...params)
      return result
    } catch (error) {
      console.error('Database query error:', error.message)
      console.error('SQL:', sql)
      throw error
    }
  }

  /**
   * Execute raw SQL command (INSERT, UPDATE, DELETE)
   */
  async exec(sql, params = []) {
    try {
      this.connect()
      const result = await this._prisma.$executeRawUnsafe(sql, ...params)
      return result
    } catch (error) {
      console.error('Database exec error:', error.message)
      console.error('SQL:', sql)
      throw error
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    this.connect()
    return await this._prisma.user.findUnique({
      where: { username }
    })
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    this.connect()
    return await this._prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    this.connect()
    return await this._prisma.user.findUnique({
      where: { id }
    })
  }

  /**
   * Get all todos for user
   */
  async getTodosByUserId(userId) {
    this.connect()
    return await this._prisma.todo.findMany({
      where: { userId }
    })
  }

  /**
   * Get todo by ID
   */
  async getTodoById(id) {
    this.connect()
    return await this._prisma.todo.findUnique({
      where: { id }
    })
  }

  /**
   * Count users
   */
  async countUsers() {
    this.connect()
    return await this._prisma.user.count()
  }

  /**
   * Count todos
   */
  async countTodos() {
    this.connect()
    return await this._prisma.todo.count()
  }

  /**
   * Delete user by username
   */
  async deleteUserByUsername(username) {
    this.connect()
    try {
      // Use deleteMany instead of delete to avoid throwing error if user doesn't exist
      const result = await this._prisma.user.deleteMany({
        where: { username }
      })
      return result.count > 0 ? { username } : null
    } catch (error) {
      // Fallback: if deleteMany fails for some reason, just return null
      return null
    }
  }

  /**
   * Delete all test users (username starts with testuser_)
   */
  async deleteTestUsers() {
    this.connect()
    return await this._prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'testuser_'
        }
      }
    })
  }

  /**
   * Delete all todos
   */
  async deleteAllTodos() {
    this.connect()
    return await this._prisma.todo.deleteMany()
  }

  /**
   * Verify user exists
   */
  async verifyUserExists(username) {
    const user = await this.getUserByUsername(username)
    
    if (user) {
      await allure.attachment('User Found in DB', JSON.stringify(user, null, 2), 'application/json')
    } else {
      await allure.attachment('User Not Found', `Username: ${username}`, 'text/plain')
    }
    
    return !!user
  }

  /**
   * Verify todo exists
   */
  async verifyTodoExists(title, userId) {
    this.connect()
    const todo = await this._prisma.todo.findFirst({
      where: {
        title,
        userId
      }
    })
    
    if (todo) {
      await allure.attachment('Todo Found in DB', JSON.stringify(todo, null, 2), 'application/json')
    }
    
    return !!todo
  }

  /**
   * Create test user directly in database (bypasses API, avoids rate limiting)
   * Use this for database tests instead of authHelper.createTestUser()
   */
  async createTestUserDirectly(userData = {}) {
    this.connect()
    
    const { faker } = require('@faker-js/faker')
    
    // Generate unique test user data with more entropy to avoid conflicts
    const timestamp = Date.now()
    const random = faker.string.alphanumeric(10)
    const username = userData.username || `testuser_${random}_${timestamp}`
    const email = userData.email || `test_${random}_${timestamp}@test.com`
    const password = userData.password || 'TestPassword123!'
    const role = userData.role || 'client'
    const age = userData.age || null
    
    // Hash password using bcrypt (same as backend)
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user directly in database
    // If user already exists (unique constraint), try with a new random suffix
    let user
    let attempts = 0
    let finalUsername = username
    let finalEmail = email
    
    while (attempts < 3) {
      try {
        user = await this._prisma.user.create({
          data: {
            username: finalUsername,
            email: finalEmail,
            hashedPassword,
            role,
            age: age ? parseInt(age) : null
          }
        })
        break // Success, exit loop
      } catch (error) {
        // Check for Prisma unique constraint error (P2002) or unique constraint message
        const isUniqueConstraintError = error.code === 'P2002' || 
          (error.message && error.message.includes('Unique constraint failed'))
        
        if (isUniqueConstraintError && attempts < 2) {
          // Unique constraint violation, try again with new random suffix
          attempts++
          const newRandom = faker.string.alphanumeric(10)
          const newTimestamp = Date.now()
          finalUsername = userData.username || `testuser_${newRandom}_${newTimestamp}`
          finalEmail = userData.email || `test_${newRandom}_${newTimestamp}@test.com`
        } else {
          // Re-throw if it's not a unique constraint error or we've tried too many times
          throw error
        }
      }
    }
    
    return {
      userData: {
        username: finalUsername,
        email: finalEmail,
        password, // Return plain password for login tests
        role,
        age
      },
      user // Return full user object from DB
    }
  }

  /**
   * Create todo directly in database (bypasses API, avoids rate limiting)
   * Use this for database tests instead of apiHelper.post('/todos')
   */
  async createTodoDirectly(todoData, userId) {
    this.connect()
    
    const todo = await this._prisma.todo.create({
      data: {
        title: todoData.title,
        description: todoData.description || null,
        completed: todoData.completed !== undefined ? todoData.completed : false,
        userId: userId
      }
    })
    
    return todo
  }

  /**
   * Get database stats for Allure
   */
  async getDBStats() {
    const stats = {
      totalUsers: await this.countUsers(),
      totalTodos: await this.countTodos()
    }
    
    await allure.attachment('Database Stats', JSON.stringify(stats, null, 2), 'application/json')
    return stats
  }

  /**
   * Get Prisma client instance (for direct database access in tests)
   */
  get prisma() {
    return this._prisma || this.connect()
  }
}

module.exports = new DBHelper()
