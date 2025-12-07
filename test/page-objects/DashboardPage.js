/**
 * Dashboard Page Object
 * Handles all interactions with the todo dashboard
 */
const BasePage = require('./BasePage')

class DashboardPage extends BasePage {
  constructor(page) {
    super(page)
    
    // Locators
    this.pageTitle = 'h1:has-text("My Todos")'
    this.newTodoButton = 'button:has-text("New Todo")'
    this.filterAllButton = 'button:has-text("All")'
    this.filterActiveButton = 'button:has-text("Active")'
    this.filterCompletedButton = 'button:has-text("Completed")'
    this.logoutButton = 'button.btn-outline-light:has-text("Logout"), nav button:has-text("Logout")'
    
    // Modal locators
    this.modal = '.modal.show, .modal.fade.show'
    this.modalTitle = '.modal-title, #todoModalLabel'
    this.todoTitleInput = '#todoTitle'
    this.todoDescriptionInput = '#todoDescription'
    this.modalSubmitButton = '.modal-footer button[type="submit"], .modal-footer .btn-primary:has-text("Create"), .modal-footer .btn-primary:has-text("Update")'
    this.modalCancelButton = '.modal-footer button:has-text("Cancel"), .modal-footer .btn-secondary'
    this.modalCloseButton = '.btn-close'
    
    // Todo card locators
    this.todoCard = '.card'
    this.todoTitle = '.card-title'
    this.todoCheckbox = 'input[type="checkbox"]'
    this.editButton = 'button:has-text("Edit")'
    this.deleteButton = 'button:has-text("Delete")'
    
    // Confirm modal
    this.confirmModal = '.modal:has-text("Delete Todo")'
    this.confirmDeleteButton = 'button:has-text("Delete")'
    
    // Statistics
    this.totalTodosCard = 'text=Total Todos'
    this.activeTodosCard = 'text=Active'
    this.completedTodosCard = 'text=Completed'
    
    // User info
    this.userInfo = 'strong'
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    // Navigate to dashboard
    await this.navigate('/dashboard')
    
    // Wait for page to load - check multiple possible indicators
    try {
      // First try to wait for the title
      await this.page.waitForSelector(this.pageTitle, { timeout: 15000, state: 'visible' })
    } catch (error) {
      // If title not found, check if we're redirected to login (not authenticated)
      const currentUrl = this.page.url()
      if (currentUrl.includes('/login')) {
        throw new Error('Not authenticated - redirected to login page. Please login first.')
      }
      
      // Try alternative selectors
      const alternativeSelectors = [
        'h1:has-text("My Todos")',
        'h1',
        'main',
        '[role="main"]'
      ]
      
      let found = false
      for (const selector of alternativeSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000, state: 'visible' })
          found = true
          break
        } catch (e) {
          continue
        }
      }
      
      if (!found) {
        // Wait for network to be idle as last resort
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
        // Check one more time
        const titleVisible = await this.page.locator('h1').isVisible({ timeout: 5000 }).catch(() => false)
        if (!titleVisible) {
          throw new Error(`Dashboard page did not load. Current URL: ${currentUrl}`)
        }
      }
    }
  }

  /**
   * Click new todo button
   */
  async clickNewTodo() {
    await this.click(this.newTodoButton)
    // Wait for modal to appear with retry
    await this.page.waitForSelector(this.modal, { state: 'visible', timeout: 10000 }).catch(async () => {
      // Retry once if modal doesn't appear immediately
      await this.page.waitForTimeout(500)
      await this.waitForElement(this.modal, 10000)
    })
  }

  /**
   * Fill todo form in modal
   */
  async fillTodoForm(title, description = '') {
    await this.fill(this.todoTitleInput, title)
    if (description) {
      await this.fill(this.todoDescriptionInput, description)
    }
  }

  /**
   * Submit todo form
   */
  async submitTodoForm() {
    await this.click(this.modalSubmitButton)
    // Wait for modal to close or network to be idle
    try {
      await this.page.waitForSelector(this.modal, { state: 'hidden', timeout: 5000 })
    } catch (error) {
      // If modal still visible, wait for network idle
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(title, description = '') {
    await this.clickNewTodo()
    await this.fillTodoForm(title, description)
    await this.submitTodoForm()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Edit todo by index
   */
  async editTodo(index, newTitle, newDescription = '') {
    const editButtons = this.page.locator(this.editButton)
    await editButtons.nth(index).click()
    // Wait for modal to appear
    await this.page.waitForSelector(this.modal, { state: 'visible', timeout: 10000 })
    
    await this.page.fill(this.todoTitleInput, '') // Clear first
    await this.fillTodoForm(newTitle, newDescription)
    await this.submitTodoForm()
    // Wait for network to be idle or modal to close
    await Promise.race([
      this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {}),
      this.page.waitForSelector(this.modal, { state: 'hidden', timeout: 5000 }).catch(() => {})
    ])
    // Small delay to ensure UI updates
    await this.page.waitForTimeout(500)
  }

  /**
   * Delete todo by index
   */
  async deleteTodo(index) {
    const deleteButtons = this.page.locator(this.deleteButton)
    // Click delete button - wait for it to be clickable
    await deleteButtons.nth(index).waitFor({ state: 'visible', timeout: 10000 })
    await deleteButtons.nth(index).click({ force: true })
    
    // Wait for confirm modal to appear
    await this.page.waitForSelector(this.confirmModal, { state: 'visible', timeout: 10000 })
    // Wait a bit for modal to fully render
    await this.page.waitForTimeout(300)
    await this.click(this.confirmDeleteButton)
    // Wait for network to be idle or confirm modal to close
    await Promise.race([
      this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {}),
      this.page.waitForSelector(this.confirmModal, { state: 'hidden', timeout: 5000 }).catch(() => {})
    ])
    // Wait a bit more for UI to update
    await this.page.waitForTimeout(500)
    // Small delay to ensure UI updates
    await this.page.waitForTimeout(500)
  }

  /**
   * Toggle todo completion by index
   */
  async toggleTodo(index) {
    const checkboxes = this.page.locator(this.todoCheckbox)
    await checkboxes.nth(index).click()
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    // Small delay to ensure UI updates
    await this.page.waitForTimeout(300)
  }

  /**
   * Filter todos
   */
  async filterTodos(filter) {
    switch(filter.toLowerCase()) {
      case 'all':
        await this.click(this.filterAllButton)
        break
      case 'active':
        await this.click(this.filterActiveButton)
        break
      case 'completed':
        await this.click(this.filterCompletedButton)
        break
    }
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Get todo count
   */
  async getTodoCount() {
    return await this.getElementCount(this.todoCard)
  }

  /**
   * Get todo title by index
   */
  async getTodoTitle(index) {
    const titles = this.page.locator(this.todoTitle)
    return await titles.nth(index).textContent()
  }

  /**
   * Check if todo is completed by index
   */
  async isTodoCompleted(index) {
    const checkboxes = this.page.locator(this.todoCheckbox)
    return await checkboxes.nth(index).isChecked()
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const stats = {}
    // Implementation to extract numbers from cards
    return stats
  }

  /**
   * Logout
   */
  async logout() {
    // Wait for logout button to be visible (it's in navbar)
    await this.page.waitForSelector(this.logoutButton, { state: 'visible', timeout: 5000 })
    await this.click(this.logoutButton)
    // Wait for navigation to login page
    await this.page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {
      // If URL doesn't change, wait a bit more
      return this.page.waitForTimeout(1000)
    })
  }

  /**
   * Assert user is logged in
   */
  async assertLoggedIn(username) {
    // User info is in sidebar, wait for it
    await this.page.waitForSelector(this.userInfo, { state: 'visible', timeout: 10000 })
    await this.assertVisible(this.userInfo)
    if (username) {
      // Check if username appears in the page - use more specific selector for sidebar
      const usernameLocator = this.page.locator(`nav strong:has-text("${username}")`).first()
      await expect(usernameLocator).toBeVisible({ timeout: 10000 })
    }
  }

  /**
   * Assert modal is visible
   */
  async assertModalVisible(title) {
    await this.assertVisible(this.modal)
    if (title) {
      await this.assertText(this.modalTitle, title)
    }
  }

  /**
   * Assert no todos message
   */
  async assertNoTodos() {
    await this.assertText('body', 'No todos found')
  }
}

module.exports = DashboardPage

