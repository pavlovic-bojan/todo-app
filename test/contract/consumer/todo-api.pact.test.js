/**
 * Contract Tests - Consumer Side
 * Tests the contract between Frontend (consumer) and Backend (provider)
 */
const { Pact } = require('@pact-foundation/pact')
const { expect } = require('chai')
const axios = require('axios')
const path = require('path')

describe('Todo API Contract Tests - Consumer', () => {
  let provider

  before(async () => {
    provider = new Pact({
      consumer: 'TodoFrontend',
      provider: 'TodoBackend',
      port: 8989,
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: 'INFO'
    })

    await provider.setup()
  })

  after(async () => {
    await provider.finalize()
  })

  describe('User Registration Contract', () => {
    it('should register a new user', async () => {
      const expectedUser = {
        username: 'testuser',
        email: 'test@example.com',
        role: 'client'
      }

      await provider.addInteraction({
        state: 'no user exists with username testuser',
        uponReceiving: 'a request to register a new user',
        withRequest: {
          method: 'POST',
          path: '/api/users/register',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123456',
            role: 'client'
          }
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            message: 'User registered successfully',
            user: {
              id: 1,
              username: expectedUser.username,
              email: expectedUser.email,
              role: expectedUser.role,
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      })

      const response = await axios.post(
        `http://localhost:${provider.opts.port}/api/users/register`,
        {
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123456',
          role: 'client'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

      expect(response.status).to.equal(201)
      expect(response.data.user.username).to.equal(expectedUser.username)
      expect(response.data.user.email).to.equal(expectedUser.email)

      await provider.verify()
    })
  })

  describe('User Login Contract', () => {
    it('should login with valid credentials', async () => {
      await provider.addInteraction({
        state: 'user with username testuser exists',
        uponReceiving: 'a login request with valid credentials',
        withRequest: {
          method: 'POST',
          path: '/api/users/login',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            username: 'testuser',
            password: 'Test123456'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            message: 'Login successful',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com',
              role: 'client'
            }
          }
        }
      })

      const response = await axios.post(
        `http://localhost:${provider.opts.port}/api/users/login`,
        {
          username: 'testuser',
          password: 'Test123456'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

      expect(response.status).to.equal(200)
      expect(response.data.accessToken).to.be.a('string')
      expect(response.data.user.username).to.equal('testuser')

      await provider.verify()
    })
  })

  describe('Todo CRUD Contract', () => {
    const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

    it('should create a todo', async () => {
      await provider.addInteraction({
        state: 'user is authenticated',
        uponReceiving: 'a request to create a todo',
        withRequest: {
          method: 'POST',
          path: '/api/todos',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: {
            title: 'Test Todo',
            description: 'Test description'
          }
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            message: 'Todo created successfully',
            todo: {
              id: 1,
              title: 'Test Todo',
              description: 'Test description',
              completed: false,
              userId: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      })

      const response = await axios.post(
        `http://localhost:${provider.opts.port}/api/todos`,
        {
          title: 'Test Todo',
          description: 'Test description'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          }
        }
      )

      expect(response.status).to.equal(201)
      expect(response.data.todo.title).to.equal('Test Todo')
      expect(response.data.todo.completed).to.equal(false)

      await provider.verify()
    })

    it('should get all todos', async () => {
      await provider.addInteraction({
        state: 'user has todos',
        uponReceiving: 'a request to get all todos',
        withRequest: {
          method: 'GET',
          path: '/api/todos',
          headers: {
            'Authorization': authToken
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: [
            {
              id: 1,
              title: 'Test Todo',
              description: 'Test description',
              completed: false,
              userId: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ]
        }
      })

      const response = await axios.get(
        `http://localhost:${provider.opts.port}/api/todos`,
        {
          headers: {
            'Authorization': authToken
          }
        }
      )

      expect(response.status).to.equal(200)
      expect(response.data).to.be.an('array')
      expect(response.data[0].title).to.equal('Test Todo')

      await provider.verify()
    })

    it('should update a todo', async () => {
      await provider.addInteraction({
        state: 'todo with id 1 exists',
        uponReceiving: 'a request to update a todo',
        withRequest: {
          method: 'PATCH',
          path: '/api/todos/1',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: {
            title: 'Updated Todo',
            completed: true
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            message: 'Todo updated successfully',
            todo: {
              id: 1,
              title: 'Updated Todo',
              description: 'Test description',
              completed: true,
              userId: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T01:00:00.000Z'
            }
          }
        }
      })

      const response = await axios.patch(
        `http://localhost:${provider.opts.port}/api/todos/1`,
        {
          title: 'Updated Todo',
          completed: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          }
        }
      )

      expect(response.status).to.equal(200)
      expect(response.data.todo.title).to.equal('Updated Todo')
      expect(response.data.todo.completed).to.equal(true)

      await provider.verify()
    })

    it('should delete a todo', async () => {
      await provider.addInteraction({
        state: 'todo with id 1 exists',
        uponReceiving: 'a request to delete a todo',
        withRequest: {
          method: 'DELETE',
          path: '/api/todos/1',
          headers: {
            'Authorization': authToken
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            message: 'Todo deleted successfully'
          }
        }
      })

      const response = await axios.delete(
        `http://localhost:${provider.opts.port}/api/todos/1`,
        {
          headers: {
            'Authorization': authToken
          }
        }
      )

      expect(response.status).to.equal(200)
      expect(response.data.message).to.contain('deleted successfully')

      await provider.verify()
    })
  })
})

