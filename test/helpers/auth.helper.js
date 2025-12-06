/**
 * Auth Helper
 * Utilities for authentication in tests
 */
const apiHelper = require('./api.helper')
const { allure } = require('allure-playwright')

class AuthHelper {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const response = await apiHelper.post('/users/register', userData)
    
    await allure.parameter('Username', userData.username)
    await allure.parameter('Email', userData.email)
    await allure.parameter('Role', userData.role || 'client')
    
    return response
  }

  /**
   * Login user and get token
   */
  async loginUser(username, password) {
    const response = await apiHelper.post('/users/login', { username, password })
    
    if (response.status === 200 && response.data.accessToken) {
      apiHelper.setToken(response.data.accessToken)
      await allure.parameter('Access Token', response.data.accessToken.substring(0, 20) + '...')
    }
    
    return response
  }

  /**
   * Logout user
   */
  async logoutUser() {
    const response = await apiHelper.post('/users/logout')
    apiHelper.clearToken()
    return response
  }

  /**
   * Create test user with random credentials
   */
  async createTestUser(role = 'client') {
    const timestamp = Date.now()
    const userData = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'Test123456',
      role: role,
      age: 25
    }

    const response = await this.registerUser(userData)
    
    // If rate limited, wait and retry once
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const retryResponse = await this.registerUser(userData)
      if (retryResponse.status === 201) {
        await allure.attachment('Test User Created', JSON.stringify(userData, null, 2), 'application/json')
        return { userData, response: retryResponse }
      }
      // If retry also fails, return the response anyway
      return { userData, response: retryResponse }
    }
    
    if (response.status === 201) {
      await allure.attachment('Test User Created', JSON.stringify(userData, null, 2), 'application/json')
    }

    // Always return userData and response, even if status is not 201
    return { userData, response }
  }

  /**
   * Create and login test user
   */
  async createAndLoginTestUser(role = 'client') {
    let userData, registerResponse
    
    try {
      const result = await this.createTestUser(role)
      userData = result.userData
      registerResponse = result.response
    } catch (error) {
      throw new Error(`Failed to create test user: ${error.message}`)
    }
    
    // If rate limited, wait and retry once
    if (registerResponse.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      try {
        const retryResult = await this.createTestUser(role)
        if (retryResult.response.status === 201) {
          // Add small delay before login
          await new Promise(resolve => setTimeout(resolve, 500))
          const loginResponse = await this.loginUser(retryResult.userData.username, retryResult.userData.password)
          if (loginResponse.status === 200 && loginResponse.data?.accessToken) {
            return { userData: retryResult.userData, token: loginResponse.data.accessToken }
          }
          // If login fails, try one more time
          await new Promise(resolve => setTimeout(resolve, 1000))
          const retryLogin = await this.loginUser(retryResult.userData.username, retryResult.userData.password)
          if (retryLogin.status === 200 && retryLogin.data?.accessToken) {
            return { userData: retryResult.userData, token: retryLogin.data.accessToken }
          }
          throw new Error(`Login failed after user creation - status ${loginResponse.status}`)
        }
        // If retry also rate limited, throw error
        throw new Error(`User creation still rate limited after retry - status ${retryResult.response.status}`)
      } catch (error) {
        throw new Error(`Failed to create test user on retry: ${error.message}`)
      }
    }
    
    if (registerResponse.status === 201) {
      // Add small delay before login
      await new Promise(resolve => setTimeout(resolve, 500))
      try {
        const loginResponse = await this.loginUser(userData.username, userData.password)
        if (loginResponse.status === 200 && loginResponse.data?.accessToken) {
          return { userData, token: loginResponse.data.accessToken }
        }
        // If login rate limited, retry once
        if (loginResponse.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 3000))
          const retryLogin = await this.loginUser(userData.username, userData.password)
          if (retryLogin.status === 200 && retryLogin.data?.accessToken) {
            return { userData, token: retryLogin.data.accessToken }
          }
        }
        throw new Error(`Login failed with status ${loginResponse.status}`)
      } catch (error) {
        throw new Error(`Failed to login test user: ${error.message}`)
      }
    }
    
    // If status is not 201 or 429, throw error
    throw new Error(`Failed to create test user - received status ${registerResponse.status}`)
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const response = await apiHelper.post('/users/forgot-password', { email })
    return response
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken, newPassword) {
    const response = await apiHelper.post('/users/reset-password', {
      resetToken,
      newPassword
    })
    return response
  }

  /**
   * Get current user token
   */
  getToken() {
    return apiHelper.token
  }

  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return !!apiHelper.token
  }
}

module.exports = new AuthHelper()

