# ▲ Vercel Deployment Guide - Frontend

Complete step-by-step guide to deploy Vue 3 frontend on Vercel.

---

## 🎯 **What is Vercel?**

Vercel is the best platform for frontend deployment:
- ✅ **Free tier** - Generous limits
- ✅ **Auto-deploy** from GitHub
- ✅ **CDN** - Global edge network
- ✅ **Perfect for Vue** - Optimized for Vite

---

## 🚀 **DEPLOYMENT STEPS:**

### **Step 1: Create Vercel Account**

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Sign up with **GitHub** (easiest)

---

### **Step 2: Import Project**

1. Click "Add New" → "Project"
2. Select your **todo-app** repository
3. Vercel will detect it's a monorepo

---

### **Step 3: Configure Frontend**

**3.1. Framework Settings:**
- **Framework Preset:** Vue.js (auto-detected)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**3.2. Node.js Version:**
- **Node Version:** 18.x (or 20.x)

---

### **Step 4: Add Environment Variables** 🔐

**In Vercel project settings:**

Go to **Settings** → **Environment Variables**

**Add:**

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | Production |
| `VITE_API_URL` | `http://localhost:3000/api` | Development |
| `VITE_API_URL` | `https://preview-backend.onrender.com/api` | Preview (optional) |

**Important:**
- ✅ Use `/api` at the end: `https://your-backend.railway.app/api`
- ✅ No trailing slash
- ✅ HTTPS for production

---

### **Step 5: Deploy!** 🎨

**Vercel auto-deploys!**

Click **"Deploy"** button.

**Watch build logs:**
- See real-time Vite build process
- Should complete in ~1-2 minutes

**You'll get:**
- **Production URL:** `https://todo-app-xyz.vercel.app`
- **Auto-generated domain**

---

### **Step 6: Update Backend CORS** 🔗

**Important!** Update backend to allow Vercel domain:

**In Render Dashboard → Environment Variables:**

```env
FRONTEND_URL=https://todo-app-xyz.vercel.app
```

**Without trailing slash!**

**Then redeploy backend** (Render → Manual Deploy or push to GitHub).

---

### **Step 7: Verify Deployment** ✅

**Test frontend:**
1. Visit: `https://todo-app-xyz.vercel.app`
2. Should see login page
3. Try to register
4. If CORS error → check backend FRONTEND_URL

**Test full flow:**
1. Register user
2. Login
3. Create todo
4. All should work! 🎉

---

## 🔗 **Get Vercel Tokens for GitHub Actions:**

### **Vercel Token:**
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `GitHub Actions`
4. Scope: Full Account
5. Copy token
6. Add to GitHub secrets as `VERCEL_TOKEN`

### **Vercel Org ID & Project ID:**
1. Go to your project **Settings** → **General**
2. Scroll down to **Project ID**
3. Copy **Project ID** → Add as `VERCEL_PROJECT_ID`
4. Copy **Team ID** (or Org ID) → Add as `VERCEL_ORG_ID`

---

## 📊 **Vercel Configuration:**

### **Build Settings:**
```
Framework: Vue.js
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

### **Environment Variables:**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

**Note:** Vite requires `VITE_` prefix for environment variables!

---

## 🔄 **AUTO-DEPLOY WORKFLOW:**

### **When you push to GitHub:**

```
1. git push origin main
   ↓
2. GitHub Actions triggers
   ↓
3. Runs frontend tests (Vitest) ✅
   ↓
4. Builds production bundle ✅
   ↓
5. Deploys to Vercel ✅
   ↓
6. Frontend is live! 🎨
```

### **Preview Deployments:**

Every **Pull Request** gets its own preview URL!

```
1. Create PR on GitHub
   ↓
2. Vercel auto-creates preview
   ↓
3. You get: https://todo-app-git-feature-username.vercel.app
   ↓
