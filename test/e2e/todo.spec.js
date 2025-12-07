/**
 * Todo Management E2E Tests
 * Using Page Object Model pattern
 * With Allure reporting
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const LoginPage = require('../page-objects/LoginPage')
const DashboardPage = require('../page-objects/DashboardPage')
const authHelper = require('../helpers/auth.helper')

// Test user that will be created for todo tests
let testUser = null

test.describe('Todo Management', () => {
  let dashboard

  test.beforeAll(async () => {
    // Create a test user for todo tests
    try {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    } catch (error) {
      console.warn('Failed to create test user in beforeAll, will try in test:', error.message)
    }
  })

  test.beforeEach(async ({ page }) => {
    await allure.epic('Todo Management')
    
    // Ensure test user exists with retry
    if (!testUser) {
      let attempts = 0
      while (attempts < 3 && !testUser) {
        try {
          const result = await authHelper.createTestUser()
          if (result && result.userData) {
            testUser = result.userData
            // Small delay to avoid rate limiting
            await page.waitForTimeout(2000)
            break
          }
        } catch (error) {
          attempts++
          if (attempts < 3) {
            await page.waitForTimeout(3000)
          } else {
            throw new Error(`Failed to create test user after 3 attempts: ${error.message}`)
          }
        }
      }
    }
    
    // Login before each test with retry
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    
    let loginSuccess = false
    for (let attempt = 0; attempt < 3 && !loginSuccess; attempt++) {
      try {
        await loginPage.login(testUser.username, testUser.password)
        // Verify we're on dashboard - check URL and sessionStorage
        await page.waitForURL(/\/dashboard/, { timeout: 25000 })
        // Also verify sessionStorage has token
        const hasToken = await page.evaluate(() => {
          return !!sessionStorage.getItem('accessToken')
        })
        if (!hasToken) {
          throw new Error('Login succeeded but no token in sessionStorage')
        }
        loginSuccess = true
      } catch (error) {
        if (attempt < 2) {
          // Wait before retry
          await page.waitForTimeout(3000)
          // Check if we need to go back to login page
          const currentUrl = page.url()
          if (!currentUrl.includes('/login')) {
            await loginPage.goto()
          }
        } else {
          throw new Error(`Failed to login after 3 attempts: ${error.message}`)
        }
      }
    }
    
    // Navigate to dashboard and verify it's loaded
    dashboard = new DashboardPage(page)
    await dashboard.goto()
    // Wait for dashboard to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(500)
  })

  test('should create a new todo @smoke @todo @ui', async ({ page }) => {
    await allure.feature('Todo CRUD')
    await allure.story('Create Todo')
    await allure.severity('blocker')
    await allure.tag('@smoke', '@todo', '@critical')

    const todoData = {
      title: 'Test Todo',
      description: 'This is a test todo'
    }

    await allure.step('Click new todo button', async () => {
      await dashboard.clickNewTodo()
      // Wait a bit for modal to fully render
      await page.waitForTimeout(300)
      await dashboard.assertModalVisible('Create New Todo')
    })

    await allure.step('Fill todo form', async () => {
      await dashboard.fillTodoForm(todoData.title, todoData.description)
      await allure.parameter('Todo Title', todoData.title)
      await allure.parameter('Todo Description', todoData.description)
    })

    await allure.step('Submit form', async () => {
      await dashboard.submitTodoForm()
    })

    await allure.step('Verify todo appears in list', async () => {
      // Wait for todo to appear with retry
      await expect(page.locator(`text=${todoData.title}`).first()).toBeVisible({ timeout: 10000 })
    })
  })

  test('should show validation error for empty title @validation @todo @ui', async ({ page }) => {
    await allure.feature('Todo CRUD')
    await allure.story('Validation - Empty Title')
    await allure.severity('normal')
    await allure.tag('@validation', '@negative')

    await allure.step('Open create todo modal', async () => {
      await dashboard.clickNewTodo()
    })

    await allure.step('Try to submit without title', async () => {
      // Submit form - validation should prevent submission
      await dashboard.submitTodoForm()
      // Wait for validation to trigger (Vue reactivity)
      await page.waitForTimeout(1000)
    })

    await allure.step('Verify validation error appears', async () => {
      // Check if validation error appears - could be HTML5 validation or Vue validation
      const hasInvalidFeedback = await page.locator('.invalid-feedback').isVisible({ timeout: 5000 }).catch(() => false)
      const hasInvalidClass = await page.locator('#todoTitle.is-invalid').isVisible({ timeout: 5000 }).catch(() => false)
      const isInvalid = await page.locator('#todoTitle').evaluate(el => !el.validity.valid).catch(() => false)
      
      // Accept any form of validation feedback
      expect(hasInvalidFeedback || hasInvalidClass || isInvalid).toBe(true)
    })
  })

  test('should edit existing todo @todo @ui @regression', async ({ page }) => {
    await allure.feature('Todo CRUD')
    await allure.story('Edit Todo')
    await allure.severity('critical')
    await allure.tag('@todo', '@regression')

    // First create a todo
    await allure.step('Create initial todo', async () => {
      await dashboard.createTodo('Original Title', 'Original Description')
      // Wait for todo to appear in list
      await expect(page.locator('text=Original Title').first()).toBeVisible({ timeout: 10000 })
    })

    const newData = {
      title: 'Updated Todo Title',
      description: 'Updated description'
    }

    await allure.step('Edit the todo', async () => {
      // Wait a bit before editing
      await page.waitForTimeout(500)
      await dashboard.editTodo(0, newData.title, newData.description)
      await allure.parameter('New Title', newData.title)
    })

    await allure.step('Verify updated title appears', async () => {
      // Wait for updated title to appear
      await expect(page.locator(`text=${newData.title}`).first()).toBeVisible({ timeout: 10000 })
    })
  })

  test('should toggle todo completion @todo @ui @smoke', async ({ page }) => {
    await allure.feature('Todo CRUD')
    await allure.story('Toggle Completion')
    await allure.severity('critical')
    await allure.tag('@smoke', '@todo')

    await allure.step('Create a new todo', async () => {
      await dashboard.createTodo('Toggle Test', 'Test toggle functionality')
    })

    let initialState
    await allure.step('Get initial completion state', async () => {
      initialState = await dashboard.isTodoCompleted(0)
      await allure.parameter('Initial State', initialState ? 'Completed' : 'Not Completed')
    })

    await allure.step('Toggle completion checkbox', async () => {
      await dashboard.toggleTodo(0)
    })

    await allure.step('Verify state changed', async () => {
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
      // Wait a bit more for UI to update
      await page.waitForTimeout(500)
      const newState = await dashboard.isTodoCompleted(0)
      await allure.parameter('New State', newState ? 'Completed' : 'Not Completed')
      expect(newState).not.toBe(initialState)
    })
  })

  test('should filter todos by status @todo @ui @regression', async ({ page }) => {
    await allure.feature('Todo Management')
    await allure.story('Filter Todos')
    await allure.severity('normal')
    await allure.tag('@todo', '@regression')

    await allure.step('Create completed and active todos', async () => {
      await dashboard.createTodo('Active Todo 1')
      await page.waitForTimeout(500)
      await dashboard.createTodo('Active Todo 2')
      await page.waitForTimeout(500)
      await dashboard.createTodo('Completed Todo')
      await page.waitForTimeout(500)
      await dashboard.toggleTodo(2) // Mark third as completed
      await page.waitForTimeout(500)
    })

    await allure.step('Filter by Active', async () => {
      await dashboard.filterTodos('active')
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(300)
    })

    await allure.step('Filter by Completed', async () => {
      await dashboard.filterTodos('completed')
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(300)
    })

    await allure.step('Filter by All', async () => {
      await dashboard.filterTodos('all')
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(300)
    })
  })

})
