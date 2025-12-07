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
    // Wait for response (either success or error)
    await Promise.race([
      this.page.waitForSelector(this.successAlert, { timeout: 10000 }).catch(() => {}),
      this.page.waitForSelector(this.errorAlert, { timeout: 10000 }).catch(() => {}),
      this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    ])
  }

  async getResetToken() {
    // Wait for success message first, then for reset token code
    await this.waitForElement(this.successAlert, 15000)
    // Wait a bit more for token to render
    await this.page.waitForTimeout(500)
    await this.waitForElement(this.resetTokenCode, 10000)
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

