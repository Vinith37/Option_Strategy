# Complete Setup Guide - Options Strategy Builder

This guide will help you set up both the frontend and backend for the Options Strategy Builder application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git (optional)

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to project root (if in backend, go back)
cd ..

# Create environment file
cp .env.example .env

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Verify Setup

Open your browser and:
1. Go to `http://localhost:5173` - You should see the Options Strategy Builder UI
2. Select a strategy (e.g., "Covered Call")
3. The payoff chart should load with data from the backend

## Detailed Setup Instructions

### Backend Configuration

#### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `body-parser` - Request body parsing
- TypeScript and type definitions

#### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Configuration Options:**
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:5173)

#### 3. Run Backend

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

#### 4. Verify Backend

Test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T12:00:00.000Z",
  "service": "Options Strategy Builder API"
}
```

### Frontend Configuration

#### 1. Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001/api
```

**Important:** If you change the backend port, update this URL accordingly.

#### 2. Install Dependencies (if needed)

```bash
npm install
```

#### 3. Run Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Integration Guide

### How It Works

1. **User selects a strategy** → Frontend loads strategy configuration
2. **User changes parameters** → Frontend calls `POST /api/calculate-payoff`
3. **Backend calculates payoff** → Returns array of price/P&L data points
4. **Frontend updates chart** → Chart re-renders with new data
5. **User saves strategy** → Frontend calls `POST /api/strategies`

### Data Flow Example

**User Action:** Change "Call Strike Price" from 18500 to 19000

1. Frontend `handleParamChange` triggered
2. Calls `fetchPayoffData()` with updated parameters:
   ```json
   {
     "strategyType": "covered-call",
     "entryDate": "2025-12-25",
     "expiryDate": "2026-01-25",
     "parameters": {
       "lotSize": "50",
       "futuresPrice": "18000",
       "callStrike": "19000",
       "premium": "200"
     }
   }
   ```
3. Backend calculates payoff for prices 14400-21600
4. Returns 100 data points: `[{ price, pnl }, ...]`
5. Frontend updates chart with new data

## Testing the Integration

### Test 1: Covered Call Strategy

1. Open frontend: `http://localhost:5173`
2. Click "Covered Call" in sidebar
3. Default parameters should load
4. Check browser console - should see API call to backend
5. Chart should display with calculated data

### Test 2: Parameter Changes

1. Change "Lot Size" from 50 to 100
2. Observe chart update automatically
3. Check Network tab - should see POST to `/api/calculate-payoff`
4. Verify new payoff values (should be doubled)

### Test 3: Save Strategy

1. Fill in all parameters
2. Add notes: "Test strategy for Jan 2026"
3. Click "Save Strategy" button
4. Should see success message
5. Check backend console - should log saved strategy

### Test 4: Custom Strategy

1. Select "Custom Strategy" from sidebar
2. Add a leg: CE, BUY, Strike 18000, Lot Size 50, Premium 300
3. Add another leg: PE, SELL, Strike 17500, Lot Size 50, Premium 150
4. Chart should update with custom payoff calculation

## API Endpoints Reference

### Calculate Payoff
```
POST http://localhost:3001/api/calculate-payoff
Content-Type: application/json

{
  "strategyType": "covered-call",
  "entryDate": "2025-12-25",
  "expiryDate": "2026-01-25",
  "parameters": {
    "lotSize": "50",
    "futuresPrice": "18000",
    "callStrike": "18500",
    "premium": "200"
  }
}
```

### Save Strategy
```
POST http://localhost:3001/api/strategies
Content-Type: application/json

{
  "name": "My Covered Call",
  "type": "covered-call",
  "entryDate": "2025-12-25",
  "expiryDate": "2026-01-25",
  "parameters": { ... },
  "notes": "Test notes"
}
```

### Get All Strategies
```
GET http://localhost:3001/api/strategies
```

## Troubleshooting

### Backend won't start

