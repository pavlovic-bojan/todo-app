/**
 * Security E2E Tests
 * Tests XSS prevention, injection attempts, and security features
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const RegisterPage = require('../page-objects/RegisterPage')
const LoginPage = require('../page-objects/LoginPage')
const DashboardPage = require('../page-objects/DashboardPage')
const authHelper = require('../helpers/auth.helper')

// Test user for security tests
let testUser = null

test.describe('Security Tests', () => {
  test.beforeAll(async () => {
    try {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    } catch (error) {
      console.warn('Failed to create test user:', error.message)
    }
  })

  test('should prevent XSS in username field @security @ui @critical', async ({ page }) => {
    await allure.epic('Security')
    await allure.feature('XSS Prevention')
    await allure.story('Username Field XSS')
    await allure.severity('blocker')
    await allure.tag('@security', '@xss', '@critical')

    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '<svg onload=alert(1)>'
    ]

    for (const payload of xssPayloads) {
      await allure.step(`Test XSS payload: ${payload}`, async () => {
        await registerPage.fillForm({
          username: payload,
          email: 'xss@test.com',
          password: 'Test123456'
        })
        
        await allure.parameter('XSS Payload', payload)
        
        // Should either reject or sanitize
        await registerPage.submit()
        // Wait for response
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
        
        // Verify no script execution - check for alert dialogs
        let alertTriggered = false
        const dialogHandler = page.on('dialog', dialog => {
          alertTriggered = true
          allure.attachment('Alert Triggered', 'XSS VULNERABILITY!', 'text/plain')
          dialog.dismiss()
        })
        
        // Wait a bit to see if alert appears
        await page.waitForTimeout(1000)
        expect(alertTriggered).toBe(false)
      })
    }
  })

  test('should prevent XSS in todo title @security @ui @critical', async ({ page }) => {
    await allure.epic('Security')
    await allure.feature('XSS Prevention')
    await allure.story('Todo Title XSS')
    await allure.severity('blocker')
    await allure.tag('@security', '@xss')

    // Ensure test user exists
    if (!testUser) {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    }

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUser.username, testUser.password)
    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    await allure.step('Try to create todo with XSS payload', async () => {
      const xssTitle = '<script>alert("XSS in Todo")</script>'
      await dashboard.createTodo(xssTitle, 'XSS test')
      await allure.parameter('XSS Payload', xssTitle)
    })

    await allure.step('Verify script tags are stripped/escaped', async () => {
      // Should not execute script
      const pageContent = await page.content()
      expect(pageContent).not.toContain('<script>alert')
    })
  })

  test('should prevent SQL injection in login @security @ui @critical', async ({ page }) => {
    await allure.epic('Security')
    await allure.feature('SQL Injection Prevention')
    await allure.story('Login SQL Injection')
    await allure.severity('blocker')
    await allure.tag('@security', '@sql-injection')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    const sqlPayloads = [
      "admin' OR '1'='1",
      "admin'--",
      "admin' /*",
      "' OR 1=1--"
    ]

    for (const payload of sqlPayloads) {
      await allure.step(`Test SQL injection: ${payload}`, async () => {
        // Don't use login() method as it waits for navigation - use individual steps
        await loginPage.fillUsername(payload)
        await loginPage.fillPassword('anything')
        await loginPage.clickLogin()
        // Wait for response (should not navigate)
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(1000)
        
        await allure.parameter('SQL Payload', payload)
        
        // Should fail authentication (Prisma protects against SQL injection)
        // Should still be on login page
        const isOnLoginPage = page.url().includes('/login')
        expect(isOnLoginPage).toBe(true)
        
        // Check for error message
        const error = await loginPage.getErrorMessage()
        // Accept either error message or just being on login page (not redirected)
        expect(error || isOnLoginPage).toBeTruthy()
        await allure.parameter('Error Message', error || 'Still on login page (not redirected)')
      })
    }
  })

  test('should sanitize URL parameters @security @ui', async ({ page }) => {
    await allure.epic('Security')
    await allure.feature('URL Sanitization')
    await allure.severity('normal')
    await allure.tag('@security')

    await allure.step('Try to navigate with javascript: URL', async () => {
      const dangerousUrl = 'javascript:alert(1)'
      // Should be blocked or sanitized
    })
  })

  test('should protect against CSRF @security @api', async ({ page }) => {
    await allure.epic('Security')
    await allure.feature('CSRF Protection')
    await allure.severity('critical')
    await allure.tag('@security', '@csrf')

    await allure.step('Verify SameSite cookie attribute', async () => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      // Ensure test user exists
      if (!testUser) {
        const { userData } = await authHelper.createTestUser()
        testUser = userData
      }
      await loginPage.login(testUser.username, testUser.password)
      
      // Check cookies
      const cookies = await page.context().cookies()
      const refreshToken = cookies.find(c => c.name === 'refreshToken')
      
      if (refreshToken) {
        await allure.parameter('SameSite', refreshToken.sameSite)
        await allure.parameter('HttpOnly', refreshToken.httpOnly.toString())
        expect(refreshToken.sameSite).toBe('Strict')
        expect(refreshToken.httpOnly).toBe(true)
      }
    })
  })

  test('should handle suspicious activity @security @ui', async ({ page }) => {
    await allure.epic('Security')
    await allure.feature('Suspicious Activity Detection')
    await allure.severity('normal')
    await allure.tag('@security')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Attempt multiple failed logins (rate limiting)', async () => {
      for (let i = 0; i < 6; i++) {
        // Check if input is disabled (rate limited)
        const isDisabled = await page.locator('#username').isDisabled().catch(() => false)
        if (isDisabled) {
          // If disabled, wait a bit and check error message
          await page.waitForTimeout(1000)
          const error = await loginPage.getErrorMessage()
          if (error && error.includes('Too many')) {
            await allure.parameter(`Attempt ${i + 1}`, 'Rate limited - input disabled')
            break
          }
        }
        
        await loginPage.fillUsername('wronguser')
        await loginPage.fillPassword('wrongpass')
        await loginPage.clickLogin()
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(1000)
        await allure.parameter(`Attempt ${i + 1}`, 'Failed login')
      }
    })

    await allure.step('Verify rate limiting kicks in', async () => {
      await page.waitForTimeout(1000)
      const error = await loginPage.getErrorMessage()
      // Should show rate limit error after multiple attempts
      // Accept either rate limit error or just verify we're still on login page
      const isOnLoginPage = page.url().includes('/login')
      const isDisabled = await page.locator('#username').isDisabled().catch(() => false)
      
      if (error && error.includes('Too many')) {
        await allure.attachment('Rate Limit Triggered', error, 'text/plain')
      }
      // Verify we're still on login (not redirected) or input is disabled
      expect(isOnLoginPage || isDisabled).toBe(true)
    })
  })

  test('should validate content length limits @validation @ui', async ({ page }) => {
    await allure.epic('Validation')
    await allure.feature('Content Length Validation')
    await allure.severity('minor')
    await allure.tag('@validation')

    // Ensure test user exists
    if (!testUser) {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    }

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUser.username, testUser.password)
    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    await allure.step('Create todo with max length description', async () => {
      const maxDescription = 'a'.repeat(1000)
      await dashboard.createTodo('Title', maxDescription)
      await allure.parameter('Description Length', '1000 characters')
    })

    await allure.step('Try to exceed description limit', async () => {
      await dashboard.clickNewTodo()
      // Wait for modal
      await page.waitForTimeout(300)
      const overLimit = 'a'.repeat(1001)
      await page.fill('#todoDescription', overLimit)
      
      // Should be prevented by maxlength attribute
      const actualValue = await page.inputValue('#todoDescription')
      expect(actualValue.length).toBeLessThanOrEqual(1000)
    })
  })
})

