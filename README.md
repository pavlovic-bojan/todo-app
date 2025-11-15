# 📋 Todo App - Full Stack Application

A complete full-stack Todo application with user authentication, built using modern technologies in a monorepo structure.

---

## 🏗️ Project Structure

This is a monorepo containing three packages:

```
todo-app/
├── backend/          # Express API with Prisma ORM and PostgreSQL
├── frontend/         # Vue 3 frontend application
├── test/             # Enterprise QA Testing Framework
└── package.json      # Root package.json (monorepo config)
```

---

## ✨ Features

### Backend
- ✅ User Authentication (Register, Login, Logout)
- ✅ Password Reset (Forgot/Reset Password)
- ✅ Role-based Authorization (Admin/Client)
- ✅ Todo CRUD operations
- ✅ JWT Authentication with Refresh Tokens
- ✅ Swagger API Documentation
- ✅ Logging with Winston
- ✅ PostgreSQL Database with Prisma ORM
- ✅ Security: Helmet, Rate Limiting, CSRF, Input Validation
- ✅ Comprehensive Unit & Integration Tests

### Frontend
- ✅ Vue 3 with Composition API
- ✅ User Authentication UI
- ✅ Todo Management Dashboard
- ✅ Responsive Design with Bootstrap 5
- ✅ State Management with Pinia
- ✅ XSS Protection with DOMPurify
- ✅ Form Validation
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Unit Tests with Vitest

### Testing (Enterprise QA Framework)
- ✅ **70+ automated tests**
- ✅ UI Testing (Playwright + Page Object Model)
- ✅ API Testing (JSON Schema Validation)
- ✅ Database Testing (Direct SQLite)
- ✅ Contract Testing (Pact.js)
- ✅ Performance Testing (Artillery)
- ✅ Allure Reports (Screenshots, Videos, History, Trends)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Installation

**1. Install all dependencies:**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../test && npm install
```

**2. Setup Backend:**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

**3. Configure Environment:**

Create `backend/.env`:
```env
DATABASE_URL="your-db-url"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
PORT=3000
```

**4. Start Development Servers:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**5. Access Application:**
- Frontend: https://todo-app-frontend-seven-rho.vercel.app
- Backend API: https://todo-app-xhn2.onrender.com/api/
- Swagger Docs: https://todo-app-xhn2.onrender.com/api/docs/

---

## 🧪 Testing

### Run All Tests

```bash
# Backend Tests
cd backend
npm test                 # All tests with coverage
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only

# Frontend Tests
cd frontend
npm test                 # All tests
npm run test:coverage    # With coverage

# QA Framework (E2E, API, DB, Contract, Performance)
cd test
npm run test:smoke       # Quick smoke tests
npm test                 # All UI tests
npm run test:api         # API tests
npm run test:db          # Database tests
npm run test:performance # Performance tests
npm run report           # Generate Allure report
```

---

## 📚 Documentation

### Main Guides
- **[Backend README](backend/README.md)** - Backend API documentation
- **[Frontend README](frontend/README.md)** - Frontend documentation
- **[Test README](test/README.md)** - QA Framework guide
- **[Test Quick Start](test/QUICK_START.md)** - 5-minute testing guide

### Additional Resources
- **[Backend ENV Setup](backend/ENV_SETUP.md)** - Environment configuration
- **[Test Setup Guide](test/SETUP_GUIDE.md)** - Detailed testing setup
- **[CI/CD Integration](test/CI_CD_INTEGRATION.md)** - CI/CD pipeline setup

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQLite + Prisma ORM
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** Helmet, Rate Limiting, CSRF
- **API Docs:** Swagger
- **Logging:** Winston
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **UI Framework:** Bootstrap 5
- **HTTP Client:** Axios
- **Security:** DOMPurify (XSS protection)
- **Testing:** Vitest + @vue/test-utils

### Testing
- **E2E:** Playwright
- **API Testing:** Axios + Ajv (JSON Schema)
- **DB Testing:** better-sqlite3
- **Contract Testing:** Pact.js
- **Performance:** Artillery
- **Reporting:** Allure (with video, screenshots, trends)

---

## 📁 Project Structure

```
todo-app/
│
├── backend/                    # Express Backend API
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   ├── routes/         # API routes
│   │   │   └── validations/    # Input validation
│   │   ├── config/             # Configuration files
│   │   └── __tests__/          # Unit & integration tests
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
│
├── frontend/                   # Vue 3 Frontend
│   ├── src/
│   │   ├── components/         # Vue components
│   │   ├── views/              # Page views
│   │   ├── composables/        # Composition API hooks
│   │   ├── stores/             # Pinia stores
│   │   ├── router/             # Vue Router config
│   │   ├── services/           # API client
│   │   └── __tests__/          # Unit tests
│   └── package.json
│
├── test/                       # QA Testing Framework
│   ├── e2e/                    # UI tests (Playwright)
│   ├── page-objects/           # Page Object Model
│   ├── api/                    # API tests
│   ├── database/               # DB tests
│   ├── contract/               # Contract tests (Pact)
│   ├── performance/            # Performance tests (Artillery)
│   ├── helpers/                # Test utilities
│   ├── fixtures/               # Test data
│   └── config/                 # Test configuration
│
└── package.json                # Root monorepo config
```

---

## 🎯 Features Highlights

### Security
- ✅ JWT with refresh tokens (httpOnly cookies)
- ✅ Password hashing (bcrypt with 12 rounds)
- ✅ Rate limiting (auth endpoints)
- ✅ CSRF protection
- ✅ Input validation & sanitization
- ✅ XSS protection
- ✅ Security headers (Helmet)
- ✅ SQL injection prevention (Prisma)

### Best Practices
- ✅ Monorepo architecture
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- ✅ Logging (Winston)
- ✅ API documentation (Swagger)
- ✅ Code quality (ESLint, Prettier)
- ✅ **95%+ test coverage**
- ✅ CI/CD ready

### Testing Excellence
- ✅ **70+ automated tests**
- ✅ **5 test layers** (UI, API, DB, Contract, Performance)
- ✅ Page Object Model (POM)
- ✅ JSON Schema validation
- ✅ Allure reports with video & screenshots
- ✅ Test history & trends
- ✅ Flaky test detection

---

## 📊 Test Coverage

| Component | Coverage | Tests |
|-----------|----------|-------|
| **Backend** | 95%+ | 50+ unit & integration tests |
| **Frontend** | 90%+ | 30+ unit tests |
| **E2E** | Full | 40+ UI tests |
| **API** | 100% | 20+ API tests |
| **Database** | 100% | 15+ DB tests |
| **Performance** | - | 4 scenarios (Load, Stress, Spike, Endurance) |

---

## 🚢 Deployment

### Backend Deployment
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Serve dist/ folder with nginx/apache
```

### Environment Variables
See [backend/ENV_SETUP.md](backend/ENV_SETUP.md) for complete list.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

ISC License - See LICENSE file for details.

---

## 🎉 Summary

This is a **production-ready** full-stack application with:
- ✅ Complete authentication system
- ✅ RESTful API with Swagger docs
- ✅ Modern Vue 3 frontend
- ✅ **Enterprise-grade testing** (70+ tests, 5 layers)
- ✅ Security best practices
- ✅ Comprehensive documentation
- ✅ 95%+ test coverage

**Ready to use!** 🚀

---

## 🆘 Support

- **Backend Issues:** See [backend/README.md](backend/README.md)
- **Frontend Issues:** See [frontend/README.md](frontend/README.md)
- **Testing Issues:** See [test/README.md](test/README.md)

---

**Happy Coding!** 🎊
