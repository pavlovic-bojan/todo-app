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
  workers: process.env.CI ? 1 : undefined,
  
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
    actionTimeout: process.env.CI ? 30000 : 15000,
    navigationTimeout: process.env.CI ? 60000 : 30000,
    
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
      timeout: 60000, // 60 seconds for API tests (longer for rate limiting)
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
    },
    {
      name: 'firefox',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      testMatch: [
        '**/e2e/**/*.spec.js'
      ],
      use: { ...devices['Pixel 5'] },
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
    },
  ],
  
  // No webServer - always use hosted servers
  // webServer property is not included, so Playwright won't try to start local servers
})
