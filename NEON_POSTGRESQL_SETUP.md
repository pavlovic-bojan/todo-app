# 🐘 Neon PostgreSQL Setup Guide

Complete guide to migrate from SQLite to Neon PostgreSQL (FREE tier).

---

## ✅ **What Was Done:**

1. ✅ Prisma schema updated (`sqlite` → `postgresql`)
2. ✅ Ready for PostgreSQL connection

---

## 🚀 **STEP-BY-STEP SETUP:**

### **Step 1: Get Connection String from Neon** 🔗

**In your Neon dashboard:**

1. Click **"Connect"** button (top right)
2. Select **"production"** branch
3. You'll see tabs: **Prisma**, **Node.js**, **SQL**, etc.
4. Click **"Prisma"** tab
5. Copy the **DATABASE_URL** - looks like:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**📋 COPY THAT STRING!**

---

### **Step 2: Update Backend .env File** ⚙️

**Open:** `backend/.env`

**Replace DATABASE_URL with your Neon connection string:**

```env
# OLD (SQLite):
# DATABASE_URL="file:./dev.db"

# NEW (Neon PostgreSQL):
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Keep these the same:
JWT_SECRET="your-very-secret-jwt-key-min-32-characters-change-in-production"
JWT_REFRESH_SECRET="your-very-secret-refresh-key-min-32-characters-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT:** Replace the entire `DATABASE_URL` with YOUR Neon connection string!

---

### **Step 3: Install PostgreSQL Driver** 📦

PostgreSQL needs different driver than SQLite:

```bash
cd backend
npm install pg
```

This installs the PostgreSQL driver that Prisma will use.

---

### **Step 4: Generate Prisma Client** 🔄

```bash
cd backend
npm run prisma:generate
```

**Expected output:**
```
✔ Generated Prisma Client (5.7.1 | library) to ./node_modules/@prisma/client
```

---

### **Step 5: Run Migrations** 🗄️

```bash
npm run prisma:migrate
```

**You'll be asked for migration name, type:**
```
migrate_to_postgresql
```

**Expected output:**
```
✔ Applying migration `20251101_migrate_to_postgresql`
✔ Database is now in sync with your schema.
```

**🎉 Your Neon database now has tables!**

---

### **Step 6: Verify Migration** ✅

**Option A: Via Prisma Studio**
```bash
npm run prisma:studio
```

Opens browser at http://localhost:5555 - you should see `User` and `Todo` tables!

**Option B: Via Neon Dashboard**
1. Go to Neon dashboard
2. Click **"Tables"** in left menu
3. You should see:
   - ✅ `users` table
   - ✅ `todos` table

---

### **Step 7: Test Backend** 🧪

```bash
npm run dev
```

**Expected output:**
```
🚀 Server started on port 3000
📊 Swagger documentation: http://localhost:3000/api-docs
✅ Database connected
```

**Test API:**
```bash
curl http://localhost:3000/api/health
```

**Expected:** `{"status":"ok"}`

---

### **Step 8: Test User Registration** 👤

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

**Expected:** Status 201, user created!

**Verify in Neon:**
1. Go to Neon dashboard → **Tables** → **users**
2. You should see your user! 🎉

---

## 🎯 **WHAT CHANGED:**

### **Before (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="file:./dev.db"
```

### **After (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

---

## 🌟 **NEON FEATURES YOU GET:**

### **Free Tier Benefits:**
- ✅ **3 GB storage** - enough for production
- ✅ **Serverless** - auto-scales, pay only for usage
- ✅ **Always online** - no pausing
- ✅ **Instant backups** - point-in-time recovery
- ✅ **Database branching** - create test copies instantly!

### **Database Branching (AMAZING!):**

You can create **development branch** for testing:

```bash
# In Neon dashboard, click "Create Branch"
# Name it: "development"
# Copy connection string for dev branch
```

Then use different DATABASE_URL for dev vs production:

```env
# .env.development
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require&branch=development"

# .env.production  
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require&branch=production"
```

**Benefit:** Test migrations on dev branch, then apply to production! 🎯

---

## 🐛 **Troubleshooting**

### **Error: "Can't reach database server"**
- Check connection string is correct
- Check internet connection
- Verify Neon database is active (not paused)

### **Error: "SSL connection required"**
Make sure connection string has `?sslmode=require` at the end.

### **Migration fails**
```bash
# Reset migrations
npx prisma migrate reset

# Re-run
npm run prisma:migrate
```

### **Prisma Client not found**
```bash
npm run prisma:generate
```

---

## 📊 **Environment Variables (Final)**

**Your `backend/.env` should look like:**

```env
# ===================
# DATABASE (Neon PostgreSQL)
# ===================
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ===================
# JWT SECRETS (Keep these!)
# ===================
JWT_SECRET="your-very-secret-jwt-key-min-32-characters-change-in-production"
JWT_REFRESH_SECRET="your-very-secret-refresh-key-min-32-characters-change-in-production"

# ===================
# SERVER
# ===================
PORT=3000
NODE_ENV=development

# ===================
# CORS
# ===================
FRONTEND_URL=http://localhost:5173
```

---

## ✅ **Verification Checklist**

After setup, verify:

- [ ] Connection string copied from Neon
- [ ] `backend/.env` updated with Neon DATABASE_URL
- [ ] `pg` driver installed (`npm install pg`)
- [ ] Prisma client generated (`npm run prisma:generate`)
- [ ] Migrations run successfully (`npm run prisma:migrate`)
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Can register user via API
- [ ] User visible in Neon dashboard (Tables → users)

---

## 🎯 **NEXT STEPS (After PostgreSQL Works):**

Once PostgreSQL is working:

1. ✅ **Deploy Backend** (Railway, Render, or Fly.io)
2. ✅ **Deploy Frontend** (Vercel or Netlify)
3. ✅ **Setup CI/CD** (GitHub Actions)
4. ✅ **Use Neon branches** for dev/staging/production

---

## 💡 **PRO TIPS:**

### **Use Neon Branches:**
- **production** branch → Production backend
- **development** branch → Development/testing
- Create **staging** branch → Staging environment

### **Monitor Usage:**
Neon dashboard shows:
- Storage used
- Compute hours
- Network transfer

Free tier is **generous** - should be enough for your app!

### **Connection Pooling:**
For production, consider connection pooling:
```env
DATABASE_URL="postgresql://...?sslmode=require&pgbouncer=true"
```

---

## 🚀 **READY TO START?**

**Execute these commands in order:**

```bash
# 1. Install PostgreSQL driver
cd backend
npm install pg

# 2. Generate Prisma client
npm run prisma:generate

# 3. Run migrations (will ask for migration name)
npm run prisma:migrate
# Type: migrate_to_postgresql

# 4. Start backend
npm run dev

# 5. Test registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123456","role":"client"}'
```

---

## 🎊 **DA LI TREBA POMOĆ?**

**Ja mogu da:**
1. ✅ Pomognem ti da kopiraš connection string iz Neona
2. ✅ Update-ujem .env fajl
3. ✅ Pokrenem migracije za tebe
4. ✅ Verifikujem da sve radi

**Reci mi:**
- **"Imam connection string"** - pa mi ga daj da update-ujem .env
- **"Ne znam gde je connection string"** - objasniću detaljnije
- **"Uradio sam sve, radi!"** - krećemo dalje sa deployment-om!

**Koji je sledeći korak?** 😊
