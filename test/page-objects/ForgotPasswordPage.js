/**
 * Forgot Password Page Object
 */
const BasePage = require('./BasePage')

class ForgotPasswordPage extends BasePage {
  constructor(page) {
    super(page)
    
    this.emailInput = '#email'
    this.submitButton = 'button[type="submit"]'
    this.backToLoginLink = 'a[href*="login"]'
    this.successAlert = '.alert-success'
    this.errorAlert = '.alert-danger'
    this.resetTokenCode = 'code'
    this.goToResetPasswordButton = 'a:has-text("Go to Reset Password")'
  }

  async goto() {
    await this.navigate('/forgot-password')
    await this.waitForElement(this.emailInput)
  }

  async fillEmail(email) {
    await this.fill(this.emailInput, email)
  }

  async submit() {
    await this.click(this.submitButton)
  }

  async requestPasswordReset(email) {
    await this.fillEmail(email)
    await this.submit()
    // Wait for network request to complete
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    // Wait for Vue reactivity to update the UI
    await this.page.waitForTimeout(2000)
  }

  async getResetToken() {
    // Wait for success message first - check if it exists
    const hasSuccess = await this.page.locator(this.successAlert).isVisible({ timeout: 15000 }).catch(() => false)
    if (!hasSuccess) {
      // Check for error message instead
      const hasError = await this.page.locator(this.errorAlert).isVisible({ timeout: 5000 }).catch(() => false)
      if (hasError) {
        return null // Rate limited or error
      }
      // Wait a bit more
      await this.page.waitForTimeout(1000)
      const hasSuccess2 = await this.page.locator(this.successAlert).isVisible({ timeout: 5000 }).catch(() => false)
      if (!hasSuccess2) {
        return null
      }
    }
    
    // Wait a bit more for token to render in the code element
    await this.page.waitForTimeout(1000)
    const tokenElement = this.page.locator(this.resetTokenCode)
    const tokenVisible = await tokenElement.isVisible({ timeout: 10000 }).catch(() => false)
    if (!tokenVisible) {
      return null
    }
    const token = await this.getText(this.resetTokenCode)
    // Clean up token text (remove whitespace)
    return token ? token.trim() : null
  }

  async clickBackToLogin() {
    await this.click(this.backToLoginLink)
  }

  async assertSuccessMessageVisible() {
    await this.assertVisible(this.successAlert)
  }

  async assertErrorMessageVisible() {
    await this.assertVisible(this.errorAlert)
  }
}

module.exports = ForgotPasswordPage

