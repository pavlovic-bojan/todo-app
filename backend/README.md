# 🔧 Backend API - Todo Application

Node.js + Express + Prisma ORM + SQLite backend with comprehensive authentication and testing.

---

## ✨ Features

- ✅ **User Authentication** - Register, Login, Logout, Password Reset
- ✅ **JWT Tokens** - Access & Refresh tokens with httpOnly cookies
- ✅ **Role-Based Access** - Admin & Client roles
- ✅ **Todo CRUD** - Complete todo management
- ✅ **Security** - Helmet, Rate Limiting, CSRF, Input Validation
- ✅ **API Documentation** - Swagger UI
- ✅ **Logging** - Winston with file rotation
- ✅ **Testing** - 50+ unit & integration tests (95%+ coverage)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- npm v9+

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Server runs on: http://localhost:3000

---

## 📚 API Documentation

Once server is running, visit:
- **Swagger UI:** https://todo-app-xhn2.onrender.com/api/docs/
- **API Base:** https://todo-app-xhn2.onrender.com/api/

---

## 🔐 Environment Setup

Create `.env` file in `backend/` folder:

```env
# Database
DATABASE_URL="your-db-url"

# JWT Secrets (change in production!)
JWT_SECRET="your-very-secret-jwt-key-here-change-in-production"
JWT_REFRESH_SECRET="your-very-secret-refresh-key-here-change-in-production"

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=https://todo-app-frontend-seven-rho.vercel.app
```

**Important:** Change JWT secrets in production!

---

## 📡 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `POST /api/users/refresh` - Refresh access token
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token

### Users (Protected)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Todos (Protected)
- `GET /api/todos` - Get all todos for logged-in user
- `GET /api/todos/:id` - Get todo by ID
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete todo

---

## 🧪 Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Coverage
- **Overall:** 95%+
- **Services:** 98%
- **Controllers:** 95%
- **Middleware:** 100%
- **Validations:** 100%

---

## 🗄️ Database Schema

```prisma
model User {
  id                    Int       @id @default(autoincrement())
  username              String    @unique
  email                 String    @unique
  hashedPassword        String
  role                  String    @default("client")
  age                   Int?
  hashedResetToken      String?
  resetTokenExpiry      DateTime?
  refreshToken          String?
  refreshTokenExpiry    DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  todos                 Todo[]
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── UserController.js
│   │   │   └── TodoController.js
│   │   ├── services/             # Business logic
│   │   │   ├── UserService.js
│   │   │   └── TodoService.js
│   │   ├── middleware/           # Middlewares
│   │   │   ├── AuthenticateAndAuthorize.js
│   │   │   ├── ErrorHandler.js
│   │   │   └── ValidationMiddleware.js
│   │   ├── routes/               # API routes
│   │   │   ├── UserRoute.js
│   │   │   ├── TodoRoute.js
│   │   │   └── index.js
│   │   └── validations/          # Custom validation
│   │       └── Validation.js
│   ├── config/                   # Configuration
│   │   ├── db.js                 # Prisma client
│   │   ├── logger.js             # Winston logger
│   │   ├── security.js           # Security middleware
│   │   ├── SwaggerConfig.js      # Swagger setup
│   │   └── StartServer.js        # Server startup
│   └── __tests__/                # Tests
│       ├── unit/                 # Unit tests
│       └── integration/          # Integration tests
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── logs/                         # Log files
├── index.js                      # Entry point
├── package.json
└── .env                          # Environment variables
```

---

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with 12 rounds
- ✅ **JWT Authentication** - Access + Refresh tokens
- ✅ **httpOnly Cookies** - Refresh token storage
- ✅ **Rate Limiting** - 5 attempts for auth, 100 for general API
- ✅ **CSRF Protection** - csurf middleware
- ✅ **Input Validation** - express-validator
- ✅ **SQL Injection Prevention** - Prisma ORM
- ✅ **XSS Protection** - Input sanitization
- ✅ **Security Headers** - Helmet
- ✅ **CORS** - Configured for frontend

---

## 📊 Available Scripts

```bash
npm run dev              # Start development server (nodemon)
npm start                # Start production server
npm test                 # Run tests with coverage
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
```

---

## 🐛 Common Issues

### Database Migration Fails
```bash
# Delete database and re-migrate
rm prisma/dev.db
npm run prisma:migrate
```

### JWT_SECRET Not Found
```bash
# Make sure .env file exists in backend/ folder
# Check that JWT_SECRET and JWT_REFRESH_SECRET are set
```

### Port 3000 Already in Use
```bash
# Change PORT in .env file
# Or kill process on port 3000
```

---

## 📖 Additional Documentation

- **[ENV_SETUP.md](ENV_SETUP.md)** - Complete environment variable guide
- **[Swagger API Docs](https://todo-app-xhn2.onrender.com/api/docs/)** - Interactive API documentation

---

## 🧪 Testing Examples

### Unit Test Example
```javascript
describe('UserService', () => {
  it('should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123456'
    }
    const user = await UserService.registerUser(userData)
    expect(user.username).toBe('testuser')
  })
})
```

### Integration Test Example
```javascript
describe('POST /api/users/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ username: 'testuser', password: 'Test123456' })
    expect(response.status).toBe(200)
    expect(response.body.accessToken).toBeDefined()
  })
})
```

---

## 🎉 Summary

Production-ready backend with:
- ✅ Complete authentication system
- ✅ RESTful API with Swagger
- ✅ Security best practices
- ✅ 95%+ test coverage
- ✅ Comprehensive error handling
- ✅ Logging & monitoring

**Ready to deploy!** 🚀

---

**Need help?** Check Swagger docs at https://todo-app-xhn2.onrender.com/api/docs/
