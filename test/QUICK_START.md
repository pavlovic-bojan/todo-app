# ⚡ Quick Start Guide - QA Framework

Get started with testing in **5 minutes**!

---

## 🚀 Step 1: Install Dependencies

```bash
cd todo-app/test
npm install
npm run install:browsers
```

---

## 🏃 Step 2: Start Services

**Terminal 1 - Backend:**
```bash
cd todo-app/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd todo-app/frontend
npm run dev
```

---

## ✅ Step 3: Create Test User

Visit https://todo-app-frontend-seven-rho.vercel.app/register and create:
- **Username:** `testuser`
- **Email:** `test@example.com`
- **Password:** `Test123456`
- **Role:** Client

---

## 🧪 Step 4: Run Smoke Tests

```bash
cd todo-app/test
npm run test:smoke
```

**Expected output:**
```
Running 10 tests using 3 workers
  ✓ should register a new user @smoke
  ✓ should login with valid credentials @smoke
  ✓ should create a new todo @smoke
  ...
  
10 passed (25.3s)
```

---

## 📊 Step 5: View Allure Report

```bash
npm run report
```

Browser opens with:
- ✅ Test results
- 📸 Screenshots
- 🎥 Videos (if any failures)
- 📈 Trends
- 🏷️ Tags & categories

---

## 🎯 What's Next?

### Run All Tests

```bash
# All UI tests
npm test

# API tests
npm run test:api

# Database tests
npm run test:db

# Performance tests
npm run test:performance
```

### Run Specific Test Types

```bash
# Only authentication tests
npx playwright test --grep @auth

# Only todo tests
npx playwright test --grep @todo

# Regression suite
npm run test:regression
```

### Debug a Failing Test

```bash
# Debug mode (step through)
npm run test:debug

# Headed mode (see browser)
npm run test:headed

# Specific test file
npx playwright test e2e/auth.spec.js --headed
```

---

## 📚 Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all Playwright tests |
| `npm run test:smoke` | Quick sanity tests |
| `npm run test:ui` | UI tests only |
| `npm run test:api` | API tests only |
| `npm run test:db` | Database tests |
| `npm run test:contract` | Contract tests |
| `npm run test:performance` | Load test |
| `npm run report` | Generate & open Allure report |

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to backend"
```bash
# Check backend is running
curl https://todo-app-xhn2.onrender.com/api/health

# If not running:
cd backend && npm run dev
```

### ❌ "Cannot connect to frontend"
```bash
# Check frontend is running
curl https://todo-app-frontend-seven-rho.vercel.app

# If not running:
cd frontend && npm run dev
```

### ❌ "Test user not found"
Create user manually at https://todo-app-frontend-seven-rho.vercel.app/register

### ❌ "Browsers not installed"
```bash
npm run install:browsers
```

---

## 🎉 You're Ready!

✅ Dependencies installed  
✅ Services running  
✅ Test user created  
✅ Tests passing  
✅ Reports generated  

**Full documentation:** [README.md](./README.md)

**Happy Testing!** 🧪

