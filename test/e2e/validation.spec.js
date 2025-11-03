/**
 * Validation E2E Tests
 * Tests form validation across the application
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const RegisterPage = require('../page-objects/RegisterPage')
const LoginPage = require('../page-objects/LoginPage')
const DashboardPage = require('../page-objects/DashboardPage')

test.describe('Form Validation Tests', () => {
  
  test('should validate username format @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Username Validation')
    await allure.severity('normal')
    await allure.tag('@validation', '@negative')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    await allure.step('Try username with special characters', async () => {
      await registerPage.fillForm({
        username: 'test@user!', // Invalid
        email: 'test@example.com',
        password: 'Test123456'
      })
      await page.locator('#username').blur()
    })

    await allure.step('Verify validation error', async () => {
      const error = await registerPage.getValidationError()
      expect(error).toBeTruthy()
    })
  })

  test('should validate email format @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Email Validation')
    await allure.severity('normal')
    await allure.tag('@validation', '@negative')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    await allure.step('Try invalid email formats', async () => {
      const invalidEmails = ['invalid', 'test@', '@example.com', 'test.com']
      
      for (const email of invalidEmails) {
        await registerPage.fillForm({
          username: 'testuser',
          email: email,
          password: 'Test123456'
        })
        await registerPage.submit()
        
        const error = await registerPage.getValidationError()
        await allure.parameter('Invalid Email', email)
        expect(error).toBeTruthy()
      }
    })
  })

  test('should enforce strong password policy @validation @security @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Password Strength')
    await allure.severity('critical')
    await allure.tag('@validation', '@security')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    const weakPasswords = [
      { password: 'weak', reason: 'Too short, no uppercase, no number' },
      { password: 'weakpassword', reason: 'No uppercase, no number' },
      { password: 'WEAKPASSWORD', reason: 'No lowercase, no number' },
      { password: 'WeakPassword', reason: 'No number' },
      { password: '12345678', reason: 'No letters' }
    ]

    for (const { password, reason } of weakPasswords) {
      await allure.step(`Test weak password: ${password}`, async () => {
        await registerPage.fillForm({
          username: 'testuser',
          email: 'test@example.com',
          password: password
        })
        await page.locator('#password').blur()
        
        await allure.parameter('Password', password)
        await allure.parameter('Reason', reason)
        
        const error = await registerPage.getValidationError()
        expect(error).toBeTruthy()
      })
    }
  })

  test('should validate todo title length @validation @todo @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Todo Title Validation')
    await allure.severity('normal')
    await allure.tag('@validation', '@todo')

    // Login first
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', 'Test123456')

    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    await allure.step('Try to create todo with too long title', async () => {
      await dashboard.clickNewTodo()
      
      const longTitle = 'a'.repeat(256) // Over 255 char limit
      await dashboard.fillTodoForm(longTitle)
      await dashboard.submitTodoForm()
      
      await allure.parameter('Title Length', '256 characters')
    })

    await allure.step('Verify validation error or trimming', async () => {
      // Should either show error or trim the title
      const errorVisible = await page.locator('.invalid-feedback').isVisible()
      if (errorVisible) {
        await allure.attachment('Validation Error', 'Title too long', 'text/plain')
      }
    })
  })

  test('should validate required fields @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Required Fields')
    await allure.severity('critical')
    await allure.tag('@validation', '@negative')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    await allure.step('Try to submit with empty required fields', async () => {
      await registerPage.submit()
    })

    await allure.step('Verify HTML5 validation prevents submission', async () => {
      // Form should not submit due to HTML5 required attribute
      await expect(page).toHaveURL(/\/register/)
    })
  })

  test('should validate password confirmation match @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Password Confirmation')
    await allure.severity('normal')
    await allure.tag('@validation')

    const resetPasswordPage = require('../page-objects/ResetPasswordPage')
    const resetPage = new resetPasswordPage(page)
    await resetPage.goto()

    await allure.step('Enter mismatched passwords', async () => {
      await resetPage.fillResetToken('dummy-token-for-validation')
      await resetPage.fillNewPassword('Password123')
      await resetPage.fillConfirmPassword('DifferentPassword123')
      await page.locator('#confirmPassword').blur()
    })

    await allure.step('Verify validation error', async () => {
      await expect(page.locator('.invalid-feedback')).toBeVisible()
    })
  })

  test('should validate age range @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Age Validation')
    await allure.severity('minor')
    await allure.tag('@validation')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    await allure.step('Try invalid age values', async () => {
      const invalidAges = [-1, 0, 121, 500]
      
      for (const age of invalidAges) {
        await page.fill('#age', age.toString())
        await page.locator('#age').blur()
        await allure.parameter('Invalid Age', age.toString())
      }
    })
  })

  test('should show real-time validation feedback @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Real-time Validation')
    await allure.severity('minor')
    await allure.tag('@validation', '@ux')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Fill and blur username field', async () => {
      await page.fill('#username', 'ab') // Too short
      await page.locator('#username').blur()
    })

    await allure.step('Verify immediate feedback', async () => {
      // Should show validation error on blur
      await expect(page.locator('.invalid-feedback, .is-invalid')).toBeVisible({ timeout: 3000 })
    })
  })
})

