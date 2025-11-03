const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './e2e',
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
        'Test Environment': 'Development',
        'Backend URL': 'http://localhost:3000',
        'Frontend URL': 'http://localhost:5173',
        'Browser': 'Chromium, Firefox, WebKit',
        'OS': process.platform,
        'Node Version': process.version
      }
    }]
  ],

  use: {
    baseURL: 'http://localhost:5173',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Video Recording - FULL ENTERPRISE
    video: 'retain-on-failure',
    
    // Trace
    trace: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors (for dev)
    ignoreHTTPSErrors: true,
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Allure metadata
        testIdAttribute: 'data-testid'
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Web Server - Auto-start backend and frontend
  webServer: [
    {
      command: 'cd ../backend && npm run dev',
      port: 3000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../frontend && npm run dev',
      port: 5173,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    }
  ],
})
