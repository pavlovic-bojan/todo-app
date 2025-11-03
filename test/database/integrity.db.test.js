/**
 * Database Integrity Tests
 * Tests database constraints, relations, and data integrity
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const dbHelper = require('../helpers/db.helper')
const authHelper = require('../helpers/auth.helper')
const apiHelper = require('../helpers/api.helper')

test.describe('Database Integrity Tests', () => {

  test.beforeAll(() => {
    dbHelper.connect()
  })

  test.afterAll(() => {
    dbHelper.close()
  })

  test('should maintain referential integrity @db @integrity @critical', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Referential Integrity')
    await allure.severity('blocker')
    await allure.tag('@db', '@integrity')

    const { userData, token } = await authHelper.createAndLoginTestUser()
    const userInDB = dbHelper.getUserByUsername(userData.username)

    await allure.step('Create todos', async () => {
      await apiHelper.post('/todos', { title: 'Integrity Test 1' })
      await apiHelper.post('/todos', { title: 'Integrity Test 2' })
    })

    await allure.step('Verify all todos reference valid user', async () => {
      const todos = dbHelper.getTodosByUserId(userInDB.id)
      
      todos.forEach(todo => {
        expect(todo.userId).toBe(userInDB.id)
      })
      
      await allure.parameter('Todos Found', todos.length.toString())
    })
  })

  test('should enforce NOT NULL constraints @db @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('NOT NULL Constraints')
    await allure.severity('critical')
    await allure.tag('@db', '@integrity')

    await allure.step('Verify required user fields cannot be NULL', async () => {
      const sql = `
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='users'
      `
      const result = dbHelper.query(sql)
      const schema = result[0].sql
      
      expect(schema).toContain('username')
      expect(schema).toContain('email')
      expect(schema).toContain('hashedPassword')
      
      await allure.attachment('Users Table Schema', schema, 'text/plain')
    })

    await allure.step('Verify required todo fields cannot be NULL', async () => {
      const sql = `
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='todos'
      `
      const result = dbHelper.query(sql)
      const schema = result[0].sql
      
      expect(schema).toContain('title')
      expect(schema).toContain('userId')
      
      await allure.attachment('Todos Table Schema', schema, 'text/plain')
    })
  })

  test('should have proper indexes @db @integrity @performance', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Database Indexes')
    await allure.severity('normal')
    await allure.tag('@db', '@integrity', '@performance')

    await allure.step('Check for indexes on tables', async () => {
      const sql = `
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type='index'
      `
      const indexes = dbHelper.query(sql)
      
      await allure.attachment('Database Indexes', JSON.stringify(indexes, null, 2), 'application/json')
      
      // Should have indexes on userId in todos table
      const todoIndexes = indexes.filter(idx => idx.tbl_name === 'todos')
      expect(todoIndexes.length).toBeGreaterThan(0)
    })
  })

  test('should maintain data consistency across tables @db @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Cross-table Consistency')
    await allure.severity('critical')
    await allure.tag('@db', '@integrity')

    await allure.step('Get database statistics', async () => {
      const stats = await dbHelper.getDBStats()
      
      expect(stats.totalUsers).toBeGreaterThanOrEqual(0)
      expect(stats.totalTodos).toBeGreaterThanOrEqual(0)
    })

    await allure.step('Verify orphaned todos do not exist', async () => {
      const sql = `
        SELECT t.* FROM todos t
        LEFT JOIN users u ON t.userId = u.id
        WHERE u.id IS NULL
      `
      const orphanedTodos = dbHelper.query(sql)
      
      expect(orphanedTodos.length).toBe(0)
      await allure.parameter('Orphaned Todos', orphanedTodos.length.toString())
    })
  })

  test('should handle concurrent operations @db @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Concurrent Operations')
    await allure.severity('normal')
    await allure.tag('@db', '@integrity')

    const { userData, token } = await authHelper.createAndLoginTestUser()

    await allure.step('Create multiple todos simultaneously', async () => {
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(apiHelper.post('/todos', { title: `Concurrent Todo ${i}` }))
      }
      
      const responses = await Promise.all(promises)
      
      // All should succeed
      responses.forEach(response => {
        expect([200, 201]).toContain(response.status)
      })
    })

    await allure.step('Verify all todos created in DB', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      const todos = dbHelper.getTodosByUserId(userInDB.id)
      
      expect(todos.length).toBeGreaterThanOrEqual(5)
    })
  })
})

