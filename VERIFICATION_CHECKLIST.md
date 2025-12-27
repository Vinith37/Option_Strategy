# Verification Checklist ✅

Use this checklist to verify that the backend-frontend integration is working correctly.

---

## 🔧 Pre-Flight Checks

### Environment Setup
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] `.env` file exists in project root
- [ ] `backend/.env` file exists

### File Verification
- [ ] `/backend/src/utils/calculations.ts` exists
- [ ] `/src/app/api/payoffApi.ts` exists
- [ ] `/src/app/components/StrategyDetailPanel.tsx` has been updated
- [ ] All documentation files are present

---

## 🚀 Backend Verification

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```
- [ ] Installation completes without errors
- [ ] `node_modules` folder created in backend directory

### Step 2: Start Backend Server
```bash
npm run dev
```
**Expected Output:**
```
🚀 Options Strategy Builder API
📡 Server running on port 3001
🌍 Environment: development
🔗 CORS enabled for: http://localhost:5173
```
- [ ] Server starts without errors
- [ ] Port 3001 is being used
- [ ] No TypeScript compilation errors

### Step 3: Test Health Endpoint
```bash
# Open new terminal (keep backend running)
curl http://localhost:3001/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T...",
  "service": "Options Strategy Builder API"
}
```
- [ ] Health endpoint responds
- [ ] Status is "ok"
- [ ] Timestamp is current

### Step 4: Test Covered Call Calculation
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "covered-call",
    "entryDate": "2025-12-25",
    "expiryDate": "2026-01-25",
    "parameters": {
      "lotSize": "50",
      "futuresPrice": "18000",
      "callStrike": "18500",
      "premium": "200"
    }
  }'
```
**Expected:**
- [ ] Returns JSON array
- [ ] Array has ~100 objects
- [ ] Each object has `price` and `pnl` fields
- [ ] First object: `{"price": 14400, "pnl": -170000}` (approximately)
- [ ] Last object: `{"price": 21600, "pnl": 35000}` (approximately)

### Step 5: Verify Calculations
Look for these key data points in the response:
- [ ] Price = 17800, P&L ≈ 0 (break-even)
- [ ] Price = 18000, P&L ≈ 10000 (entry point)
- [ ] Price = 18500, P&L ≈ 35000 (max profit starts)
- [ ] Price = 19000, P&L ≈ 35000 (still capped)
- [ ] Price = 21600, P&L ≈ 35000 (still capped)

---

## 🎨 Frontend Verification

### Step 1: Install Frontend Dependencies
```bash
# Navigate back to project root
cd ..
npm install
```
- [ ] Installation completes without errors
- [ ] `node_modules` folder exists in root directory

### Step 2: Verify Environment Variables
Check `.env` file in root:
```env
VITE_API_URL=http://localhost:3001/api
```
- [ ] `.env` file exists
- [ ] `VITE_API_URL` points to backend

### Step 3: Start Frontend Server
```bash
npm run dev
```
**Expected Output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```
- [ ] Frontend starts without errors
- [ ] Port 5173 is being used
- [ ] No TypeScript compilation errors

### Step 4: Open in Browser
```
http://localhost:5173
```
- [ ] Application loads
- [ ] No console errors (F12 → Console)
- [ ] UI displays correctly
- [ ] Sidebar shows 7 strategies

---

## 📊 Integration Testing

### Test 1: Default Covered Call
1. **Action**: Click "Covered Call" in sidebar
2. **Verify**:
   - [ ] Strategy panel loads
   - [ ] Default parameters appear:
     - Lot Size: 50
     - Futures Price: 18000
     - Call Strike: 18500
     - Premium: 200
   - [ ] Chart displays with data
   - [ ] Max Profit card shows: ₹35,000
   - [ ] Max Loss card shows: -₹170,000

3. **Check Browser Console (F12)**:
   - [ ] No errors
   - [ ] See: API call to `/api/calculate-payoff`
   - [ ] See: Response with 100 data points

4. **Check Browser Network Tab (F12 → Network)**:
   - [ ] POST request to `http://localhost:3001/api/calculate-payoff`
   - [ ] Status: 200 OK
   - [ ] Response: Array of objects

### Test 2: Change Parameters
1. **Action**: Change "Lot Size" from 50 to 100
2. **Verify**:
   - [ ] Chart updates automatically
   - [ ] Max Profit changes to ₹70,000 (doubled)
   - [ ] Max Loss changes to -₹340,000 (doubled)
   - [ ] New API call visible in Network tab

### Test 3: Change Strike Price
1. **Action**: Change "Call Strike" from 18500 to 19000
2. **Verify**:
   - [ ] Chart updates
   - [ ] Max Profit increases (should be ~₹60,000)
   - [ ] Shape of payoff changes (flattens at higher price)

### Test 4: Change Premium
1. **Action**: Change "Premium" from 200 to 300
2. **Verify**:
   - [ ] Chart updates
   - [ ] Max Profit increases by ₹5,000
   - [ ] Break-even point shifts lower

### Test 5: Change Dates
1. **Action**: Change "Entry Date" to tomorrow
2. **Verify**:
   - [ ] Date field updates
   - [ ] API call triggered
   - [ ] Chart recalculates

### Test 6: Other Strategies
Test each strategy:
- [ ] Bull Call Spread
- [ ] Iron Condor
- [ ] Long Straddle
- [ ] Protective Put
- [ ] Butterfly Spread

