# 🔧 Environment Variables Setup

Complete guide for backend environment configuration.

---

## 📋 Required Variables

Create `.env` file in `backend/` folder with these variables:

```env
# ===================
# DATABASE
# ===================
DATABASE_URL="your-db-url"

# ===================
# JWT SECRETS
# ===================
# Change these in production! Generate strong random strings.
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
FRONTEND_URL=https://todo-app-frontend-seven-rho.vercel.app
```

---

## 🔐 Security Notes

### JWT Secrets
**⚠️ CRITICAL:** Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production!

Generate strong secrets:
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online
# Use: https://generate-secret.vercel.app/32
```

### Production Settings
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="your-db-url"
JWT_SECRET="<STRONG-RANDOM-STRING-HERE>"
JWT_REFRESH_SECRET="<DIFFERENT-STRONG-RANDOM-STRING-HERE>"
FRONTEND_URL=https://your-domain.com
```

---

## 📚 Variable Descriptions

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | `file:./dev.db` | SQLite database file path |
| `JWT_SECRET` | ✅ Yes | - | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ Yes | - | Secret for signing refresh tokens (min 32 chars) |
| `PORT` | ❌ No | `3000` | Server port |
| `NODE_ENV` | ❌ No | `development` | Environment (`development`/`production`) |
| `FRONTEND_URL` | ❌ No | `https://todo-app-frontend-seven-rho.vercel.app` | Frontend URL for CORS |

---

## 🌍 Environment-Specific Configs

### Development
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="your-db-url"
FRONTEND_URL=https://todo-app-frontend-seven-rho.vercel.app
```

### Testing
```env
NODE_ENV=test
PORT=3001
DATABASE_URL="your-db-url"
FRONTEND_URL=https://todo-app-frontend-seven-rho.vercel.app
```

### Production
```env
NODE_ENV=production
PORT=80
DATABASE_URL="your-db-url"
FRONTEND_URL=https://your-production-domain.com
```

---

## ✅ Validation

The backend will validate environment variables on startup:
- `DATABASE_URL` must be set
- `JWT_SECRET` must be set and at least 32 characters
- `JWT_REFRESH_SECRET` must be set and at least 32 characters

If validation fails, the server will not start.

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` files to Git**
   - Already in `.gitignore`

2. ✅ **Use strong secrets**
   - Minimum 32 characters
   - Random, unpredictable strings

3. ✅ **Different secrets per environment**
   - Dev, Test, Production should have different secrets

4. ✅ **Rotate secrets regularly**
   - Change JWT secrets periodically in production

5. ✅ **Use environment-specific values**
   - Don't reuse production secrets in development

---

## 📖 Example .env File

```env
# Backend Environment Variables
# Copy this file to .env and update the values

# Database
DATABASE_URL="your-db-url"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="9k2m5n8p1q4r7s0t3u6v9w2x5y8z1a4b7c0d3e6f9g2h5i8j1k4m7n0p"
JWT_REFRESH_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=https://todo-app-frontend-seven-rho.vercel.app
```

---

## 🐛 Common Issues

### "Environment variable not found: DATABASE_URL"
Make sure `.env` file exists in `backend/` folder (not root!).

### "JWT_SECRET must be at least 32 characters"
Generate a strong secret using one of the methods above.

### CORS Errors
Ensure `FRONTEND_URL` matches your frontend development server URL.

---

## 🎉 Ready!

Once your `.env` file is configured, start the server:

```bash
npm run dev
```

Server will validate environment variables and start on the configured port.

---

**Need help?** Check [README.md](README.md) for more information.
