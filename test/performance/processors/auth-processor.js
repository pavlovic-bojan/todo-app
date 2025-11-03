/**
 * Artillery Processor Functions
 * Custom functions for performance tests
 */

module.exports = {
  /**
   * Generate random user data
   */
  generateRandomUser: function(context, events, done) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    
    context.vars.username = `perftest_${timestamp}_${random}`
    context.vars.email = `perftest_${timestamp}_${random}@example.com`
    context.vars.password = 'PerfTest123456'
    
    return done()
  },

  /**
   * Log response time
   */
  logResponseTime: function(context, events, done) {
    console.log(`Response time: ${context.vars.$loopElement}ms`)
    return done()
  },

  /**
   * Custom assertions
   */
  checkResponse: function(context, events, done) {
    if (context.response.statusCode !== 200 && context.response.statusCode !== 201) {
      console.error(`Unexpected status code: ${context.response.statusCode}`)
    }
    return done()
  }
}

