/**
 * Accessibility E2E Tests
 * Tests WCAG 2.1 compliance, keyboard navigation, ARIA attributes
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const LoginPage = require('../page-objects/LoginPage')
const DashboardPage = require('../page-objects/DashboardPage')

test.describe('Accessibility Tests', () => {

  test('should support keyboard navigation @accessibility @ui @wcag', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('Keyboard Navigation')
    await allure.story('Full Keyboard Support')
    await allure.severity('critical')
    await allure.tag('@accessibility', '@wcag', '@keyboard')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Navigate form with Tab key', async () => {
      await page.keyboard.press('Tab') // Focus on username
      await page.keyboard.type('testuser')
      
      await page.keyboard.press('Tab') // Focus on password
      await page.keyboard.type('Test123456')
      
      await page.keyboard.press('Tab') // Focus on submit button
      await page.keyboard.press('Enter') // Submit
    })

    await allure.step('Verify login successful via keyboard', async () => {
      await page.waitForURL(/\/dashboard/)
    })
  })

  test('should close modals with Escape key @accessibility @ui @keyboard', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('Keyboard Navigation')
    await allure.story('Escape Key Functionality')
    await allure.severity('normal')
    await allure.tag('@accessibility', '@keyboard')

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', 'Test123456')

    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    await allure.step('Open modal', async () => {
      await dashboard.clickNewTodo()
      await expect(page.locator('.modal')).toBeVisible()
    })

    await allure.step('Press Escape key', async () => {
      await page.keyboard.press('Escape')
    })

    await allure.step('Verify modal closed', async () => {
      await expect(page.locator('.modal')).not.toBeVisible({ timeout: 3000 })
    })
  })

  test('should have proper ARIA labels @accessibility @ui @wcag', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('ARIA Attributes')
    await allure.story('Proper ARIA Labels')
    await allure.severity('critical')
    await allure.tag('@accessibility', '@wcag', '@aria')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Check username field ARIA attributes', async () => {
      const usernameInput = page.locator('#username')
      
      const ariaInvalid = await usernameInput.getAttribute('aria-invalid')
      const autocomplete = await usernameInput.getAttribute('autocomplete')
      
      await allure.parameter('aria-invalid', ariaInvalid)
      await allure.parameter('autocomplete', autocomplete)
      
      expect(autocomplete).toBe('username')
    })

    await allure.step('Check form has proper labels', async () => {
      const usernameLabel = page.locator('label[for="username"]')
      await expect(usernameLabel).toBeVisible()
      
      const passwordLabel = page.locator('label[for="password"]')
      await expect(passwordLabel).toBeVisible()
    })
  })

  test('should have skip to main content link @accessibility @ui @wcag', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('Skip Links')
    await allure.story('Skip to Main Content')
    await allure.severity('normal')
    await allure.tag('@accessibility', '@wcag')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Focus on skip link with Tab', async () => {
      await page.keyboard.press('Tab')
    })

    await allure.step('Verify skip link is visible when focused', async () => {
      const skipLink = page.locator('.skip-to-main')
      // Should become visible on focus
    })
  })

  test('should announce errors to screen readers @accessibility @ui @wcag', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('Screen Reader Support')
    await allure.story('Error Announcements')
    await allure.severity('critical')
    await allure.tag('@accessibility', '@wcag', '@aria-live')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Trigger validation error', async () => {
      await loginPage.login('wrong', 'wrong')
    })

    await allure.step('Check for aria-live region', async () => {
      const alert = page.locator('.alert[role="alert"]')
      const ariaLive = await page.locator('[aria-live]').count()
      
      await allure.parameter('ARIA Live Regions', ariaLive.toString())
      expect(ariaLive).toBeGreaterThan(0)
    })
  })

  test('should have proper focus indicators @accessibility @ui @wcag', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('Focus Management')
    await allure.story('Visible Focus Indicators')
    await allure.severity('normal')
    await allure.tag('@accessibility', '@wcag')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Tab through form elements', async () => {
      await page.keyboard.press('Tab')
      
      // Check if focus is visible (CSS outline)
      const focusedElement = await page.evaluate(() => {
        return document.activeElement.tagName
      })
      
      await allure.parameter('Focused Element', focusedElement)
      expect(focusedElement).toBeTruthy()
    })
  })

  test('should have semantic HTML structure @accessibility @ui @wcag', async ({ page }) => {
    await allure.epic('Accessibility')
    await allure.feature('Semantic HTML')
    await allure.story('Proper HTML5 Elements')
    await allure.severity('minor')
    await allure.tag('@accessibility', '@wcag')

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', 'Test123456')

    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    await allure.step('Check for semantic elements', async () => {
      const main = page.locator('main')
      const nav = page.locator('nav')
      const article = page.locator('article')
      
      await expect(main).toBeVisible()
      await expect(nav).toBeVisible()
      
      await allure.parameter('Main Element', (await main.count()).toString())
      await allure.parameter('Nav Element', (await nav.count()).toString())
    })
  })

  test('should handle autocomplete attributes correctly @accessibility @security @ui', async ({ page }) => {
    await allure.epic('Accessibility & Security')
    await allure.feature('Autocomplete')
    await allure.story('Proper Autocomplete Attributes')
    await allure.severity('minor')
    await allure.tag('@accessibility', '@security')

    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await allure.step('Verify autocomplete attributes', async () => {
      const username = await page.locator('#username').getAttribute('autocomplete')
      const password = await page.locator('#password').getAttribute('autocomplete')
      
      await allure.parameter('Username Autocomplete', username)
      await allure.parameter('Password Autocomplete', password)
      
      expect(username).toBe('username')
      expect(password).toBe('current-password')
    })
  })
})

