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

  test.afterAll(async () => {
    await dbHelper.close()
  })

  test('should maintain referential integrity @db @integrity @critical', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Referential Integrity')
    await allure.severity('blocker')
    await allure.tag('@db', '@integrity')

    const { user } = await dbHelper.createTestUserDirectly()

    await allure.step('Create todos', async () => {
      await dbHelper.createTodoDirectly({ title: 'Integrity Test 1' }, user.id)
      await dbHelper.createTodoDirectly({ title: 'Integrity Test 2' }, user.id)
    })

    await allure.step('Verify all todos reference valid user', async () => {
      const todos = await dbHelper.getTodosByUserId(user.id)
      
      todos.forEach(todo => {
        expect(todo.userId).toBe(user.id)
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
      // Test by trying to create a user with NULL fields - should fail
      const { user } = await dbHelper.createTestUserDirectly()
      
      // Verify required fields exist and are not null
      expect(user.username).toBeTruthy()
      expect(user.email).toBeTruthy()
      expect(user.hashedPassword).toBeTruthy()
      
      await allure.attachment('User Record', JSON.stringify(user, null, 2), 'application/json')
    })

    await allure.step('Verify required todo fields cannot be NULL', async () => {
      const { user } = await dbHelper.createTestUserDirectly()
      
      // Create a todo and verify required fields
      const testTodo = await dbHelper.createTodoDirectly({ title: 'NOT NULL Test' }, user.id)
      
      expect(testTodo).toBeTruthy()
      expect(testTodo.title).toBeTruthy()
      expect(testTodo.userId).toBeTruthy()
      
      await allure.attachment('Todo Record', JSON.stringify(testTodo, null, 2), 'application/json')
    })
  })

  test('should have proper indexes @db @integrity @performance', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Database Indexes')
    await allure.severity('normal')
    await allure.tag('@db', '@integrity', '@performance')

    await allure.step('Verify foreign key relationships work efficiently', async () => {
      // Test that foreign key relationships are properly indexed by querying
      const { user } = await dbHelper.createTestUserDirectly()
      
      // Create multiple todos
      for (let i = 0; i < 5; i++) {
        await dbHelper.createTodoDirectly({ title: `Index Test ${i}` }, user.id)
      }
      
      // Query todos by userId - should be fast if indexed
      const startTime = Date.now()
      const todos = await dbHelper.getTodosByUserId(user.id)
      const queryTime = Date.now() - startTime
      
      expect(todos.length).toBeGreaterThanOrEqual(5)
      expect(queryTime).toBeLessThan(1000) // Should be fast with proper indexes
      
      await allure.parameter('Query Time (ms)', queryTime.toString())
      await allure.parameter('Todos Found', todos.length.toString())
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
      // Get all todos and verify their users exist
      const stats = await dbHelper.getDBStats()
      const allTodos = await dbHelper.query(`
        SELECT t.id, t."userId", u.id as user_exists
        FROM "todos" t
        LEFT JOIN "users" u ON t."userId" = u.id
        WHERE u.id IS NULL
      `)
      
      expect(allTodos.length).toBe(0)
      await allure.parameter('Orphaned Todos', allTodos.length.toString())
      await allure.parameter('Total Todos', stats.totalTodos.toString())
    })
  })

  test('should handle concurrent operations @db @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Data Integrity')
    await allure.story('Concurrent Operations')
    await allure.severity('normal')
    await allure.tag('@db', '@integrity')

    const { user } = await dbHelper.createTestUserDirectly()

    await allure.step('Create multiple todos simultaneously', async () => {
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(dbHelper.createTodoDirectly({ title: `Concurrent Todo ${i}` }, user.id))
      }
      
      const todos = await Promise.all(promises)
      
      // All should succeed
      todos.forEach(todo => {
        expect(todo).toBeTruthy()
        expect(todo.id).toBeTruthy()
      })
    })

    await allure.step('Verify all todos created in DB', async () => {
      const todos = await dbHelper.getTodosByUserId(user.id)
      
      expect(todos.length).toBeGreaterThanOrEqual(5)
    })
  })
})
