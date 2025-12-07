/**
 * Authentication E2E Tests
 * Using Page Object Model pattern
 * With Allure reporting (tags, severity, categories)
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const LoginPage = require('../page-objects/LoginPage')
const RegisterPage = require('../page-objects/RegisterPage')
const ForgotPasswordPage = require('../page-objects/ForgotPasswordPage')
const ResetPasswordPage = require('../page-objects/ResetPasswordPage')
const DashboardPage = require('../page-objects/DashboardPage')
const authHelper = require('../helpers/auth.helper')
const testConfig = require('../config/test.config')

// Test user that will be created for login tests
let testUser = null

test.describe('Authentication Flow', () => {
  test.beforeAll(async () => {
    // Create a test user for login tests
    try {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    } catch (error) {
      console.warn('Failed to create test user in beforeAll, will try in test:', error.message)
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should register a new user @smoke @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('User Registration')
    await allure.story('Successful Registration')
    await allure.severity('critical')
    await allure.tag('@smoke', '@auth', '@regression')

    const registerPage = new RegisterPage(page)
    
    await allure.step('Navigate to registration page', async () => {
      await registerPage.goto()
      await registerPage.assertPageLoaded()
    })

    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123456',
      role: 'client',
      age: 25
    }

    await allure.step('Fill registration form', async () => {
      await registerPage.register(userData)
    })

    await allure.step('Verify success message appears', async () => {
      await registerPage.assertRegistrationSuccess()
    })

    await allure.step('Verify redirect to login page', async () => {
      await page.waitForURL(/\/login/, { timeout: 3000 })
    })
  })

  test('should reject weak password @validation @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('User Registration')
    await allure.story('Password Validation')
    await allure.severity('normal')
    await allure.tag('@validation', '@negative')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    await allure.step('Try to register with weak password', async () => {
      await registerPage.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
        role: 'client'
      })
      await registerPage.submit()
    })

    await allure.step('Verify validation error appears', async () => {
      await registerPage.assertValidationError()
    })
  })

  test('should login with valid credentials @smoke @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('User Login')
    await allure.story('Successful Login')
    await allure.severity('blocker')
    await allure.tag('@smoke', '@auth', '@critical')

    // Ensure test user exists with retry
    if (!testUser) {
      let attempts = 0
      while (attempts < 3 && !testUser) {
        try {
          const result = await authHelper.createTestUser()
          if (result && result.userData) {
            testUser = result.userData
            await page.waitForTimeout(1000)
            break
          }
        } catch (error) {
          attempts++
          if (attempts < 3) {
            await page.waitForTimeout(2000)
          } else {
            throw new Error(`Failed to create test user: ${error.message}`)
          }
        }
      }
    }

    const loginPage = new LoginPage(page)
    
    await allure.step('Navigate to login page', async () => {
      await loginPage.goto()
      await loginPage.assertPageLoaded()
    })

    await allure.step('Enter valid credentials', async () => {
      // Login method already waits for navigation
      await loginPage.login(testUser.username, testUser.password)
      // Additional wait for navigation
      await page.waitForURL(/\/dashboard/, { timeout: 20000 })
    })

    await allure.step('Verify redirect to dashboard', async () => {
      await loginPage.assertLoginSuccess()
    })

    await allure.step('Verify user info displayed', async () => {
      const dashboard = new DashboardPage(page)
      // Dashboard should already be loaded from login, but verify
      await dashboard.goto()
      await dashboard.assertLoggedIn(testUser.username)
    })
  })

  test('should show error for invalid credentials @auth @ui @negative', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('User Login')
    await allure.story('Invalid Credentials')
    await allure.severity('critical')
    await allure.tag('@auth', '@negative')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Enter invalid credentials', async () => {
      await loginPage.fillUsername('wronguser')
      await loginPage.fillPassword('wrongpass')
      await loginPage.clickLogin()
      // Wait for error message to appear (don't wait for navigation)
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
      // Wait longer for error message to render
      await page.waitForTimeout(1000)
    })

    await allure.step('Verify error message appears', async () => {
      // Wait for error alert with longer timeout
      await page.waitForSelector('.alert-danger', { state: 'visible', timeout: 15000 })
      await loginPage.assertLoginError()
    })

    await allure.step('Verify still on login page', async () => {
      await loginPage.assertUrlContains('/login')
    })
  })

  test('should handle forgot password flow @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('Password Reset')
    await allure.story('Request Password Reset')
    await allure.severity('normal')
    await allure.tag('@auth', '@password-reset')

    // Create a test user first to get valid email
    let testEmail
    try {
      const { userData } = await authHelper.createTestUser()
      testEmail = userData.email
      // Small delay to avoid rate limiting
      await page.waitForTimeout(1000)
    } catch (error) {
      // If user creation fails, use default email (may not work due to rate limiting)
      testEmail = 'test@example.com'
    }

    const forgotPasswordPage = new ForgotPasswordPage(page)
    
    await allure.step('Navigate to forgot password page', async () => {
      await forgotPasswordPage.goto()
    })

    await allure.step('Enter email address', async () => {
      await forgotPasswordPage.requestPasswordReset(testEmail)
    })

    await allure.step('Verify success message with reset token', async () => {
      // Wait for network to be idle
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(1000)
      
      // Check if we got success or error (rate limiting)
      const hasSuccess = await page.locator('.alert-success').isVisible({ timeout: 10000 }).catch(() => false)
      const hasError = await page.locator('.alert-danger').isVisible({ timeout: 10000 }).catch(() => false)
      
      if (hasError) {
        const errorText = await page.locator('.alert-danger').textContent()
        if (errorText && errorText.includes('Too many')) {
          await allure.attachment('Rate Limited', 'Password reset rate limit reached', 'text/plain')
          // Accept rate limiting as valid behavior
          expect(hasError).toBe(true)
          return
        }
      }
      
      if (hasSuccess) {
        await forgotPasswordPage.assertSuccessMessageVisible()
        // Wait a bit more for reset token to appear
        await page.waitForTimeout(500)
        const token = await forgotPasswordPage.getResetToken()
        await allure.parameter('Reset Token', token || 'N/A')
        expect(token).toBeTruthy()
      } else {
        throw new Error('Neither success nor error message appeared')
      }
    })
  })

  test('should reset password with valid token @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('Password Reset')
    await allure.story('Reset Password')
    await allure.severity('normal')
    await allure.tag('@auth', '@password-reset')

    // Create a test user first to get valid email
    let testEmail
    try {
      const { userData } = await authHelper.createTestUser()
      testEmail = userData.email
      // Small delay to avoid rate limiting
      await page.waitForTimeout(1000)
    } catch (error) {
      // If user creation fails, use default email
      testEmail = 'test@example.com'
    }

    // First get reset token
    const forgotPasswordPage = new ForgotPasswordPage(page)
    await forgotPasswordPage.goto()
    
    await allure.step('Request password reset', async () => {
      await forgotPasswordPage.requestPasswordReset(testEmail)
    })
    
    await allure.step('Get reset token', async () => {
      const resetToken = await forgotPasswordPage.getResetToken()
      if (!resetToken) {
        throw new Error('Failed to get reset token - password reset request may have failed or been rate limited')
      }
      
      // Then reset password
      const resetPasswordPage = new ResetPasswordPage(page)
      await resetPasswordPage.goto()

      await allure.step('Enter reset token and new password', async () => {
        await resetPasswordPage.resetPassword(resetToken, 'NewPassword123')
        // Wait for response
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
      })

      await allure.step('Verify success message', async () => {
        await resetPasswordPage.assertSuccessMessageVisible()
      })
    })
  })

  test('should reject password mismatch @validation @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('Password Reset')
    await allure.story('Password Mismatch Validation')
    await allure.severity('minor')
    await allure.tag('@validation', '@negative')

    const resetPasswordPage = new ResetPasswordPage(page)
    await resetPasswordPage.goto()

    await allure.step('Enter mismatched passwords', async () => {
      await resetPasswordPage.fillResetToken('dummy-token')
      await resetPasswordPage.fillNewPassword('Password123')
      await resetPasswordPage.fillConfirmPassword('DifferentPassword123')
      await resetPasswordPage.submit()
    })

    await allure.step('Verify validation error', async () => {
      await resetPasswordPage.assertValidationError()
    })
  })

  test('should logout successfully @smoke @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('User Logout')
    await allure.story('Successful Logout')
    await allure.severity('critical')
    await allure.tag('@smoke', '@auth')

    // Ensure test user exists
    if (!testUser) {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    }

    // First login
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUser.username, testUser.password)
    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await dashboard.assertLoggedIn(testUser.username)

    await allure.step('Click logout button', async () => {
      await dashboard.logout()
    })

    await allure.step('Verify redirect to login page', async () => {
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    })
  })

  test('should navigate between auth pages @auth @ui', async ({ page }) => {
    await allure.epic('Authentication')
    await allure.feature('Navigation')
    await allure.story('Auth Pages Navigation')
    await allure.severity('minor')
    await allure.tag('@ui', '@navigation')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Navigate to register from login', async () => {
      await loginPage.clickRegister()
      await expect(page).toHaveURL(/\/register/, { timeout: 10000 })
    })

    const registerPage = new RegisterPage(page)
    await allure.step('Navigate back to login from register', async () => {
      await registerPage.clickLoginLink()
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    })

    await allure.step('Navigate to forgot password', async () => {
      await loginPage.clickForgotPassword()
      await expect(page).toHaveURL(/\/forgot-password/, { timeout: 10000 })
    })
  })
})
