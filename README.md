# 🚀 Options Strategy Builder - Production Ready

A full-stack web application for configuring and visualizing options trading strategies with real-time payoff diagrams.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Frontend       │ ◄─────► │  Backend         │ ◄─────► │  PostgreSQL     │
│  (React +       │  HTTP   │  (FastAPI)       │  SQL    │  (Neon)         │
│   Tailwind)     │         │                  │         │                 │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
   Vercel                      Railway                     Neon.tech
```

**Clean Architecture (Backend):**
- **Routers** (Controllers): Handle HTTP requests/responses
- **Services**: Business logic and calculations
- **Models**: SQLAlchemy database models
- **Schemas**: Pydantic validation models

**Frontend Features:**
- Fully responsive (mobile/tablet/desktop)
- Live payoff diagram with slider controls
- 7 pre-built strategies + custom strategy builder
- Automatic fallback to local calculations if backend is down

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Charting library
- **Vite** - Build tool

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Alembic** - Database migrations

### Database
- **PostgreSQL** - Hosted on Neon.tech
- Cloud-hosted with SSL connections
- Automatic connection pooling

---

## ✅ Prerequisites

### Local Development
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **PostgreSQL** database on Neon.tech (free tier available)

### Deployment
- **Vercel** account (frontend)
- **Railway** account (backend)
- **Neon** account (database)

---

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd options-strategy-builder
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env and set:
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment example
cp .env.example .env

# Edit .env and configure database (see next section)
```

---

## 🔐 Environment Variables

### Frontend (`.env`)

```bash
# API Base URL
VITE_API_URL=http://localhost:8000/api
```

**For production (Vercel):**
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (`backend/.env`)

```bash
# Database URL from Neon
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0

# CORS - Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
ENVIRONMENT=development
DEBUG=True

# Secret Key (generate a secure random string for production)
SECRET_KEY=your-secret-key-change-this-in-production
```

**For production (Railway):**
```bash
DATABASE_URL=<your-neon-connection-string>
API_PORT=8000
API_HOST=0.0.0.0
FRONTEND_URL=https://your-frontend.vercel.app
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generated-secret-key>
```

---

## 🗄️ Database Setup

### 1. Create Neon Database

1. Go to [Neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string

Connection string format:
```
postgresql://username:password@host/database?sslmode=require
```

### 2. Set Database URL

Paste the connection string into `backend/.env`:
```bash
DATABASE_URL=postgresql://...
```

### 3. Initialize Database

```bash
cd backend

# The database tables will be created automatically when you start the backend
# Or you can create them manually:
python -c "from app.database import init_db; init_db()"
```

### 4. Database Migrations (Optional)

If you need to make schema changes:

```bash
# Initialize Alembic (only needed once)
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on `http://localhost:8000`

- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/api/health`

### Start Frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Test the Connection

1. Open `http://localhost:5173`
2. Check browser console for: "Backend available - using backend calculations"
3. Select a strategy and verify the chart updates

---

## 🚀 Deployment

### Deploy Backend to Railway

1. **Create Railway Project**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   - Go to project settings → Variables
   - Add all variables from `backend/.env`:
     ```
     DATABASE_URL=<your-neon-connection-string>
     FRONTEND_URL=https://your-frontend.vercel.app
     ENVIRONMENT=production
     DEBUG=False
     SECRET_KEY=<generated-secure-key>
     API_PORT=8000
     API_HOST=0.0.0.0
     ```

3. **Configure Build Settings**
   - Root Directory: `/backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Deploy**
   - Railway will auto-deploy on push to main branch
   - Note the generated URL: `https://your-app.railway.app`

### Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [Vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   
3. **Configure Environment Variables**
   - In project settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```

4. **Deploy**
   ```bash
   # Or use CLI:
   vercel --prod
   ```

5. **Update Backend CORS**
   - Copy your Vercel URL: `https://your-app.vercel.app`
   - Update Railway environment variable:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Redeploy backend

---

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/health` | Health check |
| POST | `/api/payoff/calculate` | Calculate payoff diagram |
| POST | `/api/strategies` | Create strategy |
| GET | `/api/strategies` | Get all strategies |
| GET | `/api/strategies/{id}` | Get strategy by ID |
| PUT | `/api/strategies/{id}` | Update strategy |
| DELETE | `/api/strategies/{id}` | Delete strategy |

### Example: Calculate Payoff

**Request:**
```bash
POST /api/payoff/calculate
Content-Type: application/json

{
  "strategy_type": "covered-call",
  "entry_date": "2025-12-26",
  "expiry_date": "2026-01-26",
  "parameters": {
    "futuresPrice": "18000",
    "callStrike": "18500",
    "premium": "200",
    "futuresLotSize": "50",
    "callLotSize": "50"
  },
  "underlying_price": 18000,
  "price_range_percent": 30
}
```

**Response:**
```json
[
  { "price": 12600, "pnl": -260000 },
  { "price": 12820, "pnl": -249000 },
  ...
  { "price": 23400, "pnl": 35000 }
]
```

### Interactive API Docs

After starting the backend, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📁 Project Structure

```
options-strategy-builder/
├── src/                          # Frontend source
│   ├── app/
│   │   ├── api/
│   │   │   └── payoffApi.ts      # Backend API integration
│   │   ├── components/           # React components
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helper functions
│   └── styles/                   # Global styles
│
├── backend/                      # Backend source
│   ├── app/
│   │   ├── routers/              # API endpoints (controllers)
│   │   ├── services/             # Business logic
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── config.py             # Configuration
│   │   ├── database.py           # Database setup
│   │   └── main.py               # FastAPI app
│   ├── alembic/                  # Database migrations
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables
│
├── .env                          # Frontend environment
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

---

## 🧪 Testing

### Test Backend Health

```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "Options Strategy Builder API",
  "version": "2.0.0",
  "environment": "development"
}
```

### Test Payoff Calculation

```bash
curl -X POST http://localhost:8000/api/payoff/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "strategy_type": "covered-call",
    "entry_date": "2025-12-26",
    "expiry_date": "2026-01-26",
    "parameters": {
      "futuresPrice": "18000",
      "callStrike": "18500",
      "premium": "200",
      "futuresLotSize": "50",
      "callLotSize": "50"
    },
    "underlying_price": 18000,
    "price_range_percent": 30
  }'
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Issue:** Console shows "Backend not available"

**Solution:**
1. Verify backend is running on port 8000
2. Check `VITE_API_URL` in frontend `.env`
3. Check CORS settings in backend `.env` (`FRONTEND_URL`)
4. Restart both frontend and backend

### Database connection fails

**Issue:** Backend logs show database connection error

**Solution:**
1. Verify Neon database is active
2. Check `DATABASE_URL` in backend `.env`
3. Ensure connection string includes `?sslmode=require`
4. Test connection: `psql <DATABASE_URL>`

### Deployment issues

**Backend (Railway):**
- Check environment variables are set
- Verify build logs for errors
- Ensure `PORT` environment variable is used

**Frontend (Vercel):**
- Check `VITE_API_URL` environment variable
- Verify build logs
- Test API health check endpoint

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check API docs: `/docs`
- Review troubleshooting guide above

---

**Last Updated:** December 26, 2025  
**Version:** 2.0.0
