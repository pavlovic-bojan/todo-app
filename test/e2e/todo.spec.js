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
    
    // Ensure test user exists
    if (!testUser) {
      const { userData } = await authHelper.createTestUser()
      testUser = userData
    }
    
    // Login before each test
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUser.username, testUser.password)
    
    dashboard = new DashboardPage(page)
    await dashboard.goto()
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
      await expect(page.locator(`text=${todoData.title}`)).toBeVisible()
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
      await dashboard.submitTodoForm()
    })

    await allure.step('Verify validation error appears', async () => {
      await expect(page.locator('.invalid-feedback')).toBeVisible()
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
    })

    const newData = {
      title: 'Updated Todo Title',
      description: 'Updated description'
    }

    await allure.step('Edit the todo', async () => {
      await dashboard.editTodo(0, newData.title, newData.description)
      await allure.parameter('New Title', newData.title)
    })

    await allure.step('Verify updated title appears', async () => {
      await expect(page.locator(`text=${newData.title}`)).toBeVisible()
    })
  })

  test('should delete todo with confirmation @todo @ui @regression', async ({ page }) => {
    await allure.feature('Todo CRUD')
    await allure.story('Delete Todo')
    await allure.severity('normal')
    await allure.tag('@todo', '@regression')

    await allure.step('Create a todo to delete', async () => {
      await dashboard.createTodo('Todo to Delete', 'Will be deleted')
    })

    const initialCount = await dashboard.getTodoCount()

    await allure.step('Click delete button', async () => {
      await dashboard.deleteTodo(0)
    })

    await allure.step('Verify todo count decreased', async () => {
      await page.waitForLoadState('networkidle')
      const newCount = await dashboard.getTodoCount()
      await allure.parameter('Initial Count', initialCount.toString())
      await allure.parameter('New Count', newCount.toString())
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

    await allure.step('Get initial completion state', async () => {
      const initialState = await dashboard.isTodoCompleted(0)
      await allure.parameter('Initial State', initialState ? 'Completed' : 'Not Completed')
    })

    await allure.step('Toggle completion checkbox', async () => {
      await dashboard.toggleTodo(0)
    })

    await allure.step('Verify state changed', async () => {
      await page.waitForLoadState('networkidle')
      const newState = await dashboard.isTodoCompleted(0)
      await allure.parameter('New State', newState ? 'Completed' : 'Not Completed')
    })
  })

  test('should filter todos by status @todo @ui @regression', async ({ page }) => {
    await allure.feature('Todo Management')
    await allure.story('Filter Todos')
    await allure.severity('normal')
    await allure.tag('@todo', '@regression')

    await allure.step('Create completed and active todos', async () => {
      await dashboard.createTodo('Active Todo 1')
      await dashboard.createTodo('Active Todo 2')
      await dashboard.createTodo('Completed Todo')
      await dashboard.toggleTodo(2) // Mark third as completed
    })

    await allure.step('Filter by Active', async () => {
      await dashboard.filterTodos('active')
      await page.waitForLoadState('domcontentloaded')
    })

    await allure.step('Filter by Completed', async () => {
      await dashboard.filterTodos('completed')
      await page.waitForLoadState('domcontentloaded')
    })

    await allure.step('Filter by All', async () => {
      await dashboard.filterTodos('all')
      await page.waitForLoadState('domcontentloaded')
    })
  })

  test('should show todo statistics @todo @ui', async ({ page }) => {
    await allure.feature('Todo Management')
    await allure.story('Display Statistics')
    await allure.severity('minor')
    await allure.tag('@todo', '@ui')

    await allure.step('Verify statistics cards are visible', async () => {
      await expect(page.locator('text=Total Todos')).toBeVisible()
      await expect(page.locator('text=Active')).toBeVisible()
      await expect(page.locator('text=Completed')).toBeVisible()
    })
  })

  test('should cancel todo deletion @todo @ui', async ({ page }) => {
    await allure.feature('Todo CRUD')
    await allure.story('Cancel Delete')
    await allure.severity('minor')
    await allure.tag('@todo', '@negative')

    await allure.step('Create a todo', async () => {
      await dashboard.createTodo('Do Not Delete')
    })

    const initialCount = await dashboard.getTodoCount()

    await allure.step('Click delete but then cancel', async () => {
      const deleteButtons = page.locator('button:has-text("Delete")')
      await deleteButtons.first().click()
      
      // Cancel instead of confirm
      await page.click('button:has-text("Cancel")')
    })

    await allure.step('Verify todo still exists', async () => {
      const newCount = await dashboard.getTodoCount()
      expect(newCount).toBe(initialCount)
    })
  })
})
