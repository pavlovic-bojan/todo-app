# 🔄 GitHub Actions Setup Guide

Complete guide to setup CI/CD pipelines with GitHub Actions.

---

## 📋 **What You Get:**

3 automated workflows:
1. ✅ **Backend Deploy** - Auto-deploy backend to Render (includes auto-migrations)
2. ✅ **Frontend Deploy** - Auto-deploy frontend to Vercel
3. ✅ **Automated Tests** - Run tests on every push/PR

---

## 🚀 **SETUP STEPS:**

### **Step 1: Push to GitHub** 📤

**If you haven't already:**

```bash
cd todo-app
git init
git add .
git commit -m "Initial commit - Full-stack Todo app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/todo-app.git
git push -u origin main
```

---

### **Step 2: Setup Railway for Backend** 🚂

**2.1. Go to Railway:**
- Visit: https://railway.app
- Click "Start a New Project"
- Choose "Deploy from GitHub repo"
- Select your `todo-app` repository

**2.2. Configure Backend Service:**
- Root directory: `/backend`
- Build command: `npm install && npm run prisma:generate`
- Start command: `npm start`

**2.3. Add PostgreSQL (Neon):**
- Click "New" → "Variable"
- Add your Neon DATABASE_URL:
  ```
  DATABASE_URL=postgresql://neondb_owner:npg_z1x2VWfTusJF@ep-odd-shadow-ahpy098j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

**2.4. Add other environment variables:**
```
JWT_SECRET=your-production-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3000
```

**2.5. Get Railway Token:**
- Go to Railway **Settings** → **Tokens**
- Click "Create Token"
- Copy the token (you'll need it for GitHub secrets)

---

### **Step 3: Setup Vercel for Frontend** ▲

**3.1. Go to Vercel:**
- Visit: https://vercel.com
- Click "Add New" → "Project"
- Import your `todo-app` repository

**3.2. Configure Frontend:**
- Framework: **Vue.js**
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

**3.3. Add environment variable:**
```
VITE_API_URL=https://your-backend.railway.app
```

**3.4. Get Vercel Token:**
- Go to **Settings** → **Tokens**
- Create new token
- Copy it (for GitHub secrets)

**3.5. Get Vercel Project IDs:**
- Go to **Settings** → **General**
- Copy:
  - **Project ID**
  - **Team ID** (Org ID)

---

### **Step 4: Add GitHub Secrets** 🔐

**Go to your GitHub repository:**
- Click **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**

**Add these secrets:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_z1x2VWfTusJF@...` | Neon production DB |
| `TEST_DATABASE_URL` | Create separate Neon branch for tests | Test database |
| `JWT_SECRET` | Your production JWT secret | JWT signing key |
| `JWT_REFRESH_SECRET` | Your production refresh secret | Refresh token key |
| `RAILWAY_TOKEN` | From Railway Settings | Railway deployment |
| `BACKEND_URL` | `https://your-app.railway.app` | Deployed backend URL |
| `VERCEL_TOKEN` | From Vercel Settings | Vercel deployment |
| `VERCEL_ORG_ID` | From Vercel project settings | Vercel team ID |
| `VERCEL_PROJECT_ID` | From Vercel project settings | Vercel project ID |

---

### **Step 5: Create Test Database in Neon** 🗄️

**For automated tests, create a separate database branch:**

**In Neon Dashboard:**
1. Click "Branches" → "Create Branch"
2. Name: `test`
3. Copy the connection string
4. Add to GitHub secrets as `TEST_DATABASE_URL`

**Why:** Keep test data separate from production!

---

## 🔄 **HOW IT WORKS:**

### **Workflow 1: Backend Deploy** 🚀

**Triggers:** When you push to `main` branch (backend changes)

**What it does:**
```
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Run backend tests (Jest)
4. ✅ Run Prisma migrations (prisma migrate deploy)
5. ✅ Deploy to Railway
6. ✅ Health check
7. ✅ Notify success
```

**Migration:** Automatically runs `prisma migrate deploy` **BEFORE** deploying!

---

### **Workflow 2: Frontend Deploy** 🎨

**Triggers:** When you push to `main` branch (frontend changes)

**What it does:**
```
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Run frontend tests (Vitest)
4. ✅ Build production bundle
5. ✅ Deploy to Vercel
6. ✅ Notify success
```

---

### **Workflow 3: Tests** 🧪

**Triggers:** Every push and PR

**What it does:**
```
1. ✅ Run backend tests
2. ✅ Run frontend tests
3. ✅ Start services
4. ✅ Run E2E smoke tests
5. ✅ Generate Allure report
6. ✅ Upload artifacts (screenshots, videos)
```

**Does NOT deploy** - just validates code!

