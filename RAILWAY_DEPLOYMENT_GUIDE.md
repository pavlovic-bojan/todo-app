# 🚂 Railway Deployment Guide - Backend

Complete step-by-step guide to deploy backend on Railway.

---

## 🎯 **What is Railway?**

Railway is a modern platform for deploying Node.js apps with:
- ✅ **Free tier** - $5 credit/month
- ✅ **Auto-deploy** from GitHub
- ✅ **Easy setup** - 5 minutes
- ✅ **Great for Node.js** - Built for it

---

## 🚀 **DEPLOYMENT STEPS:**

### **Step 1: Create Railway Account**

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign up with **GitHub** (easier integration)

---

### **Step 2: Create New Project**

1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your **todo-app** repository
4. Railway will detect it's a monorepo

---

### **Step 3: Configure Backend Service**

**3.1. Set Root Directory:**
- Click on the deployment
- Go to **Settings** → **Service Settings**
- Set **Root Directory:** `backend`
- Set **Start Command:** `npm start`

**3.2. Set Build Command (if needed):**
- **Build Command:** `npm install && npm run prisma:generate`

---

### **Step 4: Add Environment Variables** 🔐

**In Railway dashboard, go to Variables tab and add:**

```env
DATABASE_URL=postgresql://neondb_owner:npg_z1x2VWfTusJF@ep-odd-shadow-ahpy098j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=your-production-jwt-secret-min-32-characters-strong-random-string
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-characters-different-string

NODE_ENV=production

FRONTEND_URL=https://your-frontend.vercel.app

PORT=3000
```

**Important:**
- ✅ Use YOUR Neon connection string
- ✅ Generate STRONG JWT secrets (32+ chars)
- ✅ Update FRONTEND_URL after deploying frontend

---

### **Step 5: Generate Domain** 🌐

**Railway will auto-generate a domain:**
- Example: `todo-app-production.up.railway.app`

**Or add custom domain:**
- Go to **Settings** → **Networking** → **Custom Domain**
- Add your domain (e.g., `api.yourdomain.com`)

---

### **Step 6: Deploy!** 🚀

**Railway auto-deploys on every push to main!**

**Or manually trigger:**
- Click "Deploy" button in Railway dashboard

**Watch logs:**
- Go to **Deployments** tab
- Click on active deployment
- See real-time logs

---

### **Step 7: Run Migrations** 🔄

**First deployment needs migrations:**

**Option A: Via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway run npx prisma migrate deploy
```

**Option B: Via GitHub Actions**
- GitHub Actions workflow runs migrations automatically!
- See `.github/workflows/backend-deploy.yml`

**Option C: Manually in Railway console**
- Go to deployment
- Click "Open Shell"
- Run: `npx prisma migrate deploy`

---

### **Step 8: Verify Deployment** ✅

**Test health endpoint:**
```bash
curl https://your-app.railway.app/api/health
```

**Expected:**
```json
{"status":"OK","message":"Todo API is running","timestamp":"..."}
```

**Test Swagger docs:**
- Visit: `https://your-app.railway.app/api-docs`

---

## 🔗 **GET RAILWAY TOKEN for GitHub Actions:**

1. Go to Railway Dashboard
2. Click on your **Profile** (bottom left)
3. Go to **Account Settings** → **Tokens**
4. Click "Create Token"
5. Name it: `GitHub Actions`
6. Copy the token
7. Add to GitHub Secrets as `RAILWAY_TOKEN`

---

## 📊 **Railway Configuration:**

### **Recommended Settings:**

**Resources:**
- **Memory:** 512 MB (enough for Node.js)
- **CPU:** Shared (free tier)
- **Regions:** US East (closest to Neon)

**Auto-Scaling:**
- **Min instances:** 1
- **Max instances:** 1 (free tier)

**Health Check:**
- **Path:** `/api/health`
- **Interval:** 60 seconds

---

## 🔄 **AUTO-DEPLOY WORKFLOW:**

### **When you push to GitHub:**

```
1. git push origin main
   ↓
2. GitHub Actions triggers
   ↓
3. Runs backend tests ✅
   ↓
4. Runs Prisma migrations ✅
   ↓
5. Deploys to Railway ✅
   ↓
6. Health check ✅
   ↓
7. Backend is live! 🎉
```

---

## 🎯 **MIGRATION HANDLING:**

### **Automatic (Recommended):**

GitHub Actions automatically runs:
```bash
npx prisma migrate deploy
```

**Before every deployment!**

This ensures:
- ✅ Database is always up-to-date
- ✅ No manual steps
- ✅ Safe (only applies pending migrations)
- ✅ Idempotent (safe to run multiple times)

### **Manual (If Needed):**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run npx prisma migrate deploy
```

---

## 🐛 **Common Issues:**

### **Build fails**
Check Railway logs:
- Go to deployment
- Click "View Logs"
- Look for errors

**Common fixes:**
```bash
# Make sure package.json has start script
"scripts": {
  "start": "node index.js"  # ✅
}
```

### **Migration fails**
- Check DATABASE_URL is correct
- Make sure Neon database is accessible
- Try running migration manually

### **Health check fails**
- Check PORT is set to 3000
- Check health endpoint exists at `/api/health`
- Check server starts successfully

---

## 💰 **Cost:**

### **Free Tier:**
- **$5 credit/month**
- **~500 hours** of runtime
- **Good for:** Development, small apps, personal projects

**Your app should use:** ~$0.50-2/month (well within free tier!)

### **If you exceed:**
- Add credit card for $5/month
- Or upgrade to Hobby plan ($5/month)

---

## 📈 **Monitoring:**

**Railway provides:**
- ✅ Real-time logs
- ✅ CPU/Memory usage
- ✅ Request metrics
- ✅ Deployment history

**Access:**
- Go to Railway dashboard
- Click on service
- View **Metrics** tab

---

## 🔗 **URLs After Deployment:**

```
Backend API: https://todo-app-production.up.railway.app/api
Swagger Docs: https://todo-app-production.up.railway.app/api-docs
Health Check: https://todo-app-production.up.railway.app/api/health
```

**Update these in:**
- Frontend environment variables (`VITE_API_URL`)
- GitHub secrets (`BACKEND_URL`)

---

## ✅ **CHECKLIST:**

Setup Railway:
- [ ] Create Railway account
- [ ] Create new project from GitHub
- [ ] Configure root directory: `backend`
- [ ] Add environment variables (5 variables)
- [ ] Get Railway token
- [ ] Add token to GitHub secrets
- [ ] Push to main → auto-deploy!

Verify:
- [ ] Backend deployed successfully
- [ ] Health endpoint works
- [ ] Swagger docs accessible
- [ ] Can register user
- [ ] Data saved to Neon PostgreSQL

---

## 🎉 **YOU'RE DONE!**

**Your backend will be:**
- ✅ Deployed on Railway
- ✅ Connected to Neon PostgreSQL
- ✅ Auto-deploys on every push
- ✅ Auto-migrates database
- ✅ Production-ready!

---

**Ready to setup Railway?** Follow steps above! 🚀

