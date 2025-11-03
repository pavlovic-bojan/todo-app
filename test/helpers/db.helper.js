/**
 * Database Helper
 * Direct PostgreSQL database access for testing via Prisma
 */
const { PrismaClient } = require('@prisma/client')
const { allure } = require('allure-playwright')

class DBHelper {
  constructor() {
    this.prisma = null
  }

  /**
   * Connect to database
   */
  connect() {
    try {
      if (!this.prisma) {
        // Use DATABASE_URL from environment or fallback to backend
        this.prisma = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL
            }
          }
        })
      }
      return this.prisma
    } catch (error) {
      console.error('Database connection error:', error.message)
      throw error
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
    }
  }

  /**
   * Execute raw SQL query
   */
  async query(sql, params = []) {
    try {
      this.connect()
      const result = await this.prisma.$queryRawUnsafe(sql, ...params)
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
      const result = await this.prisma.$executeRawUnsafe(sql, ...params)
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
    return await this.prisma.user.findUnique({
      where: { username }
    })
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    this.connect()
    return await this.prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    this.connect()
    return await this.prisma.user.findUnique({
      where: { id }
    })
  }

  /**
   * Get all todos for user
   */
  async getTodosByUserId(userId) {
    this.connect()
    return await this.prisma.todo.findMany({
      where: { userId }
    })
  }

  /**
   * Get todo by ID
   */
  async getTodoById(id) {
    this.connect()
    return await this.prisma.todo.findUnique({
      where: { id }
    })
  }

  /**
   * Count users
   */
  async countUsers() {
    this.connect()
    return await this.prisma.user.count()
  }

  /**
   * Count todos
   */
  async countTodos() {
    this.connect()
    return await this.prisma.todo.count()
  }

  /**
   * Delete user by username
   */
  async deleteUserByUsername(username) {
    this.connect()
    return await this.prisma.user.delete({
      where: { username }
    })
  }

  /**
   * Delete all test users (username starts with testuser_)
   */
  async deleteTestUsers() {
    this.connect()
    return await this.prisma.user.deleteMany({
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
    return await this.prisma.todo.deleteMany()
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
    const todo = await this.prisma.todo.findFirst({
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
}

module.exports = new DBHelper()
