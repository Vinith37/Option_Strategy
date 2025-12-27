# ⚡ Quick Start Guide

Get the Options Strategy Builder running locally in 5 minutes.

---

## 🎯 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Neon** account ([Sign up free](https://neon.tech))

---

## 🚀 Local Development (5 Steps)

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd options-strategy-builder

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2️⃣ Set Up Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like `postgresql://...`)

### 3️⃣ Configure Environment Variables

**Frontend `.env`:**
```bash
cp .env.example .env
```

Edit `.env`:
```bash
VITE_API_URL=http://localhost:8000/api
```

**Backend `backend/.env`:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
DATABASE_URL=postgresql://YOUR_NEON_CONNECTION_STRING_HERE?sslmode=require
FRONTEND_URL=http://localhost:5173
API_PORT=8000
API_HOST=0.0.0.0
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
```

### 4️⃣ Start Backend

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
🚀 Starting Options Strategy Builder API
📡 Environment: development
🔗 CORS enabled for: http://localhost:5173
✅ Database initialized successfully
```

Leave this terminal running.

### 5️⃣ Start Frontend (New Terminal)

```bash
# In project root directory
npm run dev
```

You should see:
```
VITE v6.x.x ready in XXX ms
➜ Local: http://localhost:5173/
```

---

## ✅ Verify It Works

1. Open browser: `http://localhost:5173`
2. Open DevTools Console (F12)
3. Should see: **"Backend available - using backend calculations"**
4. Click a strategy (e.g., "Covered Call")
5. Chart should display
6. Try changing parameters → chart updates

---

## 🎉 Success!

You now have:
- ✅ Backend API running on `http://localhost:8000`
- ✅ Frontend app running on `http://localhost:5173`
- ✅ PostgreSQL database on Neon
- ✅ Full-stack integration working

---

## 📚 Next Steps

### Explore the API

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/api/health`

### Test Features

1. **Select Strategy** → "Covered Call"
2. **Adjust Parameters** → Change call strike price
3. **Move Slider** → Price Range %
4. **Save Strategy** → Click "Save Strategy" button
5. **Check Database** → Strategy is now in PostgreSQL

### Development

**Hot Reload:**
- Backend: Changes auto-reload (with `--reload` flag)
- Frontend: Changes auto-reload (Vite)

**Stop Servers:**
```bash
# Press Ctrl+C in each terminal
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt
```

---

### Issue: Database connection fails

**Error:** `could not connect to server`

**Fix:**
1. Check `DATABASE_URL` in `backend/.env`
2. Ensure Neon database is active
3. Verify connection string includes `?sslmode=require`
4. Test connection:
   ```bash
   psql "postgresql://your-connection-string?sslmode=require"
   ```

---

### Issue: Frontend can't connect to backend

**Console:** "Backend not available - using local calculations"

**Fix:**
1. Verify backend is running on port 8000
2. Check `VITE_API_URL` in `.env` → `http://localhost:8000/api`
3. Check `FRONTEND_URL` in `backend/.env` → `http://localhost:5173`
4. Restart both frontend and backend

---

### Issue: CORS errors

**Console:** "CORS policy: No 'Access-Control-Allow-Origin'"

**Fix:**
1. Backend `FRONTEND_URL` must exactly match frontend URL
2. No trailing slashes
3. Restart backend after changing `.env`

```bash
# backend/.env
FRONTEND_URL=http://localhost:5173  # ✅ Correct
FRONTEND_URL=http://localhost:5173/ # ❌ Wrong (trailing slash)
```

---

## 🔄 Development Workflow

### Make Changes

1. **Edit code** in your IDE
2. **Save file** → Auto-reloads
3. **Refresh browser** (frontend changes only)

### Add a Feature

1. **Backend:** Add route → service → model
2. **Frontend:** Update API call → UI
3. **Test** locally
4. **Commit** to Git

### Database Changes

```bash
# If you change models
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

## 📱 Test Responsive Design

**Browser DevTools:**
1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Click device toolbar icon (phone/tablet icon)
3. Select device:
   - iPhone SE (mobile)
   - iPad (tablet)
   - Desktop view

**Test all three breakpoints:**
- Mobile: < 640px
- Tablet: 641-1024px
- Desktop: 1025px+

---

## 🚀 Deploy to Production

When ready, follow the full deployment guide:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Quick deploy:
1. Push code to GitHub
2. Connect Railway (backend)
3. Connect Vercel (frontend)
4. Set environment variables
5. Auto-deploy on every push!

---

## 📚 Documentation

- **Main README:** [README.md](./README.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Backend README:** [backend/README.md](./backend/README.md)
- **Improvements:** [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)

---

## 💡 Tips

**Speed up development:**
```bash
# Backend: Skip database initialization if already done
# Frontend: Use --host flag to access from other devices
npm run dev -- --host
```

**Environment variables:**
```bash
# After changing .env files, always restart servers
# Ctrl+C → rerun start command
```

**Database reset:**
```bash
# If you need to reset database
cd backend
python -c "from app.database import Base, engine; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"
```

---

**Happy coding! 🎉**
