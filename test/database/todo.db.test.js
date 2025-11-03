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

  test.beforeAll(() => {
    dbHelper.connect()
  })

  test.afterAll(() => {
    dbHelper.close()
  })

  test('should create todo record in database @db @todo', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Todo Creation')
    await allure.severity('critical')
    await allure.tag('@db', '@todo')

    const { userData, token } = await authHelper.createAndLoginTestUser()
    const userInDB = dbHelper.getUserByUsername(userData.username)

    const todoData = { title: 'DB Test Todo', description: 'Testing DB creation' }

    await allure.step('Create todo via API', async () => {
      await apiHelper.post('/todos', todoData)
    })

    await allure.step('Verify todo exists in database', async () => {
      const exists = await dbHelper.verifyTodoExists(todoData.title, userInDB.id)
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
      const { userData, token } = await authHelper.createAndLoginTestUser()
      const userInDB = dbHelper.getUserByUsername(userData.username)

      await apiHelper.post('/todos', { title: 'FK Test' })
      const todos = dbHelper.getTodosByUserId(userInDB.id)
      
      expect(todos.length).toBeGreaterThan(0)
      todos.forEach(todo => {
        expect(todo.userId).toBe(userInDB.id)
      })
    })
  })

  test('should cascade delete todos when user deleted @db @todo @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Cascade Delete')
    await allure.severity('critical')
    await allure.tag('@db', '@todo', '@integrity')

    const { userData, token } = await authHelper.createAndLoginTestUser()
    const userInDB = dbHelper.getUserByUsername(userData.username)

    await allure.step('Create todos for user', async () => {
      await apiHelper.post('/todos', { title: 'Todo 1' })
      await apiHelper.post('/todos', { title: 'Todo 2' })
      await apiHelper.post('/todos', { title: 'Todo 3' })
    })

    const todosBeforeDelete = dbHelper.getTodosByUserId(userInDB.id)
    await allure.parameter('Todos Before Delete', todosBeforeDelete.length.toString())

    await allure.step('Delete user', async () => {
      dbHelper.deleteUserByUsername(userData.username)
    })

    await allure.step('Verify todos cascade deleted', async () => {
      const todosAfterDelete = dbHelper.getTodosByUserId(userInDB.id)
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

    const { userData, token } = await authHelper.createAndLoginTestUser()
    const userInDB = dbHelper.getUserByUsername(userData.username)

    await allure.step('Create todo without completed field', async () => {
      const response = await apiHelper.post('/todos', { title: 'Default test' })
      const todoId = response.data.todo.id

      const todoInDB = dbHelper.getTodoById(todoId)
      expect(todoInDB.completed).toBe(0) // SQLite stores boolean as 0/1
    })
  })

  test('should have proper timestamps @db @todo', async () => {
    await allure.epic('Database Testing')
    await allure.feature('Todo Table')
    await allure.story('Timestamps')
    await allure.severity('minor')
    await allure.tag('@db', '@todo')

    const { userData, token } = await authHelper.createAndLoginTestUser()

    await allure.step('Create todo', async () => {
      const response = await apiHelper.post('/todos', { title: 'Timestamp test' })
      const todoId = response.data.todo.id

      const todoInDB = dbHelper.getTodoById(todoId)
      
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

    const { userData, token } = await authHelper.createAndLoginTestUser()

    let todoId

    await allure.step('Create todo', async () => {
      const response = await apiHelper.post('/todos', { title: 'Update test' })
      todoId = response.data.todo.id
    })

    const todoBeforeUpdate = dbHelper.getTodoById(todoId)
    const updatedAtBefore = todoBeforeUpdate.updatedAt

    await allure.step('Wait and update todo', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await apiHelper.patch(`/todos/${todoId}`, { title: 'Updated title' })
    })

    await allure.step('Verify updatedAt changed', async () => {
      const todoAfterUpdate = dbHelper.getTodoById(todoId)
      const updatedAtAfter = todoAfterUpdate.updatedAt
      
      expect(updatedAtAfter).not.toBe(updatedAtBefore)
      
      await allure.parameter('Before', updatedAtBefore)
      await allure.parameter('After', updatedAtAfter)
    })
  })
})

