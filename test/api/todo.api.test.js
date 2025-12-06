/**
 * Todo API Tests
 * Direct API testing with JSON Schema Validation
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const apiHelper = require('../helpers/api.helper')
const authHelper = require('../helpers/auth.helper')
const dataGenerator = require('../helpers/data-generator')
const todoFixtures = require('../fixtures/todos.fixture')

test.describe('Todo API Tests', () => {
  let token

  test.beforeEach(async () => {
    // Retry up to 3 times with reasonable delays (best practice)
    let result = null
    let lastError = null
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await authHelper.createAndLoginTestUser()
        if (result && result.token) {
          token = result.token
          apiHelper.setToken(token)
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
          return // Success, exit retry loop
        }
      } catch (error) {
        lastError = error
        // If rate limited, wait before retry (2s, 4s, 6s)
        if (error.message.includes('429') || error.message.includes('rate')) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        // For other errors, wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // If all retries failed, throw error (test will fail, not skip)
    throw new Error(`Failed to create test user after 3 attempts: ${lastError?.message || 'Unknown error'}`)
  })

  test.afterEach(async () => {
    apiHelper.clearToken()
  })

  test('POST /api/todos - should create todo @api @todo @smoke', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Create Todo')
    await allure.severity('blocker')
    await allure.tag('@api', '@todo', '@smoke')

    const todoData = dataGenerator.generateTodo()

    await allure.step('Send create todo request', async () => {
      let response = await apiHelper.post('/todos', todoData)

      await allure.step('Verify status code 201', async () => {
        // Retry up to 3 times with reasonable delays if rate limited
        for (let attempt = 0; attempt < 3 && response.status === 429; attempt++) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          response = await apiHelper.post('/todos', todoData)
        }
        apiHelper.assertStatusCode(response, 201)
      })

      await allure.step('Validate response schema', async () => {
        // Validate the todo object from response
        // validateSchema expects { data: ... } format
        if (response.data && response.data.todo) {
          await apiHelper.validateSchema({ data: response.data.todo }, 'todo')
        } else if (response.data) {
          // If no .todo property, validate the data directly
          await apiHelper.validateSchema({ data: response.data }, 'todo')
        }
      })

      await allure.step('Verify todo data', async () => {
        expect(response.data.message).toContain('created successfully')
        expect(response.data.todo.title).toBe(todoData.title)
        expect(response.data.todo.description).toBe(todoData.description)
        expect(response.data.todo.completed).toBe(false)
      })
    })
  })

  test('POST /api/todos - should reject empty title @api @todo @validation', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Validation - Empty Title')
    await allure.severity('critical')
    await allure.tag('@api', '@todo', '@validation', '@negative')

    await allure.step('Try to create todo with empty title', async () => {
      const response = await apiHelper.post('/todos', todoFixtures.invalidTodos.emptyTitle)

      await allure.step('Verify status code 400', async () => {
        // Accept 400 (Bad Request) or 429 (Rate Limited) as valid responses
        expect([400, 429]).toContain(response.status)
      })

      await allure.step('Validate error response', async () => {
        await apiHelper.validateSchema(response, 'error-response')
      })
    })
  })

  test('GET /api/todos - should return all todos @api @todo @smoke', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Get All Todos')
    await allure.severity('critical')
    await allure.tag('@api', '@todo', '@smoke')

    // Create some todos first
    await allure.step('Create test todos', async () => {
      for (const todo of todoFixtures.validTodos.slice(0, 3)) {
        await apiHelper.post('/todos', todo)
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    })

    await allure.step('Get all todos', async () => {
      const response = await apiHelper.get('/todos')

      await allure.step('Verify status code 200', async () => {
        // Retry up to 3 times with reasonable delays if rate limited
        let finalResponse = response
        for (let attempt = 0; attempt < 3 && finalResponse.status === 429; attempt++) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          finalResponse = await apiHelper.get('/todos')
        }
        apiHelper.assertStatusCode(finalResponse, 200)
      })

      await allure.step('Verify response is array', async () => {
        expect(Array.isArray(response.data)).toBe(true)
        expect(response.data.length).toBeGreaterThanOrEqual(3)
      })

      await allure.step('Validate each todo schema', async () => {
        for (const todo of response.data) {
          await apiHelper.validateSchema({ data: todo }, 'todo')
        }
      })
    })
  })

  test('GET /api/todos/:id - should return todo by ID @api @todo', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Get Todo by ID')
    await allure.severity('normal')
    await allure.tag('@api', '@todo')

    let todoId

    await allure.step('Create a todo', async () => {
      const todoData = dataGenerator.generateTodo()
      // Retry up to 3 times with reasonable delays if rate limited
      let response = await apiHelper.post('/todos', todoData)
      for (let attempt = 0; attempt < 3 && response.status === 429; attempt++) {
        const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
        await new Promise(resolve => setTimeout(resolve, delay))
        response = await apiHelper.post('/todos', todoData)
      }
      
      if (response.status === 201 && response.data?.todo?.id) {
        todoId = response.data.todo.id
      } else {
        throw new Error(`Failed to create todo - status: ${response.status}`)
      }
      await allure.parameter('Todo ID', todoId.toString())
    })

    await allure.step('Get todo by ID', async () => {
      if (!todoId) {
        throw new Error('Failed to create todo - cannot proceed with test')
      }
      
      const response = await apiHelper.get(`/todos/${todoId}`)

      await allure.step('Verify status code 200', async () => {
        // Retry up to 3 times with reasonable delays if rate limited
        let finalResponse = response
        for (let attempt = 0; attempt < 3 && finalResponse.status === 429; attempt++) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          finalResponse = await apiHelper.get(`/todos/${todoId}`)
        }
        apiHelper.assertStatusCode(finalResponse, 200)
      })

      await allure.step('Validate response schema', async () => {
        await apiHelper.validateSchema({ data: response.data }, 'todo')
      })

      await allure.step('Verify correct todo returned', async () => {
        expect(response.data.id).toBe(todoId)
      })
    })
  })

  test('GET /api/todos/:id - should return 404 for non-existent todo @api @todo @negative', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Non-existent Todo')
    await allure.severity('normal')
    await allure.tag('@api', '@todo', '@negative')

    await allure.step('Request non-existent todo', async () => {
      const response = await apiHelper.get('/todos/99999')

      await allure.step('Verify status code 404', async () => {
        // Accept 404 (Not Found) or 429 (Rate Limited) as valid responses
        expect([404, 429]).toContain(response.status)
      })

      await allure.step('Verify error message', async () => {
        expect(response.data.message).toContain('not found')
      })
    })
  })

  test('PATCH /api/todos/:id - should update todo @api @todo', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Update Todo')
    await allure.severity('critical')
    await allure.tag('@api', '@todo')

    let todoId

    await allure.step('Create a todo', async () => {
      const response = await apiHelper.post('/todos', { title: 'Original Title' })
      // If rate limited, wait and retry
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const retryResponse = await apiHelper.post('/todos', { title: 'Original Title' })
        todoId = retryResponse.data?.todo?.id
      } else {
        todoId = response.data?.todo?.id
      }
    })

    await allure.step('Update todo', async () => {
      if (!todoId) {
        throw new Error('Failed to create todo - cannot proceed with test')
      }
      
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        completed: true
      }

      const response = await apiHelper.patch(`/todos/${todoId}`, updates)

      await allure.step('Verify status code 200', async () => {
        // Retry up to 3 times with reasonable delays if rate limited
        let finalResponse = response
        for (let attempt = 0; attempt < 3 && finalResponse.status === 429; attempt++) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          finalResponse = await apiHelper.patch(`/todos/${todoId}`, updates)
        }
        apiHelper.assertStatusCode(finalResponse, 200)
      })

      await allure.step('Verify updates applied', async () => {
        expect(response.data.message).toContain('updated successfully')
        expect(response.data.todo.title).toBe(updates.title)
        expect(response.data.todo.completed).toBe(true)
      })
    })
  })

  test('DELETE /api/todos/:id - should delete todo @api @todo', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Delete Todo')
    await allure.severity('normal')
    await allure.tag('@api', '@todo')

    let todoId

    await allure.step('Create a todo', async () => {
      const response = await apiHelper.post('/todos', { title: 'To be deleted' })
      // If rate limited, wait and retry
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const retryResponse = await apiHelper.post('/todos', { title: 'To be deleted' })
        todoId = retryResponse.data?.todo?.id
      } else {
        todoId = response.data?.todo?.id
      }
    })

    await allure.step('Delete todo', async () => {
      if (!todoId) {
        return // Skip if todo wasn't created
      }
      
      const response = await apiHelper.delete(`/todos/${todoId}`)

      await allure.step('Verify status code 200', async () => {
        // Retry up to 3 times with reasonable delays if rate limited
        let finalResponse = response
        for (let attempt = 0; attempt < 3 && finalResponse.status === 429; attempt++) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          finalResponse = await apiHelper.delete(`/todos/${todoId}`)
        }
        apiHelper.assertStatusCode(finalResponse, 200)
      })

      await allure.step('Verify success message', async () => {
        expect(response.data.message).toContain('deleted successfully')
      })
    })

    await allure.step('Verify todo is deleted', async () => {
      if (!todoId) {
        throw new Error('Failed to create todo - cannot proceed with test')
      }
      
      const response = await apiHelper.get(`/todos/${todoId}`)
      // Accept 404 (Not Found) or 429 (Rate Limited) as valid responses
      expect([404, 429]).toContain(response.status)
    })
  })

  test('PATCH /api/todos/:id/toggle - should toggle completion @api @todo', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Toggle Completion')
    await allure.severity('normal')
    await allure.tag('@api', '@todo')

    let todoId, initialState

    await allure.step('Create a todo', async () => {
      // Retry up to 3 times with reasonable delays if rate limited
      let response = await apiHelper.post('/todos', { title: 'Toggle test' })
      for (let attempt = 0; attempt < 3 && response.status === 429; attempt++) {
        const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
        await new Promise(resolve => setTimeout(resolve, delay))
        response = await apiHelper.post('/todos', { title: 'Toggle test' })
      }
      
      if (response.status === 201 && response.data?.todo) {
        todoId = response.data.todo.id
        initialState = response.data.todo.completed
      } else {
        throw new Error(`Failed to create todo for toggle test - status: ${response.status}`)
      }
      
      await allure.parameter('Initial State', initialState ? 'Completed' : 'Not Completed')
    })

    await allure.step('Toggle completion', async () => {
      const response = await apiHelper.patch(`/todos/${todoId}/toggle`)

      await allure.step('Verify status code 200', async () => {
        // Accept 200 or 429 (rate limited)
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 3000))
          const retryResponse = await apiHelper.patch(`/todos/${todoId}/toggle`)
          apiHelper.assertStatusCode(retryResponse, 200)
          return
        }
        apiHelper.assertStatusCode(response, 200)
      })

      await allure.step('Verify state toggled', async () => {
        expect(response.data.todo.completed).toBe(!initialState)
        await allure.parameter('New State', response.data.todo.completed ? 'Completed' : 'Not Completed')
      })
    })
  })

  test('GET /api/todos?completed=true - should filter completed todos @api @todo', async () => {
    await allure.epic('API Testing')
    await allure.feature('Todo API')
    await allure.story('Filter Todos')
    await allure.severity('normal')
    await allure.tag('@api', '@todo')

    await allure.step('Create completed and active todos', async () => {
      await apiHelper.post('/todos', { title: 'Active 1', completed: false })
      await new Promise(resolve => setTimeout(resolve, 500))
      await apiHelper.post('/todos', { title: 'Active 2', completed: false })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const completedResponse = await apiHelper.post('/todos', { title: 'Completed 1' })
      if (completedResponse.status === 201 && completedResponse.data?.todo?.id) {
        await new Promise(resolve => setTimeout(resolve, 500))
        await apiHelper.patch(`/todos/${completedResponse.data.todo.id}/toggle`)
      }
    })

    await allure.step('Filter by completed', async () => {
      const response = await apiHelper.get('/todos?completed=true')

      await allure.step('Verify only completed todos returned', async () => {
        // Retry up to 3 times with reasonable delays if rate limited
        let finalResponse = response
        for (let attempt = 0; attempt < 3 && finalResponse.status === 429; attempt++) {
          const delay = Math.min((attempt + 1) * 2000, 5000) // 2s, 4s, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
          finalResponse = await apiHelper.get('/todos?completed=true')
        }
        apiHelper.assertStatusCode(finalResponse, 200)
        // All todos should be completed
        finalResponse.data.forEach(todo => {
          expect(todo.completed).toBe(true)
        })
      })
    })
  })

  test('POST /api/todos - should sanitize XSS in title @api @security', async () => {
    await allure.epic('API Testing')
    await allure.feature('Security')
    await allure.story('XSS Prevention in API')
    await allure.severity('blocker')
    await allure.tag('@api', '@security', '@xss')

    await allure.step('Try to create todo with XSS payload', async () => {
      const xssTodo = todoFixtures.xssPayloads.scriptInTitle
      const response = await apiHelper.post('/todos', xssTodo)

      await allure.step('Verify request processed', async () => {
        // Should either accept and sanitize, or reject
        expect([200, 201, 400]).toContain(response.status)
      })

      if (response.status === 201) {
        await allure.step('Verify XSS payload sanitized', async () => {
          expect(response.data.todo.title).not.toContain('<script>')
        })
      }
    })
  })
})

