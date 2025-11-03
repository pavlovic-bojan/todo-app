/**
 * Allure Configuration
 * Centralized configuration for Allure reporting
 */

module.exports = {
  // Results directory
  resultsDir: 'allure-results',
  
  // Report directory
  reportDir: 'allure-report',
  
  // Categories for grouping test failures
  categories: [
    {
      name: 'Smoke Tests Failures',
      matchedStatuses: ['failed', 'broken'],
      messageRegex: '.*smoke.*'
    },
    {
      name: 'Critical Authentication Issues',
      matchedStatuses: ['failed', 'broken'],
      messageRegex: '.*(auth|login|register).*'
    },
    {
      name: 'Todo Management Failures',
      matchedStatuses: ['failed', 'broken'],
      messageRegex: '.*(todo|create|update|delete).*'
    },
    {
      name: 'API Validation Errors',
      matchedStatuses: ['failed'],
      messageRegex: '.*schema.*validation.*'
    },
    {
      name: 'Database Issues',
      matchedStatuses: ['failed'],
      messageRegex: '.*database.*'
    },
    {
      name: 'Performance Issues',
      matchedStatuses: ['failed'],
      messageRegex: '.*performance.*timeout.*'
    },
    {
      name: 'Flaky Tests',
      matchedStatuses: ['failed'],
      messageRegex: '.*flaky.*'
    },
    {
      name: 'Accessibility Failures',
      matchedStatuses: ['failed'],
      messageRegex: '.*accessibility.*aria.*'
    }
  ],
  
  // Severity levels
  severity: {
    BLOCKER: 'blocker',      // Critical bugs blocking further testing
    CRITICAL: 'critical',    // Major features broken
    NORMAL: 'normal',        // Standard functionality issues
    MINOR: 'minor',          // Minor issues
    TRIVIAL: 'trivial'       // Cosmetic issues
  },
  
  // Tags for organizing tests
  tags: {
    SMOKE: '@smoke',
    REGRESSION: '@regression',
    UI: '@ui',
    API: '@api',
    DB: '@db',
    CONTRACT: '@contract',
    PERFORMANCE: '@performance',
    AUTH: '@auth',
    TODO: '@todo',
    VALIDATION: '@validation',
    SECURITY: '@security',
    ACCESSIBILITY: '@accessibility'
  },
  
  // Environment configuration
  environment: {
    'Test Environment': process.env.TEST_ENV || 'Development',
    'Backend URL': process.env.BACKEND_URL || 'http://localhost:3000',
    'Frontend URL': process.env.FRONTEND_URL || 'http://localhost:5173',
    'Database': 'SQLite',
    'Test Framework': 'Playwright + Pact + Artillery',
    'Reporter': 'Allure',
    'Node Version': process.version,
    'Platform': process.platform
  },
  
  // Attachment settings
  attachments: {
    screenshots: true,
    videos: true,
    traces: true,
    logs: true,
    requestBodies: true,
    responseBodies: true
  },
  
  // History settings for trends
  history: {
    enabled: true,
    maxBuilds: 20,
    trendDir: 'allure-report/history'
  }
}

