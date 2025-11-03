/**
 * Reset Password Page Object
 */
const BasePage = require('./BasePage')

class ResetPasswordPage extends BasePage {
  constructor(page) {
    super(page)
    
    this.resetTokenInput = '#resetToken'
    this.newPasswordInput = '#newPassword'
    this.confirmPasswordInput = '#confirmPassword'
    this.submitButton = 'button[type="submit"]'
    this.backToLoginLink = 'a[href*="login"]'
    this.goToLoginButton = 'a:has-text("Go to Login")'
    this.successAlert = '.alert-success'
    this.errorAlert = '.alert-danger'
    this.validationError = '.invalid-feedback'
  }

  async goto() {
    await this.navigate('/reset-password')
    await this.waitForElement(this.resetTokenInput)
  }

  async fillResetToken(token) {
    await this.fill(this.resetTokenInput, token)
  }

  async fillNewPassword(password) {
    await this.fill(this.newPasswordInput, password)
  }

  async fillConfirmPassword(password) {
    await this.fill(this.confirmPasswordInput, password)
  }

  async submit() {
    await this.click(this.submitButton)
  }

  async resetPassword(token, newPassword, confirmPassword) {
    await this.fillResetToken(token)
    await this.fillNewPassword(newPassword)
    await this.fillConfirmPassword(confirmPassword || newPassword)
    await this.submit()
  }

  async assertSuccessMessageVisible() {
    await this.assertVisible(this.successAlert)
  }

  async assertErrorMessageVisible() {
    await this.assertVisible(this.errorAlert)
  }

  async assertValidationError() {
    await this.assertVisible(this.validationError)
  }

  async clickGoToLogin() {
    await this.click(this.goToLoginButton)
  }
}

module.exports = ResetPasswordPage

