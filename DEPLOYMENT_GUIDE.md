# 🚀 Deployment Guide - Production Ready

Step-by-step guide to deploy the Options Strategy Builder to production.

---

## 📋 Prerequisites

- [Neon](https://neon.tech) account (PostgreSQL database)
- [Railway](https://railway.app) account (backend hosting)
- [Vercel](https://vercel.com) account (frontend hosting)
- GitHub repository with your code

---

## 🗄️ Step 1: Set Up Database (Neon)

### 1.1 Create Neon Project

1. Go to https://neon.tech
2. Click "Sign Up" (free tier available)
3. Create a new project:
   - Name: "options-strategy-db"
   - Region: Choose closest to your users
   - PostgreSQL version: Latest (16.x)

### 1.2 Get Connection String

1. Go to project dashboard
2. Click "Connection Details"
3. Copy the connection string:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

4. Save this string - you'll need it for backend deployment

### 1.3 Verify Connection (Optional)

```bash
# Test connection using psql
psql "postgresql://username:password@host/database?sslmode=require"

# Or using Python
python -c "
from sqlalchemy import create_engine
engine = create_engine('postgresql://...')
conn = engine.connect()
print('✅ Connection successful')
"
```

---

## 🔧 Step 2: Deploy Backend (Railway)

### 2.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository

### 2.2 Configure Service

1. **Root Directory:**
   ```
   /backend
   ```

2. **Build Command:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Command:**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### 2.3 Set Environment Variables

In Railway dashboard → Variables, add:

```bash
# Database (from Neon)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0

# CORS (will update after frontend deployment)
FRONTEND_URL=https://temp-placeholder.vercel.app

# Environment
ENVIRONMENT=production
DEBUG=False

# Security (generate a secure random string)
SECRET_KEY=<generate-using-command-below>
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Copy the generated URL: `https://your-app.railway.app`

### 2.5 Test Backend

```bash
# Health check
curl https://your-app.railway.app/api/health

# Expected response:
{
  "status": "healthy",
  "service": "Options Strategy Builder API",
  "version": "2.0.0",
  "environment": "production"
}
```

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Project

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3.2 Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```bash
# API URL (from Railway)
VITE_API_URL=https://your-app.railway.app/api
```

Make sure to add this for:
- ✅ Production
- ✅ Preview (optional)
- ✅ Development (optional)

### 3.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Copy the generated URL: `https://your-app.vercel.app`

### 3.4 Test Frontend

1. Open `https://your-app.vercel.app`
2. Open browser console
3. Look for: "Backend available - using backend calculations"
4. Select a strategy and verify chart updates

---

## 🔗 Step 4: Connect Frontend and Backend

### 4.1 Update Backend CORS

1. Go to Railway dashboard
2. Navigate to your backend service → Variables
3. Update `FRONTEND_URL`:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (No trailing slash!)

4. Redeploy backend (or it will auto-redeploy)

### 4.2 Verify Connection

1. Open frontend in browser: `https://your-app.vercel.app`
2. Open DevTools → Console
3. Should see: "Backend available - using backend calculations"
4. If you see "Backend not available":
   - Check `VITE_API_URL` in Vercel env vars
   - Check `FRONTEND_URL` in Railway env vars
   - Verify both URLs are correct (no trailing slashes)

---

## ✅ Step 5: Verification Checklist

### Database (Neon)
- [ ] Database is active and accessible
- [ ] Connection string is secure (includes `?sslmode=require`)
- [ ] Connection string is in Railway environment variables

### Backend (Railway)
- [ ] Service is deployed and running
- [ ] Health check endpoint returns 200: `/api/health`
- [ ] All environment variables are set correctly
- [ ] `FRONTEND_URL` matches Vercel deployment URL
- [ ] API docs are accessible: `https://your-app.railway.app/docs`

### Frontend (Vercel)
- [ ] Deployment is successful
- [ ] `VITE_API_URL` environment variable is set
- [ ] Frontend loads without errors
- [ ] Console shows "Backend available"
- [ ] Can select strategies and see payoff charts
- [ ] Can save strategies (creates database entry)

---

## 🔄 Step 6: Set Up Auto-Deployment

### GitHub Integration

Both Railway and Vercel support auto-deployment:

**Railway:**
1. Go to Settings → GitHub
2. Enable "Auto-deploy on push"
3. Select branch (usually `main`)

**Vercel:**
1. Already enabled by default
2. Every push to `main` triggers deployment
3. Pull requests create preview deployments

### Deployment Workflow

```
Push to GitHub
     │
     ├─► Railway (Backend)
     │    └─► Auto-deploy
     │
     └─► Vercel (Frontend)
          └─► Auto-deploy
```

---

## 🐛 Troubleshooting

### Issue: CORS Error in Browser

**Symptoms:**
- Console error: "CORS policy: No 'Access-Control-Allow-Origin'"
- Frontend can't connect to backend

**Solution:**
1. Check Railway `FRONTEND_URL` exactly matches Vercel URL
2. No trailing slashes in either URL
3. Redeploy backend after changing CORS settings

Example:
```bash
# ✅ CORRECT
FRONTEND_URL=https://your-app.vercel.app

# ❌ WRONG
FRONTEND_URL=https://your-app.vercel.app/
```

---

### Issue: Database Connection Fails

**Symptoms:**
- Backend logs show database connection error
- Health check fails with 503 error

**Solution:**
1. Verify Neon database is active
2. Check `DATABASE_URL` in Railway
3. Ensure `?sslmode=require` is in connection string
4. Test connection manually:
   ```bash
   psql "postgresql://..."
   ```

---

### Issue: Environment Variables Not Working

**Symptoms:**
- Backend uses default values
- Frontend can't find backend

**Solution:**

**Railway:**
1. Go to Variables tab
2. Click "Raw Editor"
3. Verify all variables are present
4. Redeploy service

**Vercel:**
1. Go to Settings → Environment Variables
2. Ensure `VITE_API_URL` is set for Production
3. Redeploy frontend

---

### Issue: Frontend Shows "Backend Not Available"

**Symptoms:**
- Console: "Backend not available - using local calculations"
- Strategies work but don't save to database

**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Test backend health check: `curl https://your-backend.railway.app/api/health`
3. Check browser Network tab for failed requests
4. Verify CORS settings (see above)

---

## 📊 Monitoring

### Railway Logs

```bash
# View logs in dashboard
Railway Dashboard → Your Service → Logs

# Or using CLI
railway logs
```

### Vercel Logs

```bash
# View in dashboard
Vercel Dashboard → Your Project → Deployments → [Latest] → Logs

# Or using CLI
vercel logs
```

### Database Monitoring

Neon Dashboard → Your Project → Monitoring
- Active connections
- Query performance
- Storage usage

---

## 🔐 Security Checklist

- [ ] `SECRET_KEY` is randomly generated and secure
- [ ] `DATABASE_URL` is not exposed in client-side code
- [ ] CORS only allows your frontend domain
- [ ] `DEBUG=False` in production
- [ ] Database connections use SSL (`?sslmode=require`)
- [ ] No sensitive data in environment variables visible to client
- [ ] API endpoints validate all inputs

---

## 📈 Performance Optimization

### Backend (Railway)

**Scaling:**
- Railway auto-scales based on load
- Monitor resource usage in dashboard
- Upgrade plan if needed

**Optimization:**
```python
# Use connection pooling (already configured)
engine = create_engine(
    database_url,
    pool_size=10,
    max_overflow=20
)
```

### Frontend (Vercel)

**Build Optimization:**
```bash
# Already optimized with Vite
npm run build
```

**Caching:**
- Vercel automatically caches static assets
- API responses are not cached (dynamic data)

### Database (Neon)

**Optimization:**
- Neon auto-scales compute
- Monitor query performance in dashboard
- Add indexes if queries are slow:
  ```sql
  CREATE INDEX idx_strategy_type ON strategies(strategy_type);
  ```

---

## 🔄 Updating the Application

### Code Changes

1. **Make changes locally**
2. **Test locally:**
   ```bash
   # Backend
   cd backend
   python -m uvicorn app.main:app --reload
   
   # Frontend
   npm run dev
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "description"
   git push origin main
   ```
4. **Auto-deployment triggers:**
   - Railway deploys backend
   - Vercel deploys frontend

### Database Migrations

If you change database schema:

1. **Create migration:**
   ```bash
   cd backend
   alembic revision --autogenerate -m "description"
   ```

2. **Test locally:**
   ```bash
   alembic upgrade head
   ```

3. **Deploy to production:**
   ```bash
   # Push migration files to GitHub
   git add alembic/versions/*
   git commit -m "Add migration"
   git push

   # Run migration on Railway
   railway run alembic upgrade head
   ```

---

## 💰 Cost Estimation

### Free Tier (Total: $0/month)

- **Neon:** Free tier includes:
  - 3 projects
  - 10GB storage
  - Unlimited queries

- **Railway:** Free tier includes:
  - $5 credit/month
  - 500 hours execution
  - 100GB outbound bandwidth

- **Vercel:** Free tier includes:
  - 100GB bandwidth
  - Unlimited deployments
  - Custom domains

**For small projects:** Everything stays free!

### Paid Tier (If you exceed free limits)

- **Neon Pro:** $19/month
  - 100GB storage
  - Dedicated compute

- **Railway Pro:** $20/month
  - $20 credit
  - More resources

- **Vercel Pro:** $20/month
  - 1TB bandwidth
  - Advanced analytics

---

## 📝 Summary

You now have a production-ready deployment with:

✅ **Database:** PostgreSQL on Neon (auto-scaling, SSL)  
✅ **Backend:** FastAPI on Railway (auto-deploy, monitoring)  
✅ **Frontend:** React on Vercel (CDN, auto-deploy)  
✅ **CORS:** Properly configured  
✅ **Environment:** Separated dev/prod configs  
✅ **Monitoring:** Logs and metrics in dashboards  
✅ **Security:** SSL, environment variables, validation  

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- API Docs: `https://your-app.railway.app/docs`

---

**Last Updated:** December 26, 2025  
**Version:** 2.0.0
