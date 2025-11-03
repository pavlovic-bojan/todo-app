# 🚀 Getting Started - Todo App

Complete step-by-step guide to get the application running.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ **Node.js** v18.0.0 or higher
- ✅ **npm** v9.0.0 or higher
- ✅ **Git** (optional)

**Check versions:**
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

---

## 🎯 Step-by-Step Setup

### **Step 1: Clone/Navigate to Project**

```bash
cd todo-app
```

---

### **Step 2: Install Dependencies**

**Option A: Install all at once (from root)**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../test && npm install
```

**Option B: Install per workspace**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Test
cd test
npm install
npm run install:browsers  # Install Playwright browsers
```

---

### **Step 3: Setup Backend**

**3.1. Create Environment File**

Create `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-characters-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**3.2. Initialize Database**

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

---

### **Step 4: Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server started on port 3000
📊 Swagger documentation: http://localhost:3000/api-docs
✅ Database connected
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.11  ready in 500 ms
➜  Local:   http://localhost:5173/
```

---

### **Step 5: Verify Setup**

**5.1. Check Backend**
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"status":"ok"}`

**5.2. Check Frontend**

Open browser: http://localhost:5173

**Expected:** Login page loads

**5.3. Check Swagger**

Open: http://localhost:3000/api-docs

**Expected:** Swagger UI with API documentation

---

### **Step 6: Create First User**

**Option A: Via UI**
1. Go to http://localhost:5173/register
2. Fill in:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `Admin123456`
   - Role: `admin`
3. Click "Register"
4. Login at http://localhost:5173/login

**Option B: Via API**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "Admin123456",
    "role": "admin"
  }'
```

---

### **Step 7: Run Tests (Optional)**

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

**QA Framework (E2E, API, DB):**
```bash
cd test

# Create test user first (see Step 6)
# Username: testuser
# Password: Test123456

# Run smoke tests
npm run test:smoke

# Generate Allure report
npm run report
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] Swagger docs accessible at http://localhost:3000/api-docs
- [ ] Database file created at `backend/dev.db`
- [ ] Can register new user
- [ ] Can login
- [ ] Can create todos
- [ ] Tests passing (optional)

---

## 🎯 Common Commands

### Development
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# View database (Prisma Studio)
cd backend && npm run prisma:studio
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
cd test && npm run test:smoke
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && NODE_ENV=production npm start
```

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "DATABASE_URL not found"
Make sure `.env` file exists in `backend/` folder (not root!).

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Backend starts but API doesn't work
Check that Prisma client is generated:
```bash
cd backend
npm run prisma:generate
```

### CORS errors
Make sure `FRONTEND_URL` in backend `.env` matches frontend URL:
```env
FRONTEND_URL=http://localhost:5173
```

---

## 📚 Next Steps

1. **Explore the App**
   - Register and login
   - Create some todos
   - Try password reset flow

2. **Read Documentation**
   - [Backend README](backend/README.md)
   - [Frontend README](frontend/README.md)
   - [Test README](test/README.md)

3. **Run Tests**
   - Backend: `cd backend && npm test`
   - Frontend: `cd frontend && npm test`
   - E2E: `cd test && npm run test:smoke`

4. **Explore Swagger**
   - http://localhost:3000/api-docs
   - Try API endpoints

5. **View Test Reports**
   - `cd test && npm run report`
   - See Allure report with videos & screenshots

---

## 🎯 Development Workflow

```bash
# 1. Start services (keep running in background)
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2

# 2. Make changes to code

# 3. Test changes
cd backend && npm test        # If backend changed
cd frontend && npm test       # If frontend changed
cd test && npm run test:smoke # Full E2E verification

# 4. View Swagger docs for API changes
# http://localhost:3000/api-docs

# 5. Generate test report
cd test && npm run report
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `PROJECT_SUMMARY.md` | This file - complete summary |
| `backend/README.md` | Backend documentation |
| `backend/ENV_SETUP.md` | Environment variables guide |
| `frontend/README.md` | Frontend documentation |
| `test/README.md` | Testing framework guide |
| `test/QUICK_START.md` | 5-minute testing guide |

---

## 🎉 You're Ready!

Once all steps are complete:

✅ Backend running  
✅ Frontend running  
✅ Database setup  
✅ User created  
✅ Tests passing  

**Start building!** 🚀

---

## 🆘 Need Help?

- **General:** See [README.md](README.md)
- **Backend:** See [backend/README.md](backend/README.md)
- **Frontend:** See [frontend/README.md](frontend/README.md)
- **Testing:** See [test/README.md](test/README.md)
- **Setup Issues:** See [test/SETUP_GUIDE.md](test/SETUP_GUIDE.md)

---

**Happy Coding!** 🎊
