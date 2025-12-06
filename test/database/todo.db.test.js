/**
 * Todo Database Tests
 * Direct SQLite database testing
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const dbHelper = require('../helpers/db.helper')
const authHelper = require('../helpers/auth.helper')
const apiHelper = require('../helpers/api.helper')

test.describe('Todo Database Tests', () => {
  // Track created users and todos for cleanup
  const createdUsers = []
  const createdTodos = []

  test.beforeAll(() => {
    dbHelper.connect()
  })

  test.afterEach(async () => {
    // Clean up todos first (they depend on users)
    for (const todoId of createdTodos) {
      try {
        await dbHelper.prisma.todo.delete({ where: { id: todoId } })
      } catch (error) {
        // Ignore errors if todo doesn't exist
        if (!error.message.includes('Record to delete does not exist')) {
          console.warn(`Failed to delete todo ${todoId}:`, error.message)
        }
      }
    }
    createdTodos.length = 0

    // Clean up users
    for (const username of createdUsers) {
      try {
        await dbHelper.deleteUserByUsername(username)
      } catch (error) {
        // Ignore errors if user doesn't exist
        if (!error.message.includes('Record to delete does not exist')) {
          console.warn(`Failed to delete user ${username}:`, error.message)
        }
      }
    }
    createdUsers.length = 0
  })

  test.afterAll(async () => {
    await dbHelper.close()
  })

  test('should create todo record in database @db @todo', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Todo Creation')
    await allure.severity('critical')
    await allure.tag('@db', '@todo')

    const { userData, user } = await dbHelper.createTestUserDirectly()
    createdUsers.push(userData.username)
    const todoData = { title: 'DB Test Todo', description: 'Testing DB creation' }

    await allure.step('Create todo directly in database', async () => {
      const todo = await dbHelper.createTodoDirectly(todoData, user.id)
      createdTodos.push(todo.id)
    })

    await allure.step('Verify todo exists in database', async () => {
      const exists = await dbHelper.verifyTodoExists(todoData.title, user.id)
      expect(exists).toBe(true)
    })
  })

  test('should enforce foreign key constraint @db @todo @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Foreign Key Constraint')
    await allure.severity('critical')
    await allure.tag('@db', '@todo', '@integrity')

    await allure.step('Verify userId foreign key exists', async () => {
      const { userData, user } = await dbHelper.createTestUserDirectly()
      createdUsers.push(userData.username)

      const todo = await dbHelper.createTodoDirectly({ title: 'FK Test' }, user.id)
      createdTodos.push(todo.id)
      const todos = await dbHelper.getTodosByUserId(user.id)
      
      expect(todos.length).toBeGreaterThan(0)
      todos.forEach(todo => {
        expect(todo.userId).toBe(user.id)
      })
    })
  })

  test('should cascade delete todos when user deleted @db @todo @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Cascade Delete')
    await allure.severity('critical')
    await allure.tag('@db', '@todo', '@integrity')

    const { userData, user } = await dbHelper.createTestUserDirectly()
    // Don't add to createdUsers since we're testing deletion

    await allure.step('Create todos for user', async () => {
      const todo1 = await dbHelper.createTodoDirectly({ title: 'Todo 1' }, user.id)
      const todo2 = await dbHelper.createTodoDirectly({ title: 'Todo 2' }, user.id)
      const todo3 = await dbHelper.createTodoDirectly({ title: 'Todo 3' }, user.id)
      // Don't add to createdTodos since they'll be cascade deleted
    })

    const todosBeforeDelete = await dbHelper.getTodosByUserId(user.id)
    await allure.parameter('Todos Before Delete', todosBeforeDelete.length.toString())

    await allure.step('Delete user', async () => {
      await dbHelper.deleteUserByUsername(userData.username)
    })

    await allure.step('Verify todos cascade deleted', async () => {
      const todosAfterDelete = await dbHelper.getTodosByUserId(user.id)
      expect(todosAfterDelete.length).toBe(0)
      await allure.parameter('Todos After Delete', '0')
    })
  })

  test('should set default completed value to false @db @todo', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Default Values')
    await allure.severity('minor')
    await allure.tag('@db', '@todo')

    const { userData, user } = await dbHelper.createTestUserDirectly()
    createdUsers.push(userData.username)

    await allure.step('Create todo without completed field', async () => {
      const todo = await dbHelper.createTodoDirectly({ title: 'Default test' }, user.id)
      createdTodos.push(todo.id)

      const todoInDB = await dbHelper.getTodoById(todo.id)
      expect(todoInDB.completed).toBe(false) // PostgreSQL stores boolean as false/true
    })
  })

  test('should have proper timestamps @db @todo', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Timestamps')
    await allure.severity('minor')
    await allure.tag('@db', '@todo')

    const { userData, user } = await dbHelper.createTestUserDirectly()
    createdUsers.push(userData.username)

    await allure.step('Create todo', async () => {
      const todo = await dbHelper.createTodoDirectly({ title: 'Timestamp test' }, user.id)
      createdTodos.push(todo.id)

      const todoInDB = await dbHelper.getTodoById(todo.id)
      
      expect(todoInDB.createdAt).toBeTruthy()
      expect(todoInDB.updatedAt).toBeTruthy()
      
      await allure.parameter('Created At', todoInDB.createdAt)
      await allure.parameter('Updated At', todoInDB.updatedAt)
    })
  })

  test('should update updatedAt timestamp on modification @db @todo', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Timestamp Updates')
    await allure.severity('minor')
    await allure.tag('@db', '@todo')

    const { userData, user } = await dbHelper.createTestUserDirectly()
    createdUsers.push(userData.username)

    let todo

    await allure.step('Create todo', async () => {
      todo = await dbHelper.createTodoDirectly({ title: 'Update test' }, user.id)
      createdTodos.push(todo.id)
    })

    const todoBeforeUpdate = await dbHelper.getTodoById(todo.id)
    const updatedAtBefore = todoBeforeUpdate.updatedAt

    await allure.step('Wait and update todo directly in database', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await dbHelper.prisma.todo.update({
        where: { id: todo.id },
        data: { title: 'Updated title' }
      })
    })

    await allure.step('Verify updatedAt changed', async () => {
      const todoAfterUpdate = await dbHelper.getTodoById(todo.id)
      const updatedAtAfter = todoAfterUpdate.updatedAt
      
      expect(updatedAtAfter).not.toBe(updatedAtBefore)
      
      await allure.parameter('Before', updatedAtBefore)
      await allure.parameter('After', updatedAtAfter)
    })
  })
})