4. Test changes before merging!
```

**Amazing for testing!** 🎯

---

## 🎨 **Frontend Optimizations:**

Vercel automatically:
- ✅ **Compresses** assets (gzip, brotli)
- ✅ **Caches** static files
- ✅ **CDN** - Serves from nearest edge
- ✅ **HTTPS** - Free SSL certificate
- ✅ **Image optimization** - Automatic

---

## 🌐 **Custom Domain (Optional):**

**Add your own domain:**

1. Go to project **Settings** → **Domains**
2. Click "Add Domain"
3. Enter: `todo.yourdomain.com`
4. Follow DNS setup instructions
5. Vercel auto-provisions SSL! ✅

---

## 📊 **Performance:**

### **Vercel Edge Network:**
- **100+ locations** worldwide
- **Sub-100ms** latency globally
- **99.99% uptime** SLA

### **Your Vue app will be FAST!** ⚡

---

## 🐛 **Common Issues:**

### **Build fails**

**Check Vercel build logs:**
- Go to deployment
- Click "View Logs"
- Look for errors

**Common fixes:**
```bash
# Make sure build script exists
"scripts": {
  "build": "vite build"  # ✅
}

# Check all dependencies are in package.json
```

### **API calls fail (CORS)**

**Check:**
1. Backend `FRONTEND_URL` matches Vercel URL
2. Backend is deployed and running
3. API URL in frontend env vars is correct

**Fix:**
```env
# Backend .env (or Railway)
FRONTEND_URL=https://todo-app-xyz.vercel.app

# Frontend .env (Vercel)
VITE_API_URL=https://your-backend.railway.app/api
```

### **Environment variables not working**

**Remember:**
- ✅ Must start with `VITE_` prefix
- ✅ Rebuild after adding env vars
- ✅ Check they're added in Vercel dashboard

---

## 💰 **Cost:**

### **Free Tier:**
- **100 GB** bandwidth/month
- **Unlimited** deployments
- **Unlimited** preview deployments
- **Automatic** SSL certificates

**Your app will use:** ~1-5 GB/month (well within free tier!)

**Cost:** **$0/month** 🎉

---

## 🔗 **URLs After Deployment:**

```
Production: https://todo-app-xyz.vercel.app
Preview (PR): https://todo-app-git-feature-xyz.vercel.app
```

**Use production URL in:**
- Render environment variables (`FRONTEND_URL`)
- Share with users
- Add to GitHub README

---

## ✅ **CHECKLIST:**

Setup Vercel:
- [ ] Create Vercel account
- [ ] Import todo-app from GitHub
- [ ] Configure root directory: `frontend`
- [ ] Add environment variable: `VITE_API_URL`
- [ ] Deploy!
- [ ] Get Vercel token
- [ ] Get Project ID & Org ID
- [ ] Add to GitHub secrets

Verify:
- [ ] Frontend deployed successfully
- [ ] Can access login page
- [ ] Can register user (test with backend)
- [ ] Can login
- [ ] Can create todos
- [ ] No CORS errors

Update Backend:
- [ ] Set `FRONTEND_URL` to Vercel URL
- [ ] Redeploy backend

---

## 🎯 **After Deployment:**

### **Your URLs:**
```
Backend API: https://your-backend.onrender.com/api
Frontend: https://your-frontend.vercel.app
Swagger: https://your-backend.onrender.com/api-docs
```

### **GitHub Actions:**
- Every push to `main` → Auto-deploys both!
- Every PR → Preview deployment on Vercel
- Every PR → Tests run automatically

---

## 🎉 **BENEFITS:**

**Before (Local):**
- ❌ Only on localhost
- ❌ Can't share with others
- ❌ No public access

**After (Vercel):**
- ✅ **Public URL** - Share with anyone
- ✅ **Global CDN** - Fast everywhere
- ✅ **Auto-deploy** - Push to deploy
- ✅ **Preview** - Test before merge
- ✅ **Free HTTPS** - Secure by default

---

## 📚 **Additional Resources:**

- **Vercel Docs:** https://vercel.com/docs
- **Vue on Vercel:** https://vercel.com/guides/deploying-vuejs-to-vercel
- **Environment Variables:** https://vercel.com/docs/environment-variables

---

## 🚀 **READY TO DEPLOY?**

Follow steps above and your frontend will be live in ~5 minutes!

**After Vercel setup, you'll have:**
- ✅ Backend on Railway
- ✅ Frontend on Vercel
- ✅ Database on Neon
- ✅ CI/CD on GitHub Actions

**Full-stack app deployed!** 🎊

