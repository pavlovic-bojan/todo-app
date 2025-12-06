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
        'Test Environment': process.env.CI ? 'CI/CD' : 'Development',
        'Backend URL': process.env.BACKEND_URL || 'http://localhost:3000',
        'Frontend URL': process.env.FRONTEND_URL || 'http://localhost:5173',
        'Browser': 'Chromium, Firefox, WebKit',
        'OS': process.platform,
        'Node Version': process.version
      }
    }]
  ],

  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    
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

  // Web Server - Only start servers if URLs are not provided (local development)
  webServer: process.env.FRONTEND_URL || process.env.BACKEND_URL ? [] : [
    {
      command: 'cd ../backend && npm run dev',
      port: 3000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      url: 'http://localhost:3000/api/health',
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'file:../backend/prisma/dev.db',
        JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-ci-pipeline-only',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-ci-only',
        PORT: '3000',
        NODE_ENV: 'test'
      }
    },
    {
      command: 'cd ../frontend && npm run dev',
      port: 5173,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      url: 'http://localhost:5173',
      env: {
        VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000'
      }
    }
  ],
})
