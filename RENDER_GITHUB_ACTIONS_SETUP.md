# 🔄 Render + GitHub Actions Setup

How to setup automatic deployment to Render via GitHub Actions.

---

## 🎯 **How It Works:**

```
1. You push to GitHub (main branch)
   ↓
2. GitHub Actions triggers
   ↓
3. Runs tests ✅
   ↓
4. Runs Prisma migrations ✅
   ↓
5. Triggers Render deploy (via webhook) ✅
   ↓
6. Render rebuilds and deploys ✅
   ↓
7. Health check ✅
   ↓
8. Done! Backend is live! 🎉
```

---

## 🔧 **SETUP STEPS:**

### **Step 1: Get Render Deploy Hook** 🪝

**In Render Dashboard:**

1. Go to your **todo-app-backend** service
2. Click **Settings** (left menu)
3. Scroll down to **Deploy Hook**
4. Click "Copy" or create new hook
5. You'll get URL like:
   ```
   https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyy
   ```

**📋 COPY THIS URL!**

---

### **Step 2: Add GitHub Secrets** 🔐

**Go to GitHub:**
1. Your repository → **Settings**
2. **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

**Add these 5 secrets:**

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_z1x2VWfTusJF@...` | Neon Dashboard → Connect |
| `TEST_DATABASE_URL` | Create "test" branch in Neon | Neon → Branches → Create |
| `JWT_SECRET` | Your production JWT secret | From Render env vars |
| `JWT_REFRESH_SECRET` | Your production refresh secret | From Render env vars |
| `RENDER_DEPLOY_HOOK` | `https://api.render.com/deploy/srv-...` | Render → Settings → Deploy Hook |
| `BACKEND_URL` | `https://your-app.onrender.com` | Render service URL |

---

### **Step 3: Create Test Database Branch in Neon** 🗄️

**Important!** Tests need separate database:

**In Neon Dashboard:**
1. Click "Branches"
2. Click "Create Branch"
3. Name: `test`
4. Branch from: `production`
5. Click "Create"
6. Copy connection string
7. Add to GitHub as `TEST_DATABASE_URL`

---

### **Step 4: Test Workflow** 🧪

**Option A: Push a Change**
```bash
# Make small change
cd backend
echo "// Test change" >> README.md

# Commit and push
git add .
git commit -m "Test: Trigger GitHub Actions"
git push origin main
```

**Option B: Manual Trigger**
1. Go to GitHub → **Actions** tab
2. Select "🚀 Backend Deploy to Render"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

---

### **Step 5: Watch Deployment** 👀

**In GitHub:**
1. Go to **Actions** tab
2. Click on running workflow
3. Watch real-time logs

**Expected steps:**
```
✅ Checkout code
✅ Setup Node.js
✅ Install dependencies
✅ Generate Prisma Client
✅ Run backend tests
✅ Run database migrations
✅ Trigger Render deploy
✅ Wait for deployment
✅ Health check
✅ Deployment successful
```

**In Render:**
1. Go to your service
2. **Events** tab
3. You'll see "Deploy triggered by Deploy Hook"
4. Watch build logs

---

## 📊 **Workflow Details:**

### **What GitHub Actions Does:**

**Step 1-2:** Setup environment ✅  
**Step 3:** Install backend dependencies ✅  
**Step 4:** Generate Prisma client ✅  
**Step 5:** Run all backend tests ✅  
- If tests fail → **STOPS** here (no deploy!)

**Step 6:** Run Prisma migrations ✅  
- `npx prisma migrate deploy`
- Applies all pending migrations
- If migrations fail → **STOPS** (no deploy!)

**Step 7:** Trigger Render deploy ✅  
- Calls Deploy Hook webhook
- Render starts building

**Step 8-9:** Wait & Health Check ✅  
- Waits 30 seconds
- Checks `/api/health` endpoint
- Retries 5 times

---

## 🎯 **Why This is Better Than Just Render Auto-Deploy:**

### **Render Alone:**
```
Push → Render deploys → Done
❌ No tests
❌ No migration safety check
❌ Might deploy broken code
```

### **GitHub Actions + Render:**
```
Push → GitHub Actions:
  ✅ Runs tests first
  ✅ Runs migrations safely
  ✅ Then triggers Render
  ✅ Verifies deployment
  ✅ Won't deploy if tests fail!
```

**Much safer!** 🛡️

---

## 🔐 **Required GitHub Secrets:**

Verify you have all 6 secrets:

```bash
# Check in GitHub → Settings → Secrets → Actions
```

**Checklist:**
- [ ] `DATABASE_URL` (Neon production)
- [ ] `TEST_DATABASE_URL` (Neon test branch)
- [ ] `JWT_SECRET` (same as Render)
- [ ] `JWT_REFRESH_SECRET` (same as Render)
- [ ] `RENDER_DEPLOY_HOOK` (from Render settings)
- [ ] `BACKEND_URL` (your Render URL)

---

## 🐛 **Common Issues:**

### **Workflow doesn't trigger**
Check:
- You pushed to `main` or `master` branch
- Changed files in `backend/` folder
- Workflow file is in `.github/workflows/`

### **Tests fail**
Check:
- `TEST_DATABASE_URL` secret is set
- Test database exists (create branch in Neon)
- Tests pass locally: `cd backend && npm test`

### **Migrations fail**
Check:
- `DATABASE_URL` secret is correct (production DB)
- Neon database is accessible
- No pending migrations locally

### **Deploy hook fails**
Check:
- `RENDER_DEPLOY_HOOK` secret is correct
- Deploy hook is enabled in Render
- URL format is correct

### **Health check fails**
Check:
- `BACKEND_URL` secret is correct
- Render service is running
- `/api/health` endpoint works

---

## 📝 **Render Deploy Hook - How to Get:**

**In Render Dashboard:**

1. Click on your **todo-app-backend** service
2. Left menu → **Settings**
3. Scroll down to **Build & Deploy** section
4. Find **Deploy Hook**
5. If not created, click "Create Deploy Hook"
6. Copy the URL (looks like):
   ```
   https://api.render.com/deploy/srv-ct6abc123def?key=xyz789
   ```
7. Add to GitHub secrets as `RENDER_DEPLOY_HOOK`

---

## ✅ **Test the Workflow:**

### **Manual Test:**

1. Go to GitHub → **Actions** tab
2. Select "🚀 Backend Deploy to Render"
3. Click "Run workflow" dropdown
4. Select branch: `main`
5. Click green "Run workflow" button
6. Watch it run!

**Expected time:** 2-3 minutes

---

## 📊 **Workflow Status:**

After setup, every push to `main` with backend changes will:

```
✅ Auto-run tests
✅ Auto-run migrations
✅ Auto-deploy to Render
✅ Auto-verify deployment
```

**No manual work needed!** 🎉

---

## 🎯 **Next: Setup Frontend Workflow**

After backend workflow works:
- Deploy frontend to Vercel
- Setup frontend GitHub Actions
- Auto-deploy frontend on push

---

## 💬 **Current Status:**

**What you have:**
- ✅ Backend deployed on Render (manually)
- ✅ GitHub Actions workflow created
- ⏳ Need to add GitHub secrets
- ⏳ Need to test workflow

**What you need:**
1. Get Render Deploy Hook
2. Create Test database in Neon
3. Add 6 GitHub secrets
4. Test workflow (manual trigger or push)

---

**Ready to add secrets?** I can help you! 😊

