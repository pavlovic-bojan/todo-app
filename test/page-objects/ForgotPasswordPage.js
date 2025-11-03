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
  }

  async getResetToken() {
    await this.waitForElement(this.resetTokenCode)
    return await this.getText(this.resetTokenCode)
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

