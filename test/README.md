# 🧪 Enterprise QA Testing Framework

**Complete testing solution for Todo App** - UI (POM), API (Schema Validation), Database, Contract (Pact), Performance (Artillery), and Comprehensive Allure Reports.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Types](#test-types)
4. [Project Structure](#project-structure)
5. [Running Tests](#running-tests)
6. [Allure Reports](#allure-reports)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This QA framework provides **enterprise-grade testing** with:

### ✅ Features

- **UI Testing** - Playwright with Page Object Model (POM)
- **API Testing** - Direct API calls with JSON Schema Validation (Ajv)
- **Database Testing** - Direct SQLite access with better-sqlite3
- **Contract Testing** - Consumer-driven contracts with Pact.js
- **Performance Testing** - Load, Stress, Spike tests with Artillery
- **Allure Reports** - Screenshots, Videos, History, Trends, Categories, Tags, Flaky Test Detection

### 🎨 Test Coverage

| Test Type | Count | Coverage |
|-----------|-------|----------|
| **UI Tests** | 25+ | Auth, Todo CRUD, Validation, Security, Accessibility |
| **API Tests** | 20+ | Auth API, Todo API, Schema Validation, Rate Limiting |
| **DB Tests** | 15+ | User Table, Todo Table, Integrity, Constraints |
| **Contract Tests** | 10+ | Consumer-Provider contracts for all APIs |
| **Performance Tests** | 4 scenarios | Load, Stress, Spike, Endurance |

### 🏆 Quality Standards

- **Code Quality:** TypeScript/JSDoc, ESLint, Prettier
- **Test Design:** POM Pattern, DRY, SOLID principles
- **Reporting:** Allure with video, screenshots, history, trends
- **CI/CD Ready:** GitHub Actions, Jenkins, GitLab CI compatible

---

## 🚀 Quick Start

### Prerequisites

```bash
# Ensure you have Node.js 18+ and npm 9+
node --version  # v18.0.0+
npm --version   # 9.0.0+
```

### Installation

```bash
# From todo-app root
npm install

# Or from test folder
cd test
npm install

# Install Playwright browsers
npm run install:browsers
```

### First Test Run

```bash
# 1. Start backend (Terminal 1)
cd backend
npm run dev

# 2. Start frontend (Terminal 2)
cd frontend
npm run dev

# 3. Run smoke tests (Terminal 3)
cd test
npm run test:smoke

# 4. View Allure report
npm run report
```

---

## 🧩 Test Types

### 1️⃣ UI Tests (Playwright + POM)

**Location:** `e2e/`

**Technologies:** Playwright, Page Object Model

**Tests:**
- ✅ `auth.spec.js` - Login, Register, Forgot/Reset Password, Logout
- ✅ `todo.spec.js` - Todo CRUD, Filters, Toggle completion
- ✅ `validation.spec.js` - Form validation, Input sanitization
- ✅ `security.spec.js` - XSS prevention, SQL injection, CSRF
- ✅ `accessibility.spec.js` - WCAG 2.1, Keyboard navigation, ARIA

**Run:**
```bash
npm test                    # All UI tests
npm run test:ui             # UI tests only
npm run test:headed         # With browser visible
npm run test:debug          # Debug mode
```

**Page Objects:** `page-objects/`
- `BasePage.js` - Common methods
- `LoginPage.js` - Login page interactions
- `RegisterPage.js` - Registration page
- `DashboardPage.js` - Todo dashboard
- `ForgotPasswordPage.js` - Password reset request
- `ResetPasswordPage.js` - Password reset confirmation

---

### 2️⃣ API Tests (Schema Validation)

**Location:** `api/`

**Technologies:** Axios, Ajv (JSON Schema Validation)

**Tests:**
- ✅ `auth.api.test.js` - Registration, Login, Logout, Token Refresh, Rate Limiting
- ✅ `todo.api.test.js` - Todo CRUD, Filters, XSS prevention

**JSON Schemas:** `api/schemas/`
- `user.schema.json` - User response validation
- `todo.schema.json` - Todo response validation
- `login-response.schema.json` - Login response
- `register-response.schema.json` - Registration response
- `error-response.schema.json` - Error responses

**Run:**
```bash
npm run test:api            # All API tests
```

**Example Test:**
```javascript
const response = await apiHelper.post('/users/register', userData)
await apiHelper.validateSchema(response, 'register-response')  // ✅ Schema validation
apiHelper.assertStatusCode(response, 201)
```

---

### 3️⃣ Database Tests (Direct SQLite)

**Location:** `database/`

**Technologies:** better-sqlite3

**Tests:**
- ✅ `user.db.test.js` - User records, Password hashing, Reset tokens, Refresh tokens
- ✅ `todo.db.test.js` - Todo records, Foreign keys, Cascade deletes
- ✅ `integrity.db.test.js` - Referential integrity, Constraints, Indexes

**Run:**
```bash
npm run test:db             # All DB tests
```

**Example Test:**
```javascript
const userInDB = dbHelper.getUserByUsername('testuser')
expect(userInDB.hashedPassword).toMatch(/^\$2[aby]\$/)  // ✅ bcrypt format
```

---

### 4️⃣ Contract Tests (Pact.js)

**Location:** `contract/`

**Technologies:** Pact.js (Consumer-Driven Contracts)

**Consumer Tests:** `contract/consumer/`
- Defines expectations from Frontend perspective

**Provider Tests:** `contract/provider/`
- Verifies Backend matches Frontend expectations

**Run:**
```bash
npm run test:contract           # Both consumer & provider
npm run test:contract:consumer  # Consumer only
npm run test:contract:provider  # Provider only
```

**What it does:**
1. Consumer creates contract (pact file)
2. Provider verifies it implements the contract
3. Ensures Frontend/Backend compatibility

---

### 5️⃣ Performance Tests (Artillery)

**Location:** `performance/`

**Technologies:** Artillery

**Scenarios:**
- 📊 **Load Test** - Normal expected load (5-50 users, 9 min)
- 🔥 **Stress Test** - Breaking point test (10-300 users, 9 min)
- ⚡ **Spike Test** - Sudden traffic spikes (10-1000 users, 5 min)
- ⏱️ **Endurance Test** - Long-running stability (20 users, 1 hour)

**Run:**
```bash
npm run test:performance        # Load test
npm run test:performance:stress # Stress test
npm run test:performance:spike  # Spike test
npm run test:performance:all    # All performance tests
```

**Metrics Tracked:**
- Response times (p50, p95, p99)
- Request rate (req/sec)
- Success/Error rate
- Throughput

---

## 📂 Project Structure

```
test/
├── 📁 e2e/                          # UI Tests (Playwright)
│   ├── auth.spec.js                 # Authentication flow
│   ├── todo.spec.js                 # Todo management
│   ├── validation.spec.js           # Form validation
│   ├── security.spec.js             # Security tests
│   └── accessibility.spec.js        # Accessibility (WCAG)
│
├── 📁 page-objects/                 # Page Object Model
│   ├── BasePage.js                  # Base class
│   ├── LoginPage.js                 # Login page
│   ├── RegisterPage.js              # Register page
│   ├── DashboardPage.js             # Dashboard page
│   ├── ForgotPasswordPage.js        # Forgot password
│   └── ResetPasswordPage.js         # Reset password
│
├── 📁 api/                          # API Tests
│   ├── auth.api.test.js             # Auth API tests
│   ├── todo.api.test.js             # Todo API tests
│   └── schemas/                     # JSON Schemas
│       ├── user.schema.json
│       ├── todo.schema.json
│       ├── login-response.schema.json
│       ├── register-response.schema.json
│       └── error-response.schema.json
│
├── 📁 database/                     # Database Tests
│   ├── user.db.test.js              # User table tests
│   ├── todo.db.test.js              # Todo table tests
│   ├── integrity.db.test.js         # Integrity tests
│   └── run-db-tests.js              # DB test runner
│
├── 📁 contract/                     # Contract Tests (Pact)
│   ├── consumer/                    # Consumer side
│   │   ├── todo-api.pact.test.js
│   │   └── run-consumer.js
│   └── provider/                    # Provider side
│       ├── todo-api.provider.test.js
│       └── run-provider.js
│
├── 📁 performance/                  # Performance Tests (Artillery)
│   ├── scenarios/
│   │   ├── load-test.yml            # Load test
│   │   ├── stress-test.yml          # Stress test
│   │   ├── spike-test.yml           # Spike test
│   │   └── endurance-test.yml       # Endurance test
│   ├── processors/
│   │   └── auth-processor.js        # Custom functions
│   └── README.md
│
├── 📁 helpers/                      # Test Helpers
│   ├── api.helper.js                # API client + schema validation
│   ├── auth.helper.js               # Authentication utilities
│   ├── db.helper.js                 # Database utilities
│   └── data-generator.js            # Random test data
│
├── 📁 fixtures/                     # Test Data
│   ├── users.fixture.js             # User test data
│   └── todos.fixture.js             # Todo test data
│
├── 📁 config/                       # Configuration
│   └── allure.config.js             # Allure configuration
│
├── playwright.config.js             # Playwright configuration
├── package.json                     # Dependencies & scripts
└── README.md                        # This file
```

---

## ▶️ Running Tests

### All Tests

```bash
npm test                # All Playwright tests
```

### By Type

```bash
npm run test:ui         # UI tests (Playwright)
npm run test:api        # API tests
npm run test:db         # Database tests
npm run test:contract   # Contract tests
npm run test:performance # Performance tests
```

### By Tag

```bash
npm run test:smoke      # Smoke tests (@smoke)
npm run test:regression # Regression tests (@regression)
```

### Specific Test File

```bash
npx playwright test e2e/auth.spec.js
npx playwright test e2e/todo.spec.js
```

### With Options

```bash
npm run test:headed     # Show browser
npm run test:debug      # Debug mode
npm run test:ui         # Interactive UI mode
```

---

## 📊 Allure Reports

### Features

✅ **Screenshots** - Captured on failure  
✅ **Video Recording** - Full test execution videos  
✅ **Test History** - Track test results over time  
✅ **Trends** - Success/failure trends  
✅ **Categories** - Auto-categorize failures  
✅ **Tags** - Filter by @smoke, @regression, etc.  
✅ **Flaky Test Detection** - Identify unstable tests  
✅ **Request/Response Attachments** - API payloads  
✅ **Database State** - DB snapshots  
✅ **Severity Levels** - Blocker, Critical, Normal, Minor  
✅ **Epics & Features** - Organized test structure  

### Generate Report

```bash
# After running tests
npm run report          # Generate and open report
npm run report:generate # Generate only
npm run report:open     # Open existing report
npm run report:serve    # Serve on localhost
```

### Report Structure

**Allure Dashboard shows:**
- ✅ Total tests / Passed / Failed
- 📊 Success rate percentage
- ⏱️ Execution time
- 📈 Trends over multiple runs
- 🏷️ Tests by category (Auth, Todo, Validation, etc.)
- 🎯 Tests by severity (Blocker, Critical, Normal)
- 🏃 Flaky tests detection

### History & Trends

Allure automatically tracks:
- Test execution history (last 20 builds)
- Pass/Fail trends over time
- Flaky test identification
- Performance degradation

**To preserve history:**
```bash
# History is preserved in allure-report/history
# Automatically maintained by Allure
```

---

## ⚙️ Configuration

### Playwright Config

**File:** `playwright.config.js`

```javascript
{
  testDir: './e2e',
  reporter: [
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      video: 'retain-on-failure',  // 🎥 Video recording
      screenshot: 'only-on-failure',
      categories: [...],  // Auto-categorization
      environmentInfo: {...}
    }]
  ]
}
```

### Allure Config

**File:** `config/allure.config.js`

Defines:
- Categories (failure grouping)
- Severity levels
- Tags
- Environment info
- Attachment settings

---

## 📋 Best Practices

### ✅ Do's

1. **Use POM Pattern** - All UI tests use Page Objects
2. **Schema Validation** - Validate all API responses
3. **Clean Test Data** - Use fixtures and data generators
4. **Descriptive Names** - `should login with valid credentials`
5. **Allure Annotations** - `@smoke`, `@regression`, severity
6. **Isolate Tests** - Each test independent
7. **Assertions** - Multiple assertions per test OK
8. **Attachments** - Add screenshots, requests, responses

### ❌ Don'ts

1. **Don't hardcode** - Use fixtures/generators
2. **Don't skip cleanup** - Clean DB between tests
3. **Don't test UI & API together** - Separate concerns
4. **Don't use sleep()** - Use waitFor...
5. **Don't ignore flaky tests** - Fix or mark as known
6. **Don't commit .env** - Use .env.example
7. **Don't run all tests always** - Use tags (@smoke)

### 🏷️ Tagging Strategy

```javascript
// In test files
test('should do something @smoke @auth @critical', async () => {
  await allure.tag('@smoke', '@auth')
  await allure.severity('blocker')
  // test code
})
```

**Tags:**
- `@smoke` - Quick sanity tests (run always)
- `@regression` - Full regression suite
- `@ui` - UI tests
- `@api` - API tests
- `@db` - Database tests
- `@auth` - Authentication related
- `@todo` - Todo functionality
- `@security` - Security tests
- `@validation` - Validation tests

---

## 🔧 Troubleshooting

### Tests Failing?

**1. Backend not running:**
```bash
cd backend
npm run dev  # Should be on https://todo-app-xhn2.onrender.com/api/
```

**2. Frontend not running:**
```bash
cd frontend
npm run dev  # Should be on https://todo-app-frontend-seven-rho.vercel.app
```

**3. Database missing:**
```bash
cd backend
npm run prisma:migrate
```

**4. Browsers not installed:**
```bash
cd test
npm run install:browsers
```

### Common Errors

**Error:** `Cannot find module 'allure-playwright'`
```bash
npm install
```

**Error:** `ECONNREFUSED localhost:3000`
```bash
# Start backend first
cd backend && npm run dev
```

**Error:** `Schema validation failed`
```bash
# Check API response structure matches schema
# Update schema in api/schemas/ if API changed
```

**Error:** `Database locked`
```bash
# Close any DB connections
# Restart tests
```

### Debugging

**Debug specific test:**
```bash
npx playwright test e2e/auth.spec.js --debug
```

**Verbose logging:**
```bash
DEBUG=pw:api npx playwright test
```

**Headed mode (see browser):**
```bash
npm run test:headed
```

---

## 📚 Additional Resources

### Documentation

- [Playwright Docs](https://playwright.dev/)
- [Allure Report](https://docs.qameta.io/allure/)
- [Artillery Docs](https://artillery.io/docs/)
- [Pact Docs](https://docs.pact.io/)
- [Ajv Schema Validation](https://ajv.js.org/)

### Internal Docs

- `performance/README.md` - Performance testing guide
- `api/schemas/` - JSON Schema examples
- `page-objects/` - POM implementation

---

## 🎉 Summary

You now have a **complete enterprise QA framework** with:

✅ **UI Tests** - Playwright + POM  
✅ **API Tests** - Schema validation  
✅ **DB Tests** - Direct SQLite access  
✅ **Contract Tests** - Pact.js  
✅ **Performance Tests** - Artillery  
✅ **Allure Reports** - Video, screenshots, history, trends  

**All pre-configured and ready to run!** 🚀

---

## 🤝 Contributing

1. Write tests following POM pattern
2. Add Allure tags and severity
3. Update schemas if API changes
4. Add fixtures for new test data
5. Document new test types

---

**Happy Testing! 🧪**
