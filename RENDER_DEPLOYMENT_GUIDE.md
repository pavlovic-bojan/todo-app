# 🌐 Render Deployment Guide - Backend

Complete guide to deploy backend on Render.

---

## 🎯 **What is Render?**

Render is a modern cloud platform:
- ✅ **Free tier** - 750 hours/month
- ✅ **Auto-deploy** from GitHub
- ✅ **Easy setup** - 10 minutes
- ✅ **PostgreSQL addon** available

---

## 🚀 **BACKEND DEPLOYMENT:**

### **Step 1: Create Render Account**

1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with **GitHub** (easiest)

---

### **Step 2: Create New Web Service**

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select **todo-app** repository
4. Render detects it's a monorepo

---

### **Step 3: Configure Backend Service**

**3.1. Basic Settings:**
- **Name:** `todo-app-backend` (or your choice)
- **Region:** Oregon (or closest to you)
- **Branch:** `main`
- **Root Directory:** `backend` ← **IMPORTANT!**
- **Runtime:** Node
- **Build Command:** `npm install && npm run prisma:generate`
- **Start Command:** `npm start`

**3.2. Instance Type:**
- **Plan:** Free (750 hours/month)

**3.3. Advanced:**
- **Health Check Path:** `/api/health`
- **Auto-Deploy:** Yes

---

### **Step 4: Add Environment Variables** 🔐

**Click "Add Environment Variable" and add:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_z1x2VWfTusJF@ep-odd-shadow-ahpy098j-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Generate strong 32+ char string |
| `JWT_REFRESH_SECRET` | Generate different strong 32+ char string |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` (update later) |
| `PORT` | `3000` |

**Generate secrets:**
```bash
# In PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

### **Step 5: Deploy!** 🚀

1. Click "Create Web Service"
2. Render will start building
3. Watch build logs (should take 2-3 minutes)

**Expected:**
```
==> Downloading Node runtime
==> Installing dependencies
==> Generating Prisma Client
==> Starting server
✅ Deployed successfully!
```

**You'll get URL:** `https://todo-app-backend.onrender.com`

---

### **Step 6: Run Migrations** 🔄

**IMPORTANT!** First deployment needs migrations:

**Option A: Via Render Shell** (easiest)
1. Go to your service dashboard
2. Click "Shell" tab (top right)
3. Run:
```bash
npx prisma migrate deploy
```

**Option B: Via Local with Production DB**
```bash
# In your local backend folder
DATABASE_URL="postgresql://neondb_owner:..." npx prisma migrate deploy
```

**Option C: Automatic (GitHub Actions)**
- GitHub Actions will run migrations automatically on future deploys

---

### **Step 7: Verify Deployment** ✅

**Test health endpoint:**
```bash
curl https://todo-app-backend.onrender.com/api/health
```

**Expected:**
```json
{"status":"OK","message":"Todo API is running","timestamp":"..."}
```

**Test Swagger:**
Visit: `https://todo-app-backend.onrender.com/api-docs`

---

## ⚠️ **RENDER FREE TIER LIMITATIONS:**

### **What You Get:**
- ✅ 750 hours/month (enough for 1 app always-on)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ Auto-sleep after 15 min inactivity

### **Limitations:**
- ⚠️ **Spins down after 15 min** of no requests
- ⚠️ **Cold start** ~30 seconds when waking up
- ⚠️ **Slower** than paid tier

**For development:** Perfect! ✅  
**For production with traffic:** Consider paid ($7/month)

---

## 🔄 **AUTO-DEPLOY WORKFLOW:**

**After initial setup:**

```
1. Make code changes
   ↓
2. git push origin main
   ↓
3. Render auto-detects push
   ↓
4. Builds and deploys automatically!
```

**GitHub Actions can also trigger Render deploy** via webhook.

---

## 📊 **Render vs Railway Comparison:**

| Feature | Render | Railway |
|---------|--------|---------|
| **Free Tier** | 750 hrs/month | $5 credit/month |
| **Auto-sleep** | Yes (15 min) | No |
| **Cold Start** | ~30 seconds | Instant |
| **Best For** | Development | Production |

**For your use case:**
- **Render:** Good for testing deployment
- **Railway:** Better for always-on production

---

## 🐛 **Common Issues:**

### **Build Fails - Can't Find Prisma**
Make sure build command includes:
```bash
npm install && npm run prisma:generate
```

### **Health Check Fails**
- Check `PORT` environment variable is set to 3000
- Check `/api/health` endpoint exists

### **Database Connection Error**
- Verify `DATABASE_URL` is correct
- Check Neon database is accessible (not paused)

### **Service Spins Down**
- Expected on free tier
- Upgrade to $7/month plan for always-on

---

## 💡 **PRO TIPS:**

### **Keep Service Warm:**
Use a free uptime monitor:
- **UptimeRobot** - Pings every 5 minutes
- **Cron-job.org** - Scheduled requests
- Prevents cold starts!

### **Monitoring:**
Render provides:
- Real-time logs
- Metrics dashboard
- Deploy history

### **Custom Domain:**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS (CNAME)
4. Free SSL certificate!

---

## ✅ **Deployment Checklist:**

Backend on Render:
- [ ] Create Render account
- [ ] Create Web Service from GitHub
- [ ] Configure root directory: `backend`
- [ ] Set build command: `npm install && npm run prisma:generate`
- [ ] Set start command: `npm start`
- [ ] Add 6 environment variables
- [ ] Deploy!
- [ ] Run migrations via Shell
- [ ] Test health endpoint
- [ ] Test API registration

---

## 🎊 **After Deployment:**

Your backend will be live at:
```
https://todo-app-backend.onrender.com/api
```

**Update:**
- Frontend environment variables (`VITE_API_URL`)
- GitHub secrets (`BACKEND_URL`)

---

## 📞 **Need Help?**

**Common commands in Render Shell:**
```bash
# Check Prisma status
npx prisma migrate status

# Run migrations
npx prisma migrate deploy

# View Prisma studio (won't work - no GUI)
# Use Neon dashboard instead

# Check logs
pm2 logs
```

---

## 🚀 **Next: Deploy Frontend**

After backend is deployed:
1. Deploy frontend to Vercel ([`VERCEL_DEPLOYMENT_GUIDE.md`](VERCEL_DEPLOYMENT_GUIDE.md))
2. Update `FRONTEND_URL` in Render
3. Setup GitHub Actions ([`GITHUB_ACTIONS_SETUP.md`](GITHUB_ACTIONS_SETUP.md))

---

**Ready to deploy on Render!** 🌐

