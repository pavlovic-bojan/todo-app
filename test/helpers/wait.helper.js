/**
 * Wait Helper
 * Utilities for waiting and polling
 */

class WaitHelper {
  /**
   * Wait for milliseconds
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Wait for condition to be true
   */
  async waitFor(condition, options = {}) {
    const {
      timeout = 30000,
      interval = 500,
      message = 'Condition not met within timeout'
    } = options

    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true
      }
      await this.wait(interval)
    }

    throw new Error(message)
  }

  /**
   * Wait until value equals expected
   */
  async waitUntil(getValue, expected, options = {}) {
    return await this.waitFor(
      async () => (await getValue()) === expected,
      options
    )
  }

  /**
   * Wait until value is truthy
   */
  async waitUntilTruthy(getValue, options = {}) {
    return await this.waitFor(
      async () => !!(await getValue()),
      options
    )
  }

  /**
   * Poll API endpoint until condition met
   */
  async pollAPI(apiCall, condition, options = {}) {
    const {
      timeout = 30000,
      interval = 1000,
      message = 'API condition not met within timeout'
    } = options

    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const response = await apiCall()
      
      if (condition(response)) {
        return response
      }
      
      await this.wait(interval)
    }

    throw new Error(message)
  }

  /**
   * Retry function until it succeeds
   */
  async retry(fn, options = {}) {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = false,
      message = 'Function failed after max retries'
    } = options

    let lastError

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (attempt < maxAttempts) {
          const waitTime = backoff ? delay * attempt : delay
          await this.wait(waitTime)
        }
      }
    }

    throw new Error(`${message}: ${lastError.message}`)
  }

  /**
   * Wait for database record to exist
   */
  async waitForDBRecord(dbHelper, checkFn, options = {}) {
    return await this.waitFor(
      async () => {
        const record = checkFn(dbHelper)
        return !!record
      },
      {
        timeout: options.timeout || 10000,
        interval: options.interval || 500,
        message: options.message || 'Database record not found'
      }
    )
  }
}

module.exports = new WaitHelper()

