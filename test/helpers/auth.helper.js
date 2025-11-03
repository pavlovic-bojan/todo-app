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
    
    if (response.status === 201) {
      await allure.attachment('Test User Created', JSON.stringify(userData, null, 2), 'application/json')
    }

    return { userData, response }
  }

  /**
   * Create and login test user
   */
  async createAndLoginTestUser(role = 'client') {
    const { userData, response: registerResponse } = await this.createTestUser(role)
    
    if (registerResponse.status === 201) {
      const loginResponse = await this.loginUser(userData.username, userData.password)
      return { userData, token: loginResponse.data?.accessToken }
    }
    
    throw new Error('Failed to create test user')
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

