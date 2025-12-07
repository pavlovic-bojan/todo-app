/**
 * Base Page Object
 * Contains common methods used across all page objects
 */
const { expect } = require('@playwright/test')
const config = require('../config/test.config')

class BasePage {
  constructor(page) {
    this.page = page
    this.timeouts = config.timeouts
  }

  /**
   * Navigate to a URL
   */
  async navigate(url) {
    await this.page.goto(url)
  }

  /**
   * Click on an element
   */
  async click(selector) {
    await this.page.click(selector)
  }

  /**
   * Fill input field
   */
  async fill(selector, value) {
    await this.page.fill(selector, value)
  }

  /**
   * Get text content
   */
  async getText(selector) {
    return await this.page.textContent(selector)
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector, timeout = this.timeouts.long) {
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' })
    } catch (error) {
      // If element not found, provide more context
      const currentUrl = this.page.url()
      throw new Error(`Element not found: ${selector} on page ${currentUrl}. ${error.message}`)
    }
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(url) {
    await this.page.waitForURL(url)
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector) {
    return await this.page.isVisible(selector)
  }

  /**
   * Take screenshot
   */
  async screenshot(name) {
    return await this.page.screenshot({ 
      path: `screenshots/${name}.png`,
      fullPage: true 
    })
  }

  /**
   * Get current URL
   */
  async getCurrentUrl() {
    return this.page.url()
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Wait for specific response
   */
  async waitForResponse(urlPattern) {
    await this.page.waitForResponse(urlPattern)
  }

  /**
   * Reload page
   */
  async reload() {
    await this.page.reload()
  }

  /**
   * Get page title
   */
  async getTitle() {
    return await this.page.title()
  }

  /**
   * Press keyboard key
   */
  async pressKey(key) {
    await this.page.keyboard.press(key)
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value)
  }

  /**
   * Check checkbox
   */
  async check(selector) {
    await this.page.check(selector)
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector) {
    await this.page.uncheck(selector)
  }

  /**
   * Get element count
   */
  async getElementCount(selector) {
    return await this.page.locator(selector).count()
  }

  /**
   * Assert element is visible
   */
  async assertVisible(selector, timeout = 10000) {
    await expect(this.page.locator(selector)).toBeVisible({ timeout })
  }

  /**
   * Assert text content
   */
  async assertText(selector, text, timeout = 10000) {
    await expect(this.page.locator(selector)).toContainText(text, { timeout })
  }

  /**
   * Assert URL contains
   */
  async assertUrlContains(text) {
    await expect(this.page).toHaveURL(new RegExp(text))
  }

  /**
   * Get alert/error message
   */
  async getAlertMessage() {
    const alert = this.page.locator('.alert')
    if (await alert.isVisible()) {
      return await alert.textContent()
    }
    return null
  }

  /**
   * Wait for alert to be visible
   */
  async waitForAlert(type = 'success') {
    await this.page.waitForSelector(`.alert-${type}`, { timeout: this.timeouts.modal })
  }
}

module.exports = BasePage

