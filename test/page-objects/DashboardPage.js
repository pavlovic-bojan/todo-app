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
    this.logoutButton = 'button:has-text("Logout")'
    
    // Modal locators
    this.modal = '.modal'
    this.modalTitle = '.modal-title'
    this.todoTitleInput = '#todoTitle'
    this.todoDescriptionInput = '#todoDescription'
    this.modalSubmitButton = '.modal-footer button[type="submit"]'
    this.modalCancelButton = '.modal-footer button:has-text("Cancel")'
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
    await this.navigate('/dashboard')
    await this.waitForElement(this.pageTitle)
  }

  /**
   * Click new todo button
   */
  async clickNewTodo() {
    await this.click(this.newTodoButton)
    await this.waitForElement(this.modal)
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
    await this.waitForElement(this.modal)
    
    await this.page.fill(this.todoTitleInput, '') // Clear first
    await this.fillTodoForm(newTitle, newDescription)
    await this.submitTodoForm()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Delete todo by index
   */
  async deleteTodo(index) {
    const deleteButtons = this.page.locator(this.deleteButton)
    await deleteButtons.nth(index).click()
    
    // Wait for confirm modal
    await this.waitForElement(this.confirmModal)
    await this.click(this.confirmDeleteButton)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Toggle todo completion by index
   */
  async toggleTodo(index) {
    const checkboxes = this.page.locator(this.todoCheckbox)
    await checkboxes.nth(index).click()
    await this.page.waitForLoadState('networkidle')
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
    await this.click(this.logoutButton)
  }

  /**
   * Assert user is logged in
   */
  async assertLoggedIn(username) {
    await this.assertVisible(this.userInfo)
    if (username) {
      await this.assertText(this.userInfo, username)
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

