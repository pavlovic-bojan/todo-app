# 🛠️ Setup Guide - QA Framework

Complete setup instructions for the QA testing framework.

---

## 📋 Prerequisites

### Required Software

1. **Node.js** v18.0.0 or higher
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** v9.0.0 or higher
   - Comes with Node.js
   - Verify: `npm --version`

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/
   - Verify: `git --version`

---

## 🚀 Installation

### Step 1: Install Dependencies

```bash
cd todo-app/test
npm install
```

This installs:
- Playwright (UI testing)
- Allure (reporting)
- Artillery (performance testing)
- Pact (contract testing)
- Ajv (schema validation)
- better-sqlite3 (database testing)
- All helper libraries

### Step 2: Install Playwright Browsers

```bash
npm run install:browsers
```

This downloads:
- Chromium
- Firefox
- WebKit

**Note:** This is ~500MB download, might take a few minutes.

---

## ⚙️ Configuration

### Backend Configuration

1. **Start backend server:**
   ```bash
   cd todo-app/backend
   npm run dev
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Frontend Configuration

1. **Start frontend server:**
   ```bash
   cd todo-app/frontend
   npm run dev
   ```

2. **Verify it's running:**
   Open browser: http://localhost:5173

### Database Setup

The backend should automatically create `dev.db` when it starts.

If not:
```bash
cd todo-app/backend
npm run prisma:migrate
```

---

## 👤 Test User Setup

### Option 1: Manual Registration

1. Open http://localhost:5173/register
2. Fill in:
   - **Username:** `testuser`
   - **Email:** `test@example.com`
   - **Password:** `Test123456`
   - **Role:** `client`
3. Click "Register"

### Option 2: API Registration

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456",
    "role": "client"
  }'
```

---

## ✅ Verify Setup

### Test 1: Backend Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected:** `{"status":"ok"}`

### Test 2: Frontend Access

Visit http://localhost:5173

**Expected:** Login page loads

### Test 3: Run Smoke Tests

```bash
cd todo-app/test
npm run test:smoke
```

**Expected:** All tests pass ✅

### Test 4: Generate Report

```bash
npm run report
```

**Expected:** Allure report opens in browser

---

## 📁 Project Structure Verification

After installation, you should have:

```
todo-app/test/
├── node_modules/          ✅ (created after npm install)
├── e2e/                   ✅
├── page-objects/          ✅
├── api/                   ✅
├── database/              ✅
├── contract/              ✅
├── performance/           ✅
├── helpers/               ✅
├── fixtures/              ✅
├── config/                ✅
├── logs/                  ✅
├── pacts/                 ✅
├── screenshots/           ✅
├── videos/                ✅
├── playwright.config.js   ✅
├── package.json           ✅
└── README.md              ✅
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module 'playwright'"

**Solution:**
```bash
cd todo-app/test
npm install
```

### Error: "Browsers not installed"

**Solution:**
```bash
npm run install:browsers
```

### Error: "Cannot connect to backend"

**Solutions:**

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **If not running, start it:**
   ```bash
   cd todo-app/backend
   npm run dev
   ```

3. **Check if port 3000 is in use:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

### Error: "Cannot connect to frontend"

**Solutions:**

1. **Check if frontend is running:**
   ```bash
   curl http://localhost:5173
   ```

2. **If not running, start it:**
   ```bash
   cd todo-app/frontend
   npm run dev
   ```

### Error: "Database not found"

**Solution:**
```bash
cd todo-app/backend
npm run prisma:migrate
```

### Error: "Test user not found"

**Solution:**

Create test user manually:
1. Visit http://localhost:5173/register
2. Register with credentials:
   - Username: `testuser`
   - Password: `Test123456`

### Error: "Port already in use"

**Backend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

**Frontend (5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

### Error: "Permission denied"

**Windows:**
Run terminal as Administrator

**Linux/Mac:**
```bash
sudo npm install
```

---

## 🌐 Environment Variables (Optional)

Create `.env` file in `test/` folder:

```env
# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Test Environment
TEST_ENV=development

# Test User
TEST_USERNAME=testuser
TEST_PASSWORD=Test123456
TEST_EMAIL=test@example.com

# Allure
ALLURE_RESULTS_DIR=allure-results
ALLURE_REPORT_DIR=allure-report

# Performance
PERF_DURATION=300
PERF_ARRIVAL_RATE=10

# Database
DB_PATH=../backend/dev.db

# Browser
HEADLESS=true
SLOW_MO=0
```

---

## ✅ Ready to Test!

Once all steps are complete:

1. ✅ Dependencies installed
2. ✅ Browsers installed
3. ✅ Backend running (port 3000)
4. ✅ Frontend running (port 5173)
5. ✅ Test user created
6. ✅ Smoke tests passing

You're ready to run the full test suite!

---

## 📚 Next Steps

1. **Read main documentation:**
   - [README.md](./README.md) - Complete framework guide

2. **Quick start:**
   - [QUICK_START.md](./QUICK_START.md) - 5-minute guide

3. **Run tests:**
   ```bash
   npm test              # All tests
   npm run test:smoke    # Quick tests
   npm run report        # View results
   ```

---

## 🆘 Still Having Issues?

1. **Check logs:**
   - Backend: `todo-app/backend/logs/`
   - Tests: `todo-app/test/logs/`

2. **Clear and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run install:browsers
   ```

3. **Verify Node version:**
   ```bash
   node --version  # Should be v18+
   npm --version   # Should be v9+
   ```

4. **Check firewall:**
   - Ensure ports 3000 and 5173 are not blocked

5. **Restart services:**
   ```bash
   # Kill all Node processes and restart
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

---

**Setup complete!** Ready to test! 🎉

