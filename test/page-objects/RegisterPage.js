/**
 * Register Page Object
 * Handles all interactions with the registration page
 */
const BasePage = require('./BasePage')

class RegisterPage extends BasePage {
  constructor(page) {
    super(page)
    
    // Locators
    this.usernameInput = '#username'
    this.emailInput = '#email'
    this.passwordInput = '#password'
    this.ageInput = '#age'
    this.roleSelect = '#role'
    this.submitButton = 'button[type="submit"]'
    this.loginLink = 'a[href*="login"]'
    this.successAlert = '.alert-success'
    this.errorAlert = '.alert-danger'
    this.validationError = '.invalid-feedback'
  }

  /**
   * Navigate to register page
   */
  async goto() {
    await this.navigate('/register')
    await this.waitForElement(this.usernameInput)
  }

  /**
   * Fill registration form
   */
  async fillForm({ username, email, password, role = 'client', age }) {
    await this.fill(this.usernameInput, username)
    await this.fill(this.emailInput, email)
    await this.fill(this.passwordInput, password)
    
    if (age) {
      await this.fill(this.ageInput, age.toString())
    }
    
    await this.selectOption(this.roleSelect, role)
  }

  /**
   * Submit registration form
   */
  async submit() {
    await this.click(this.submitButton)
  }

  /**
   * Complete registration flow
   */
  async register(userData) {
    await this.fillForm(userData)
    await this.submit()
  }

  /**
   * Click login link
   */
  async clickLoginLink() {
    await this.click(this.loginLink)
  }

  /**
   * Get success message
   */
  async getSuccessMessage() {
    if (await this.isVisible(this.successAlert)) {
      return await this.getText(this.successAlert)
    }
    return null
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
   * Get validation error
   */
  async getValidationError() {
    if (await this.isVisible(this.validationError)) {
      return await this.getText(this.validationError)
    }
    return null
  }

  /**
   * Assert successful registration
   */
  async assertRegistrationSuccess() {
    await this.assertVisible(this.successAlert)
  }

  /**
   * Assert registration error
   */
  async assertRegistrationError(message) {
    await this.assertVisible(this.errorAlert)
    if (message) {
      await this.assertText(this.errorAlert, message)
    }
  }

  /**
   * Assert validation error shown
   */
  async assertValidationError(message) {
    await this.assertVisible(this.validationError)
    if (message) {
      await this.assertText(this.validationError, message)
    }
  }
}

module.exports = RegisterPage