---

### **Workflow 4: Database Migrations** 🔄

**Triggers:** Manual only (workflow_dispatch)

**What it does:**
```
1. ✅ Check pending migrations
2. ✅ Apply migrations
3. ✅ Verify schema
4. ✅ Show status
```

**Use case:** When you add new Prisma schema changes and want to apply them separately.

---

## 📊 **DEPLOYMENT FLOW:**

### **Scenario 1: Change Backend Code**

```
1. You: git push origin main
2. GitHub Actions triggers "Backend Deploy"
3. Runs tests ✅
4. Runs migrations ✅
5. Deploys to Railway ✅
6. Health check ✅
7. Done! Backend is live! 🚀
```

### **Scenario 2: Change Frontend Code**

```
1. You: git push origin main
2. GitHub Actions triggers "Frontend Deploy"
3. Runs tests ✅
4. Builds production bundle ✅
5. Deploys to Vercel ✅
6. Done! Frontend is live! 🎨
```

### **Scenario 3: Change Prisma Schema**

```
1. You: Update schema.prisma
2. You: Create migration locally (npm run prisma:migrate)
3. You: git push origin main
4. GitHub Actions:
   - Runs tests
   - Runs "prisma migrate deploy" ✅ (AUTO!)
   - Deploys backend
5. Done! Schema updated + Backend deployed! 🔄
```

---

## ⚡ **QUICK DEPLOYMENT CHECKLIST:**

### **Before First Deploy:**

- [ ] Create Railway account & project
- [ ] Create Vercel account & project
- [ ] Create test database branch in Neon
- [ ] Add all GitHub secrets (9 secrets)
- [ ] Push code to GitHub
- [ ] Manually trigger first deploy (or push to main)

### **After Setup:**

- [ ] Every push to `main` auto-deploys!
- [ ] Every PR runs tests automatically
- [ ] Migrations run automatically before deploy
- [ ] Allure reports generated for every test run

---

## 🎯 **MIGRATION STRATEGY:**

### **Development (Local):**
```bash
npm run prisma:migrate  # Creates new migration
```

### **CI/CD (Automatic):**
```bash
npx prisma migrate deploy  # Applies existing migrations
```

**GitHub Actions uses `migrate deploy`:**
- ✅ Applies all pending migrations
- ✅ No interactive prompts
- ✅ Safe for production
- ✅ Idempotent (can run multiple times)

---

## 🔐 **SECURITY NOTES:**

### **Secrets Management:**
✅ All secrets stored in GitHub (encrypted)  
✅ Never committed to repository  
✅ Different secrets for test vs production  
✅ JWT secrets are strong (32+ chars)  

### **Database Access:**
✅ Neon PostgreSQL (managed)  
✅ SSL required  
✅ Separate test database  
✅ Connection pooling enabled  

---

## 📚 **FILES CREATED:**

```
.github/workflows/
├── backend-deploy-render.yml # Auto-deploy backend to Render (includes migrations)
├── frontend-deploy.yml       # Auto-deploy frontend to Vercel
└── tests.yml                 # Run all tests on PR/push
```

---

## 🎉 **BENEFITS:**

### **Before (Manual):**
- ❌ Manual deployment
- ❌ Manual migrations
- ❌ Manual testing
- ❌ Risk of forgot to migrate
- ❌ Inconsistent process

### **After (Automated):**
- ✅ **Auto-deploy on push**
- ✅ **Auto-migrate before deploy**
- ✅ **Auto-test on PR**
- ✅ **Never forget migrations**
- ✅ **Consistent & safe**

---

## 🚀 **NEXT STEPS:**

**To activate CI/CD:**

1. **Setup Railway** (5 min)
   - Create project
   - Link GitHub repo
   - Get Railway token

2. **Setup Vercel** (3 min)
   - Create project
   - Link GitHub repo
   - Get Vercel token & IDs

3. **Add GitHub Secrets** (5 min)
   - Add 9 secrets listed above

4. **Push to GitHub** (1 min)
   - `git push origin main`

5. **Watch magic happen!** ✨
   - Go to GitHub → Actions tab
   - Watch workflows run automatically!

**Total setup time:** ~15 minutes

---

## 📖 **DOCUMENTATION:**

- **This file:** Complete GitHub Actions setup
- **Railway setup:** Next steps below
- **Vercel setup:** Next steps below
- **Existing:** `test/CI_CD_INTEGRATION.md` (detailed examples)

---

## 💬 **READY TO SETUP?**

I can help you with:

**A)** Setup Railway step-by-step  
**B)** Setup Vercel step-by-step  
**C)** Add GitHub secrets  
**D)** Test workflows  
**E)** All of the above!  

**What's next?** 😊

