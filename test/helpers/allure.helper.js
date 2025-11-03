/**
 * Allure Helper
 * Utilities for Allure reporting
 */
const { allure } = require('allure-playwright')

class AllureHelper {
  /**
   * Add epic
   */
  async epic(name) {
    await allure.epic(name)
  }

  /**
   * Add feature
   */
  async feature(name) {
    await allure.feature(name)
  }

  /**
   * Add story
   */
  async story(name) {
    await allure.story(name)
  }

  /**
   * Set severity
   */
  async severity(level) {
    // blocker, critical, normal, minor, trivial
    await allure.severity(level)
  }

  /**
   * Add tag
   */
  async tag(...tags) {
    for (const tag of tags) {
      await allure.tag(tag)
    }
  }

  /**
   * Add parameter
   */
  async parameter(name, value) {
    await allure.parameter(name, value)
  }

  /**
   * Add attachment
   */
  async attachment(name, content, type = 'text/plain') {
    await allure.attachment(name, content, type)
  }

  /**
   * Add JSON attachment
   */
  async attachJSON(name, data) {
    await allure.attachment(name, JSON.stringify(data, null, 2), 'application/json')
  }

  /**
   * Add step
   */
  async step(name, body) {
    return await allure.step(name, body)
  }

  /**
   * Add description
   */
  async description(text) {
    await allure.description(text)
  }

  /**
   * Add link
   */
  async link(url, name, type = 'custom') {
    await allure.link(url, name, type)
  }

  /**
   * Add issue link
   */
  async issue(name, url) {
    await allure.issue(name, url)
  }

  /**
   * Add test case link
   */
  async tms(name, url) {
    await allure.tms(name, url)
  }

  /**
   * Add owner
   */
  async owner(name) {
    await allure.owner(name)
  }

  /**
   * Add label
   */
  async label(name, value) {
    await allure.label(name, value)
  }

  /**
   * Common test metadata
   */
  async setTestMetadata(options) {
    if (options.epic) await this.epic(options.epic)
    if (options.feature) await this.feature(options.feature)
    if (options.story) await this.story(options.story)
    if (options.severity) await this.severity(options.severity)
    if (options.tags) await this.tag(...options.tags)
    if (options.owner) await this.owner(options.owner)
    if (options.description) await this.description(options.description)
  }

  /**
   * Attach request details
   */
  async attachRequest(method, url, data, headers) {
    await this.attachJSON('Request', {
      method,
      url,
      data,
      headers
    })
  }

  /**
   * Attach response details
   */
  async attachResponse(status, data, headers) {
    await this.attachJSON('Response', {
      status,
      data,
      headers
    })
  }

  /**
   * Attach database state
   */
  async attachDBState(state) {
    await this.attachJSON('Database State', state)
  }

  /**
   * Attach error details
   */
  async attachError(error) {
    await this.attachment('Error', error.message + '\n\n' + error.stack, 'text/plain')
  }

  /**
   * Mark as flaky
   */
  async markAsFlaky(reason) {
    await this.label('flaky', 'true')
    await this.parameter('Flaky Reason', reason)
  }
}

module.exports = new AllureHelper()

