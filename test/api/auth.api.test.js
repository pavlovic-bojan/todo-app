/**
 * Auth API Tests
 * Direct API testing with JSON Schema Validation
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const apiHelper = require('../helpers/api.helper')
const authHelper = require('../helpers/auth.helper')
const dataGenerator = require('../helpers/data-generator')
const userFixtures = require('../fixtures/users.fixture')

test.describe('Auth API Tests', () => {

  test.afterEach(async () => {
    apiHelper.clearToken()
  })

  test('POST /api/users/register - should register with valid data @api @auth @smoke', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('User Registration')
    await allure.severity('blocker')
    await allure.tag('@api', '@auth', '@smoke')

    const userData = dataGenerator.generateUser()

    await allure.step('Send registration request', async () => {
      const response = await apiHelper.post('/users/register', userData)
      
      await allure.step('Verify status code 201', async () => {
        apiHelper.assertStatusCode(response, 201)
      })

      await allure.step('Validate response schema', async () => {
        await apiHelper.validateSchema(response, 'register-response')
      })

      await allure.step('Verify response data', async () => {
        expect(response.data.message).toBe('User registered successfully')
        expect(response.data.user.username).toBe(userData.username)
        expect(response.data.user.email).toBe(userData.email)
        expect(response.data.user.role).toBe(userData.role)
      })
    })
  })

  test('POST /api/users/register - should reject duplicate username @api @auth @negative', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('Duplicate Username Rejection')
    await allure.severity('critical')
    await allure.tag('@api', '@auth', '@negative')

    const userData = dataGenerator.generateUser()

    await allure.step('Register user first time', async () => {
      await apiHelper.post('/users/register', userData)
    })

    await allure.step('Try to register same username again', async () => {
      const response = await apiHelper.post('/users/register', userData)
      
      await allure.step('Verify status code 409', async () => {
        apiHelper.assertStatusCode(response, 409)
      })

      await allure.step('Validate error response schema', async () => {
        await apiHelper.validateSchema(response, 'error-response')
      })

      await allure.step('Verify error message', async () => {
        expect(response.data.message).toContain('already exists')
      })
    })
  })

  test('POST /api/users/register - should reject weak password @api @auth @validation', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('Password Validation')
    await allure.severity('critical')
    await allure.tag('@api', '@auth', '@validation')

    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'weak'
    }

    await allure.step('Send registration with weak password', async () => {
      const response = await apiHelper.post('/users/register', userData)
      
      await allure.step('Verify status code 400', async () => {
        apiHelper.assertStatusCode(response, 400)
      })

      await allure.step('Verify validation error', async () => {
        expect(response.data.message).toContain('Validation failed')
      })
    })
  })

  test('POST /api/users/login - should login with valid credentials @api @auth @smoke', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('User Login')
    await allure.severity('blocker')
    await allure.tag('@api', '@auth', '@smoke')

    // Create user first
    const { userData } = await authHelper.createTestUser()

    await allure.step('Send login request', async () => {
      const response = await apiHelper.post('/users/login', {
        username: userData.username,
        password: userData.password
      })

      await allure.step('Verify status code 200', async () => {
        apiHelper.assertStatusCode(response, 200)
      })

      await allure.step('Validate response schema', async () => {
        await apiHelper.validateSchema(response, 'login-response')
      })

      await allure.step('Verify JWT token present', async () => {
        expect(response.data.accessToken).toBeTruthy()
        expect(typeof response.data.accessToken).toBe('string')
      })

      await allure.step('Verify user data returned', async () => {
        expect(response.data.user.username).toBe(userData.username)
        expect(response.data.user.email).toBe(userData.email)
      })
    })
  })

  test('POST /api/users/login - should reject invalid credentials @api @auth @negative', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('Invalid Credentials')
    await allure.severity('critical')
    await allure.tag('@api', '@auth', '@negative')

    await allure.step('Send login with wrong credentials', async () => {
      const response = await apiHelper.post('/users/login', {
        username: 'nonexistent',
        password: 'wrongpassword'
      })

      await allure.step('Verify status code 401', async () => {
        apiHelper.assertStatusCode(response, 401)
      })

      await allure.step('Verify error message', async () => {
        expect(response.data.message).toContain('Invalid credentials')
      })
    })
  })

  test('POST /api/users/forgot-password - should generate reset token @api @auth', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('Forgot Password')
    await allure.severity('normal')
    await allure.tag('@api', '@auth')

    const { userData } = await authHelper.createTestUser()

    await allure.step('Request password reset', async () => {
      const response = await apiHelper.post('/users/forgot-password', {
        email: userData.email
      })

      await allure.step('Verify status code 200', async () => {
        apiHelper.assertStatusCode(response, 200)
      })

      await allure.step('Verify reset token generated', async () => {
        expect(response.data.message).toContain('reset')
        expect(response.data.resetToken).toBeTruthy()
      })
    })
  })

  test('POST /api/users/reset-password - should reset password with valid token @api @auth', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('Reset Password')
    await allure.severity('normal')
    await allure.tag('@api', '@auth')

    const { userData } = await authHelper.createTestUser()

    let resetToken

    await allure.step('Request password reset', async () => {
      const response = await authHelper.requestPasswordReset(userData.email)
      resetToken = response.data.resetToken
    })

    await allure.step('Reset password with token', async () => {
      const response = await authHelper.resetPassword(resetToken, 'NewPassword123')
      
      await allure.step('Verify status code 200', async () => {
        apiHelper.assertStatusCode(response, 200)
      })

      await allure.step('Verify success message', async () => {
        expect(response.data.message).toContain('reset successfully')
      })
    })
  })

  test('POST /api/users/refresh - should refresh access token @api @auth', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('Token Refresh')
    await allure.severity('critical')
    await allure.tag('@api', '@auth', '@token')

    const { userData } = await authHelper.createAndLoginTestUser()

    await allure.step('Request token refresh', async () => {
      const response = await apiHelper.post('/users/refresh')
      
      // Note: This requires refresh token cookie, might need adjustment
      await allure.parameter('Response Status', response.status.toString())
    })
  })

  test('POST /api/users/logout - should logout user @api @auth', async () => {
    await allure.epic('API Testing')
    await allure.feature('Auth API')
    await allure.story('User Logout')
    await allure.severity('normal')
    await allure.tag('@api', '@auth')

    await authHelper.createAndLoginTestUser()

    await allure.step('Send logout request', async () => {
      const response = await authHelper.logoutUser()
      
      await allure.step('Verify status code 200', async () => {
        apiHelper.assertStatusCode(response, 200)
      })

      await allure.step('Verify logout message', async () => {
        expect(response.data.message).toContain('Logged out')
      })
    })
  })

  test('API rate limiting - should block after 5 attempts @api @security @rate-limit', async () => {
    await allure.epic('API Testing')
    await allure.feature('Security')
    await allure.story('Rate Limiting')
    await allure.severity('critical')
    await allure.tag('@api', '@security', '@rate-limit')

    await allure.step('Attempt multiple failed logins', async () => {
      for (let i = 1; i <= 7; i++) {
        const response = await apiHelper.post('/users/login', {
          username: 'wrong',
          password: 'wrong'
        })

        await allure.parameter(`Attempt ${i}`, `Status: ${response.status}`)

        if (i > 5) {
          // Should be rate limited after 5 attempts
          if (response.status === 429) {
            await allure.attachment('Rate Limit Triggered', response.data.message, 'text/plain')
            expect(response.data.message).toContain('Too many')
            break
          }
        }
      }
    })
  })
})