**Error:** `Port 3001 already in use`
- Solution: Change PORT in backend `.env` file
- Or kill process: `lsof -ti:3001 | xargs kill -9`

**Error:** `Cannot find module 'express'`
- Solution: Run `npm install` in backend directory

### Frontend can't connect to backend

**Error:** `Failed to fetch` in browser console
- Check backend is running: `curl http://localhost:3001/api/health`
- Verify CORS_ORIGIN in backend `.env` matches frontend URL
- Check VITE_API_URL in frontend `.env`

**Error:** `CORS policy` error
- Update `CORS_ORIGIN` in backend `.env` to match frontend URL
- Restart backend server

### Chart not updating

1. Open browser DevTools → Network tab
2. Check if API calls are being made to `/calculate-payoff`
3. Check response - should be array of `{ price, pnl }` objects
4. Check browser console for errors
5. Verify backend calculations are correct

### TypeScript errors in backend

```bash
# Rebuild TypeScript
cd backend
npm run build
```

## Production Deployment

### Backend Deployment

1. **Build the application:**
   ```bash
   cd backend
   npm run build
   ```

2. **Set production environment:**
   ```env
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

3. **Deploy options:**
   - Docker container
   - VPS (DigitalOcean, Linode, AWS EC2)
   - Platform as a Service (Heroku, Railway, Render)
   - Serverless (AWS Lambda, Vercel Functions)

4. **Use process manager:**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name options-api
   pm2 save
   pm2 startup
   ```

### Frontend Deployment

1. **Update API URL:**
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy options:**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages
   - Any static hosting service

## Adding Database Persistence

Currently, the backend uses in-memory storage. To add a database:

### PostgreSQL Example

1. **Install dependencies:**
   ```bash
   cd backend
   npm install pg
   ```

2. **Create database:**
   ```sql
   CREATE TABLE strategies (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     type VARCHAR(50) NOT NULL,
     entry_date DATE,
     expiry_date DATE,
     parameters JSONB,
     custom_legs JSONB,
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Update controller** (see backend/README.md for details)

### MongoDB Example

1. **Install dependencies:**
   ```bash
   cd backend
   npm install mongodb
   ```

2. **Update controller** to use MongoDB (see backend/README.md)

## File Structure

```
project-root/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Calculations
│   │   └── server.ts          # Main server
│   ├── .env                   # Backend config
│   ├── package.json
│   └── tsconfig.json
│
├── src/                       # Frontend
│   ├── app/
│   │   ├── api/              # API integration
│   │   │   └── payoffApi.ts  # Backend API calls
│   │   ├── components/       # React components
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Main component
│   └── ...
│
├── .env                       # Frontend config
├── SETUP_GUIDE.md            # This file
└── package.json
```

## Next Steps

1. ✅ Set up backend (completed)
2. ✅ Set up frontend (completed)
3. ✅ Test integration (verify it works)
4. 🔲 Add authentication (optional)
5. 🔲 Add database persistence (optional)
6. 🔲 Deploy to production (when ready)
7. 🔲 Add real-time market data (advanced)
8. 🔲 Add backtesting features (advanced)

## Support

- Backend README: `/backend/README.md`
- Integration Guide: `/BACKEND_INTEGRATION_GUIDE.md`
- Frontend code: `/src/app/`

For issues, check:
1. Backend logs (terminal running backend)
2. Frontend console (browser DevTools)
3. Network tab (browser DevTools)
4. API responses (Postman or curl)

## Summary

You now have:
- ✅ Full-stack Options Strategy Builder
- ✅ Backend API with 6 strategies + custom
- ✅ Frontend UI with real-time calculations
- ✅ Complete integration between frontend/backend
- ✅ Save/retrieve strategy functionality
- ✅ Production-ready architecture

**To get started:**
1. `cd backend && npm install && npm run dev`
2. (New terminal) `cd .. && npm run dev`
3. Open `http://localhost:5173` and start building strategies!
