/**
 * Test Configuration
 * Centralized configuration for all tests
 */

module.exports = {
  // Base URLs
  urls: {
    backend: process.env.BACKEND_URL || 'http://localhost:3000',
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    api: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : 'http://localhost:3000/api'
  },

  // Timeouts (in milliseconds)
  timeouts: {
    short: 3000,
    medium: 15000,
    long: 30000,
    veryLong: 60000,
    default: 30000,
    modal: 5000
  },

  // Test user credentials
  testUser: {
    username: process.env.TEST_USERNAME || 'testuser',
    password: process.env.TEST_PASSWORD || 'Test123456',
    email: process.env.TEST_EMAIL || 'test@example.com'
  },

  // Database
  database: {
    path: process.env.DB_PATH || '../backend/dev.db'
  },

  // Allure
  allure: {
    resultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
    reportDir: process.env.ALLURE_REPORT_DIR || 'allure-report'
  },

  // Performance
  performance: {
    duration: parseInt(process.env.PERF_DURATION) || 300,
    arrivalRate: parseInt(process.env.PERF_ARRIVAL_RATE) || 10
  },

  // Browser settings
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    viewport: {
      width: 1280,
      height: 720
    }
  },

  // Test data
  testData: {
    maxUsers: 100,
    maxTodos: 1000,
    cleanupAfterTests: process.env.CLEANUP !== 'false'
  },

  // Retry settings
  retry: {
    smoke: 0,
    regression: 2,
    performance: 0
  },

  // Parallel execution
  parallel: {
    workers: process.env.WORKERS || undefined, // Playwright auto-detects
    fullyParallel: process.env.FULLY_PARALLEL !== 'false'
  }
}