For each:
- [ ] Parameters load
- [ ] Chart displays
- [ ] Max Profit/Loss cards update
- [ ] Parameter changes work

### Test 7: Custom Strategy
1. **Action**: Click "Custom Strategy"
2. **Verify**:
   - [ ] Custom builder interface appears
   - [ ] "Add Leg" button visible
3. **Action**: Add a leg:
   - Type: CE
   - Action: BUY
   - Strike: 18000
   - Lot Size: 50
   - Premium: 300
4. **Verify**:
   - [ ] Leg appears in list
   - [ ] Chart updates
5. **Action**: Add second leg:
   - Type: PE
   - Action: SELL
   - Strike: 17500
   - Lot Size: 50
   - Premium: 150
6. **Verify**:
   - [ ] Both legs visible
   - [ ] Chart shows combined payoff
   - [ ] Max Profit/Loss cards update

---

## 🔍 Detailed Verification

### Backend Math Verification
Using default Covered Call parameters:

**Price = ₹17,000**
```
Expected: P&L ≈ -40,000
Calculation:
  Futures P&L = (17,000 - 18,000) × 50 = -50,000
  Call P&L = 200 × 50 = 10,000
  Total = -40,000
```
- [ ] Backend returns pnl ≈ -40,000 at price 17,000

**Price = ₹18,500 (Strike)**
```
Expected: P&L ≈ 35,000
Calculation:
  Futures P&L = (18,500 - 18,000) × 50 = 25,000
  Call P&L = 200 × 50 = 10,000
  Total = 35,000
```
- [ ] Backend returns pnl ≈ 35,000 at price 18,500

**Price = ₹19,000 (Above Strike)**
```
Expected: P&L ≈ 35,000
Calculation:
  Futures P&L = (19,000 - 18,000) × 50 = 50,000
  Call P&L = (200 - (19,000 - 18,500)) × 50 = -15,000
  Total = 35,000
```
- [ ] Backend returns pnl ≈ 35,000 at price 19,000
- [ ] P&L is capped (same as at strike)

### Frontend Chart Verification
- [ ] Chart has X-axis (Price)
- [ ] Chart has Y-axis (P&L in ₹)
- [ ] Horizontal line at Y=0
- [ ] Blue line shows payoff
- [ ] Line crosses Y=0 around X=17,800
- [ ] Line becomes flat after X=18,500
- [ ] Tooltip shows correct values on hover

---

## 🐛 Troubleshooting

### Backend Won't Start
- [ ] Check if port 3001 is already in use: `lsof -ti:3001`
- [ ] Kill process if needed: `lsof -ti:3001 | xargs kill -9`
- [ ] Check for TypeScript errors in terminal
- [ ] Verify all dependencies installed: `npm install`

### Frontend Can't Connect
- [ ] Backend is running on port 3001
- [ ] Check `.env` has correct API URL
- [ ] Check CORS error in console
- [ ] Verify `backend/.env` has correct CORS_ORIGIN
- [ ] Restart both servers

### Chart Not Updating
- [ ] Check browser console for errors
- [ ] Check Network tab for API calls
- [ ] Verify API response has data
- [ ] Check if `payoffData` state is updating
- [ ] Verify `useEffect` dependencies

### CORS Errors
- [ ] Backend `.env` has `CORS_ORIGIN=http://localhost:5173`
- [ ] Frontend is running on port 5173
- [ ] Restart backend server after changing .env

### TypeScript Errors
- [ ] Run `npm install` in both directories
- [ ] Check for missing type definitions
- [ ] Verify import paths are correct

---

## ✅ Final Verification

### All Systems Go
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Health endpoint responds
- [ ] Covered Call calculates correctly
- [ ] Frontend displays chart
- [ ] Parameter changes trigger recalculation
- [ ] All 6 predefined strategies work
- [ ] Custom strategy builder works
- [ ] Max Profit/Loss cards update
- [ ] No console errors
- [ ] No network errors

### Performance Check
- [ ] API response time < 100ms
- [ ] Chart updates smoothly
- [ ] No lag when changing parameters
- [ ] Page loads quickly

### Code Quality
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Clean backend logs
- [ ] Proper error handling

---

## 🎉 Success Criteria

**✅ Integration is complete when:**

1. Backend server starts and responds to health checks
2. Frontend loads without errors
3. Covered Call strategy displays correct payoff diagram
4. Parameter changes trigger backend recalculation
5. Chart updates with correct data
6. Max Profit = ₹35,000, Max Loss = -₹170,000 (for defaults)
7. All 6 strategies load and calculate
8. Custom strategy builder works
9. No console errors or warnings
10. API calls complete in < 100ms

---

## 📋 Next Steps After Verification

Once all checks pass:

1. ✅ Read [COVERED_CALL_STRATEGY.md](COVERED_CALL_STRATEGY.md) for math details
2. ✅ Experiment with different parameters
3. ✅ Test all strategies
4. ✅ Build custom strategies
5. 🔲 Add database persistence (optional)
6. 🔲 Deploy to production (optional)
7. 🔲 Add user authentication (optional)

---

## 📞 Getting Help

If any checks fail:

1. **Read the error message** carefully
2. **Check documentation**:
   - [QUICK_START.md](QUICK_START.md)
   - [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)
3. **Check logs**:
   - Backend: Terminal running backend
   - Frontend: Browser console (F12)
4. **Verify configuration**:
   - `.env` files
   - Port numbers
   - CORS settings

---

**Good luck! 🚀**

Print this checklist and check off items as you verify them!
