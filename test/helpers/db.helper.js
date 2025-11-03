/**
 * Database Helper
 * Direct SQLite database access for testing
 */
const Database = require('better-sqlite3')
const path = require('path')
const { allure } = require('allure-playwright')

class DBHelper {
  constructor() {
    const dbPath = path.join(__dirname, '../../backend/dev.db')
    this.db = null
    this.dbPath = dbPath
  }

  /**
   * Connect to database
   */
  connect() {
    try {
      if (!this.db) {
        const fs = require('fs')
        if (!fs.existsSync(this.dbPath)) {
          throw new Error(`Database file not found: ${this.dbPath}`)
        }
        
        this.db = new Database(this.dbPath, { readonly: false })
        this.db.pragma('journal_mode = WAL')
      }
      return this.db
    } catch (error) {
      console.error('Database connection error:', error.message)
      throw error
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * Execute raw SQL query
   */
  query(sql, params = []) {
    try {
      this.connect()
      const stmt = this.db.prepare(sql)
      return params.length > 0 ? stmt.all(...params) : stmt.all()
    } catch (error) {
      console.error('Database query error:', error.message)
      console.error('SQL:', sql)
      throw error
    }
  }

  /**
   * Execute raw SQL command (INSERT, UPDATE, DELETE)
   */
  exec(sql, params = []) {
    try {
      this.connect()
      const stmt = this.db.prepare(sql)
      return params.length > 0 ? stmt.run(...params) : stmt.run()
    } catch (error) {
      console.error('Database exec error:', error.message)
      console.error('SQL:', sql)
      throw error
    }
  }

  /**
   * Get user by username
   */
  getUserByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ?'
    const users = this.query(sql, [username])
    return users[0] || null
  }

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?'
    const users = this.query(sql, [email])
    return users[0] || null
  }

  /**
   * Get user by ID
   */
  getUserById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?'
    const users = this.query(sql, [id])
    return users[0] || null
  }

  /**
   * Get all todos for user
   */
  getTodosByUserId(userId) {
    const sql = 'SELECT * FROM todos WHERE userId = ?'
    return this.query(sql, [userId])
  }

  /**
   * Get todo by ID
   */
  getTodoById(id) {
    const sql = 'SELECT * FROM todos WHERE id = ?'
    const todos = this.query(sql, [id])
    return todos[0] || null
  }

  /**
   * Count users
   */
  countUsers() {
    const sql = 'SELECT COUNT(*) as count FROM users'
    const result = this.query(sql)
    return result[0].count
  }

  /**
   * Count todos
   */
  countTodos() {
    const sql = 'SELECT COUNT(*) as count FROM todos'
    const result = this.query(sql)
    return result[0].count
  }

  /**
   * Delete user by username
   */
  deleteUserByUsername(username) {
    const sql = 'DELETE FROM users WHERE username = ?'
    return this.exec(sql, [username])
  }

  /**
   * Delete all test users (username starts with testuser_)
   */
  deleteTestUsers() {
    const sql = "DELETE FROM users WHERE username LIKE 'testuser_%'"
    return this.exec(sql)
  }

  /**
   * Delete all todos
   */
  deleteAllTodos() {
    const sql = 'DELETE FROM todos'
    return this.exec(sql)
  }

  /**
   * Verify user exists
   */
  async verifyUserExists(username) {
    const user = this.getUserByUsername(username)
    
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
    const sql = 'SELECT * FROM todos WHERE title = ? AND userId = ?'
    const todos = this.query(sql, [title, userId])
    
    if (todos.length > 0) {
      await allure.attachment('Todo Found in DB', JSON.stringify(todos[0], null, 2), 'application/json')
    }
    
    return todos.length > 0
  }

  /**
   * Get database stats for Allure
   */
  async getDBStats() {
    const stats = {
      totalUsers: this.countUsers(),
      totalTodos: this.countTodos()
    }
    
    await allure.attachment('Database Stats', JSON.stringify(stats, null, 2), 'application/json')
    return stats
  }
}

module.exports = new DBHelper()

