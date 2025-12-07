/**
 * Login Page Object
 * Handles all interactions with the login page
 */
const BasePage = require('./BasePage')
const { expect } = require('@playwright/test')

class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    
    // Locators
    this.usernameInput = '#username'
    this.passwordInput = '#password'
    this.loginButton = 'button[type="submit"]'
    this.forgotPasswordLink = 'a[href*="forgot-password"]'
    this.registerLink = 'a[href*="register"]'
    this.errorAlert = '.alert-danger'
    this.loadingSpinner = '.spinner-border'
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.navigate('/login')
    await this.waitForElement(this.usernameInput)
  }

  /**
   * Fill username
   */
  async fillUsername(username) {
    await this.fill(this.usernameInput, username)
  }

  /**
   * Fill password
   */
  async fillPassword(password) {
    await this.fill(this.passwordInput, password)
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.click(this.loginButton)
  }

  /**
   * Complete login flow
   */
  async login(username, password) {
    // Small delay to avoid rate limiting when multiple tests run quickly
    await this.page.waitForTimeout(500)
    await this.fillUsername(username)
    await this.fillPassword(password)
    await this.clickLogin()
    
    // Wait for network request to complete
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    
    // Check if we're still on login page (error) or navigated to dashboard (success)
    const currentUrl = this.page.url()
    const isOnLoginPage = currentUrl.includes('/login')
    const isOnDashboard = currentUrl.includes('/dashboard')
    
    if (isOnDashboard) {
      // Success - already navigated
      return
    }
    
    if (isOnLoginPage) {
      // Still on login page - check for error
      await this.page.waitForTimeout(1500) // Wait for error message to render
      const errorMsg = await this.getErrorMessage()
      
      if (errorMsg) {
        // If rate limited, wait and retry once
        if (errorMsg.includes('Too many') || errorMsg.includes('rate')) {
          await this.page.waitForTimeout(3000)
          await this.fillUsername(username)
          await this.fillPassword(password)
          await this.clickLogin()
          await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
          await this.page.waitForURL(/\/dashboard/, { timeout: 20000 })
        } else {
          throw new Error(`Login failed: ${errorMsg}`)
        }
      } else {
        // No error message but still on login - wait a bit more for navigation
        try {
          await this.page.waitForURL(/\/dashboard/, { timeout: 10000 })
        } catch (e) {
          throw new Error('Login failed: No navigation and no error message')
        }
      }
    } else {
      // Unknown state - wait for navigation
      await this.page.waitForURL(/\/dashboard/, { timeout: 20000 })
    }
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink)
  }

  /**
   * Click register link
   */
  async clickRegister() {
    await this.click(this.registerLink)
  }

  /**
   * Get error message
   */
  async getErrorMessage() {
    if (await this.isVisible(this.errorAlert)) {
      return await this.getText(this.errorAlert)
    }
    return null
  }

  /**
   * Check if loading
   */
  async isLoading() {
    return await this.isVisible(this.loadingSpinner)
  }

  /**
   * Assert successful login (redirected to dashboard)
   */
  async assertLoginSuccess() {
    // Wait for URL to contain dashboard with longer timeout
    await this.page.waitForURL(/\/dashboard/, { timeout: 20000 })
    await this.assertUrlContains('/dashboard')
  }

  /**
   * Assert login error displayed
   */
  async assertLoginError(errorMessage) {
    await this.assertVisible(this.errorAlert)
    if (errorMessage) {
      await this.assertText(this.errorAlert, errorMessage)
    }
  }

  /**
   * Assert page is loaded
   */
  async assertPageLoaded() {
    await this.assertVisible(this.usernameInput)
    await this.assertVisible(this.passwordInput)
    await this.assertVisible(this.loginButton)
  }
}

module.exports = LoginPage

