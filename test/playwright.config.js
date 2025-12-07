const { defineConfig, devices } = require('@playwright/test')
require('dotenv').config()
const testConfig = require('./config/test.config')

module.exports = defineConfig({
  // Include e2e, database, and api folders
  testDir: './',
  testMatch: [
    '**/e2e/**/*.spec.js',
    '**/database/**/*.test.js',
    '**/database/**/*.db.test.js',
    '**/api/**/*.test.js',
    '**/api/**/*.api.test.js'
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 5 : undefined,
  
  // Allure Reporter
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
      categories: [
        {
          name: 'Smoke Tests',
          matchedStatuses: ['failed', 'broken'],
          messageRegex: '.*smoke.*'
        },
        {
          name: 'Authentication Failures',
          matchedStatuses: ['failed'],
          messageRegex: '.*(auth|login|register).*'
        },
        {
          name: 'Todo CRUD Failures',
          matchedStatuses: ['failed'],
          messageRegex: '.*(todo|create|update|delete).*'
        },
        {
          name: 'Validation Errors',
          matchedStatuses: ['failed'],
          messageRegex: '.*validat.*'
        },
        {
          name: 'Flaky Tests',
          matchedStatuses: ['failed'],
          messageRegex: '.*flaky.*'
        }
      ],
      environmentInfo: {
        'Test Environment': process.env.CI ? 'CI/CD' : 'Development',
        'Backend URL': process.env.BACKEND_URL,
        'Frontend URL': process.env.FRONTEND_URL,
        'Browser': 'Chromium, Firefox, WebKit',
        'OS': process.platform,
        'Node Version': process.version
      }
    }]
  ],

  use: {
    baseURL: process.env.FRONTEND_URL || testConfig.urls.frontend,
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Video Recording - FULL ENTERPRISE
    video: 'retain-on-failure',
    
    // Trace
    trace: 'retain-on-failure',
    
    // Timeouts - Increased for hosted servers
    actionTimeout: process.env.CI ? 30000 : 20000,
    navigationTimeout: process.env.CI ? 60000 : 40000,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors (for hosted servers)
    ignoreHTTPSErrors: true,
  },

  // Test projects for different browsers
  projects: [
    // API tests - run only once (no browser needed)
    {
      name: 'api',
      testMatch: [
        '**/api/**/*.test.js',
        '**/api/**/*.api.test.js'
      ],
      use: {
        // API tests don't need browser, but we need baseURL for API calls
        baseURL: process.env.BACKEND_URL || testConfig.urls.api,
      },
      timeout: 300000, // 5 minutes for API tests (longer for rate limiting)
    },
    // E2E tests - run in all browsers
    {
      name: 'chromium',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Allure metadata
        testIdAttribute: 'data-testid'
      },
      timeout: 300000, // 5 minutes for E2E tests
    },
    {
      name: 'firefox',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { ...devices['Desktop Firefox'] },
      timeout: 300000, // 5 minutes for E2E tests
    },
    {
      name: 'webkit',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { ...devices['Desktop Safari'] },
      timeout: 300000, // 5 minutes for E2E tests
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { ...devices['Pixel 5'] },
      timeout: 300000, // 5 minutes for E2E tests
    },
    // Database tests - run only once
    {
      name: 'database',
      testMatch: [
        '**/database/**/*.test.js',
        '**/database/**/*.db.test.js'
      ],
      use: {
        // Database tests don't need browser
        baseURL: process.env.BACKEND_URL || testConfig.urls.api,
      },
      timeout: 300000, // 5 minutes for database tests
    },
  ],
  
  // No webServer - always use hosted servers
  // webServer property is not included, so Playwright won't try to start local servers
})
