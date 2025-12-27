# ✅ Testing Checklist - Options Strategy Builder

Use this checklist to verify that all features work correctly across all devices and scenarios.

---

## 🎯 Pre-Deployment Testing

### ✅ Backend Testing

#### 1. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

**Expected Output:**
```
🚀 Options Strategy Builder API
📡 Server running on port 3001
🌍 Environment: development
🔗 CORS enabled for: http://localhost:5173
```

**✓ Pass Criteria:**
- Server starts without errors
- All endpoints listed
- Port 3001 is accessible

---

#### 2. Health Check Endpoint

```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T10:30:00.000Z",
  "service": "Options Strategy Builder API"
}
```

**✓ Pass Criteria:**
- Status code: 200
- JSON response with "status": "ok"
- Timestamp is current

---

#### 3. Calculate Payoff - Covered Call

```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "covered-call",
    "entryDate": "2025-12-26",
    "expiryDate": "2026-01-26",
    "parameters": {
      "futuresLotSize": "50",
      "futuresPrice": "18000",
      "callLotSize": "50",
      "callStrike": "18500",
      "premium": "200"
    },
    "underlyingPrice": 18000,
    "priceRangePercent": 30
  }'
```

**Expected Response:**
```json
[
  { "price": 12600, "pnl": -260000 },
  { "price": 12820, "pnl": -249000 },
  ...
  { "price": 18000, "pnl": 10000 },
  ...
  { "price": 23400, "pnl": 35000 }
]
```

**✓ Pass Criteria:**
- Status code: 200
- Array of objects with `price` and `pnl` properties
- Approximately 50 data points
- Prices range from ~12,600 to ~23,400
- P&L values are reasonable

---

#### 4. Save Strategy

```bash
curl -X POST http://localhost:3001/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Covered Call",
    "type": "covered-call",
    "entryDate": "2025-12-26",
    "expiryDate": "2026-01-26",
    "parameters": {
      "futuresPrice": "18000",
      "callStrike": "18500",
      "premium": "200"
    },
    "notes": "Test strategy",
    "timestamp": "2025-12-26T10:30:00.000Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "id": "strategy-1735210200000",
  "message": "Strategy saved successfully"
}
```

**✓ Pass Criteria:**
- Status code: 200 or 201
- `success`: true
- `id` is returned
- Message confirms save

---

#### 5. Get All Strategies

```bash
curl http://localhost:3001/api/strategies
```

**Expected Response:**
```json
[
  {
    "id": "strategy-1735210200000",
    "name": "Test Covered Call",
    "type": "covered-call",
    "entryDate": "2025-12-26",
    ...
  }
]
```

**✓ Pass Criteria:**
- Status code: 200
- Array of saved strategies
- Each strategy has id, name, type, etc.

---

#### 6. Error Handling - Missing Fields

```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "covered-call"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**✓ Pass Criteria:**
- Status code: 400
- Error message is clear
- Server doesn't crash

---

### ✅ Frontend Testing (Desktop)

#### 1. Start Frontend Development Server

```bash
npm install
npm run dev
```

**✓ Pass Criteria:**
- Vite server starts on port 5173
- No console errors
- Application loads in browser

---

#### 2. Initial Load

**Action:** Open http://localhost:5173

**Expected Behavior:**
- TopNav renders with logo and title
- Sidebar shows 7 strategy cards
- Main area shows "Select a strategy to get started"
- No console errors

**✓ Pass Criteria:**
- Layout is clean and styled
- All components render
- Console shows: "Backend available" or "Using local calculations"

---

#### 3. Strategy Selection

**Action:** Click "Covered Call" in sidebar

**Expected Behavior:**
- Detail panel appears with:
  - Strategy header with icon
  - Input fields (Entry Date, Expiry Date, parameters)
  - Payoff diagram on the right
  - Chart shows payoff curve
  - Max Profit/Loss cards display

**✓ Pass Criteria:**
- Smooth transition (no flash)
- Chart renders with data
- All inputs are populated with defaults
- Break-even point is marked on chart

---

#### 4. Parameter Change

**Action:**
1. Change "Call Strike Price" from 18500 to 19000
2. Wait 1 second

**Expected Behavior:**
- Loading spinner appears briefly
- Chart updates with new payoff curve
- Max Profit value changes
- Break-even point moves
- Smooth animation (500ms)

**✓ Pass Criteria:**
- Chart updates automatically
- No page reload
- Values are accurate
- Console shows API call (or local calculation)

---

#### 5. Price Range Slider

**Action:**
1. Move "Price Range (%)" slider from 30% to 50%
2. Wait for update

**Expected Behavior:**
- Slider value updates live (shows 50%)
- Price range text updates (₹9,000 - ₹27,000)
- Chart X-axis expands
- Payoff curve extends to new range
- Smooth animation

**✓ Pass Criteria:**
- Slider is responsive
- Chart updates after debounce (300ms)
- X-axis ticks adjust automatically
- Curve shape remains accurate

---

#### 6. Underlying Price Adjustment

**Action:**
1. Click "+" button next to Underlying Price
2. Verify price increases by 100

**Expected Behavior:**
- Price updates: 18000 → 18100
- Chart recalculates and updates
- Price range adjusts accordingly

**✓ Pass Criteria:**
- Buttons work correctly
- Price increments/decrements by 100
- Chart updates smoothly

---

#### 7. Save Strategy

**Action:**
1. Fill in Notes: "Test strategy"
2. Click "Save Strategy" button

**Expected Behavior:**
- Button shows "Saving..." with spinner
- Success toast appears: "Strategy saved!"
- Green checkmark icon
- Toast auto-hides after 3 seconds

**✓ Pass Criteria:**
- Button is disabled while saving
- Success message appears
- Console shows POST request (if backend available)
- No errors

---

#### 8. Custom Strategy Builder

**Action:**
1. Click "Custom Strategy" in sidebar
2. Click "Add Leg" button
3. Configure:
   - Type: CE (Call)
   - Action: BUY
   - Strike: 18000
   - Premium: 300
   - Lot Size: 50
4. Click "Calculate Payoff"

**Expected Behavior:**
- "Add Leg" form appears
- Leg card displays with options
- "Calculate Payoff" button is enabled
- Chart updates with custom strategy payoff

**✓ Pass Criteria:**
- Can add multiple legs
- Can remove legs
- Chart updates after "Calculate Payoff" click
- Payoff is accurate for multi-leg strategy

---

#### 9. Context Menu (Right-Click)

**Action:**
1. Right-click on "Covered Call" card in sidebar
2. Check menu options

**Expected Behavior:**
- Context menu appears at cursor position
- Shows "Edit" and "Extended Trade" options
- Menu closes on click outside

**✓ Pass Criteria:**
- Menu appears on right-click
- Positioned correctly
- Closes properly
- Options are clickable

---

#### 10. Backend Fallback

**Action:**
1. Stop backend server (Ctrl+C in backend terminal)
2. Change a parameter in frontend
3. Observe console

**Expected Behavior:**
- Console logs: "Backend not available - using local calculations"
- Chart still updates correctly
- No error messages to user
- Calculations are accurate

**✓ Pass Criteria:**
- Seamless fallback
- No user-facing errors
- Calculations match backend results
- Application continues working

---

### ✅ Responsive Testing (Tablet)

#### Screen Size: 768px - 1024px

**Action:** Resize browser window to 900px width

**Expected Behavior:**

**Sidebar:**
- Width: 256px (w-64)
- Shows strategy icons + names
- Collapse button works

**Detail Panel:**
- Flexes to fill remaining space
- Grid changes to 2 columns (inputs | chart)
- Padding: 32px (p-8)

**Chart:**
- Width: 100% of container
- Height: 350px
- Maintains aspect ratio

**TopNav:**
- Full logo and title
- Menu items visible

**✓ Pass Criteria:**
- Layout is clean and usable
- No horizontal scroll
- All elements are accessible
- Text is readable

---

### ✅ Responsive Testing (Mobile)

#### Screen Size: 375px (iPhone SE) to 640px

**Action:** Resize browser to 375px width or use device emulation

**Expected Behavior:**

**TopNav:**
- Compact logo (32px)
- Title: "OSB"
- Hamburger menu icon

**Sidebar (Initial):**
- Full width (100vw)
- Strategy cards stack vertically
- Detail panel hidden

**Strategy Selection:**
- Click strategy → detail panel slides in
- Sidebar slides out (hidden)
- Back button appears

**Detail Panel:**
- Full width (100vw)
- Single column layout
- Inputs stack vertically
- Chart below inputs
- Chart height: 300px

**Interactions:**
- Back button → returns to sidebar
- All inputs are tap-friendly (min 44px)
- Slider works with touch

**✓ Pass Criteria:**
- No horizontal scroll
- All text is readable (min 14px)
- Touch targets are large enough
- Transitions are smooth
- No overlap or cutoff content

---

### ✅ Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**✓ Pass Criteria:**
- Layout renders correctly
- Chart displays properly
- All interactions work
- No console errors

---

### ✅ Performance Testing

#### 1. Initial Load Time

**Action:** Open DevTools → Network → Reload page

**✓ Pass Criteria:**
- DOMContentLoaded < 500ms
- Full page load < 1500ms
- No unnecessary requests

---

#### 2. Chart Rendering

**Action:** Change parameter, measure time to chart update

**✓ Pass Criteria:**
- API call completes < 500ms
- Chart re-renders < 100ms
- Total update time < 600ms

---

#### 3. Slider Performance

**Action:** Move slider rapidly back and forth

**✓ Pass Criteria:**
- No lag or stuttering
- Debounce works (only calculates after 300ms pause)
- Chart updates smoothly

---

#### 4. Memory Leaks

**Action:**
1. Open DevTools → Memory
2. Take heap snapshot
3. Navigate between strategies 10 times
4. Take another heap snapshot
5. Compare

**✓ Pass Criteria:**
- Memory increase < 10MB
- No detached DOM nodes
- Event listeners are cleaned up

---

### ✅ Accessibility Testing

#### 1. Keyboard Navigation

**Action:**
1. Press Tab repeatedly
2. Navigate through all interactive elements
3. Press Enter to activate buttons

**✓ Pass Criteria:**
- All interactive elements are focusable
- Focus indicator is visible
- Tab order is logical
- Enter/Space activates buttons

---

#### 2. Screen Reader

**Action:** Enable screen reader (NVDA/JAWS/VoiceOver)

**✓ Pass Criteria:**
- All headings are announced
- Form labels are read correctly
- Button purposes are clear
- Chart has descriptive alt text or aria-label

---

#### 3. Color Contrast

**Action:** Use Chrome DevTools → Lighthouse → Accessibility

**✓ Pass Criteria:**
- All text has contrast ratio ≥ 4.5:1
- Large text (18px+) has ratio ≥ 3:1
- No contrast errors

---

### ✅ Error Handling Testing

#### 1. Network Error

**Action:**
1. Open DevTools → Network
2. Set throttling to "Offline"
3. Try to calculate payoff

**Expected Behavior:**
- Backend check times out (2 seconds)
- Automatically falls back to local calculations
- Chart updates normally
- No error message shown to user

**✓ Pass Criteria:**
- Graceful fallback
- User is not disrupted
- Console logs the fallback

---

#### 2. Invalid Input

**Action:**
1. Enter negative number in "Lot Size"
2. Try to calculate

**Expected Behavior:**
- Input validation prevents negative values
- Or: Backend returns 400 error
- Error message is shown
- Previous chart data remains

**✓ Pass Criteria:**
- Invalid inputs are caught
- User-friendly error message
- Application doesn't crash

---

#### 3. Backend Error (500)

**Action:**
1. Modify backend to throw error
2. Try to calculate payoff

**Expected Behavior:**
- Backend returns 500 error
- Frontend catches error in try-catch
- Falls back to local calculations
- Or: Shows error toast

**✓ Pass Criteria:**
- Error is caught
- User sees feedback
- Application continues working

---

### ✅ Data Accuracy Testing

#### 1. Covered Call Calculation

**Given:**
- Futures Price: 18000
- Futures Lot Size: 50
- Call Strike: 18500
- Call Premium: 200
- Call Lot Size: 50

**Verify at Price = 18000:**
- Expected P&L: +10,000
- (0 from futures + 200×50 from premium)

**Verify at Price = 18500:**
- Expected P&L: +35,000
- (500×50 from futures + 200×50 from premium)

**Verify at Price = 20000:**
- Expected P&L: +35,000 (capped)
- (2000×50 from futures - 1300×50 from call loss)

**✓ Pass Criteria:**
- All calculations match expected values
- Break-even point is accurate
- Max profit/loss are correct

---

#### 2. Bull Call Spread Calculation

**Given:**
- Long Call Strike: 18000
- Short Call Strike: 19000
- Long Call Premium: 300
- Short Call Premium: 150
- Lot Size: 50

**Verify at Price = 17000:**
- Expected P&L: -7,500
- (Net debit: 150×50 = -7,500)

**Verify at Price = 19000:**
- Expected P&L: +42,500
- (Max profit: 1000×50 - 7,500 = 42,500)

**✓ Pass Criteria:**
- Calculations are accurate
- Max profit = (spread - net debit) × lot size
- Max loss = net debit × lot size

---

## 🚀 Production Deployment Checklist

### Frontend

- [ ] Update `.env.production` with production API URL
- [ ] Run `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Test production URL
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS
- [ ] Test on real mobile devices

### Backend

- [ ] Update environment variables (PORT, CORS_ORIGIN, NODE_ENV)
- [ ] Run `npm run build` in backend directory
- [ ] Deploy to hosting (Railway/Render)
- [ ] Test all API endpoints
- [ ] Monitor logs for errors
- [ ] Set up health check monitoring
- [ ] Configure auto-restart on crash

### Post-Deployment

- [ ] Test health check: `curl https://api.yourdomain.com/api/health`
- [ ] Test payoff calculation from production frontend
- [ ] Test on multiple devices and browsers
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify CORS is configured correctly

---

## 📊 Success Metrics

### Performance
- ✅ Page load < 2 seconds
- ✅ API response < 500ms
- ✅ Chart update < 600ms
- ✅ Slider debounce: 300ms

### Responsive
- ✅ Works on mobile (320px+)
- ✅ Works on tablet (768px+)
- ✅ Works on desktop (1024px+)
- ✅ No horizontal scroll on any device

### Accessibility
- ✅ Lighthouse score > 90
- ✅ All WCAG AA criteria met
- ✅ Keyboard navigable
- ✅ Screen reader compatible

### Reliability
- ✅ 100% uptime (backend + frontend)
- ✅ Graceful degradation (backend fallback)
- ✅ Error rate < 1%
- ✅ No console errors

---

## 🐛 Common Issues & Solutions

### Issue: Chart not rendering

**Solution:**
- Check if `payoffData` is an array
- Verify Recharts is imported correctly
- Check console for errors
- Ensure ResponsiveContainer has height

### Issue: Backend connection fails

**Solution:**
- Verify backend is running on port 3001
- Check CORS configuration
- Update API URL in frontend
- Check firewall/network settings

### Issue: Mobile layout breaks

**Solution:**
- Check Tailwind breakpoint classes
- Verify `showMobileDetail` state logic
- Test in browser device emulation
- Check for hardcoded widths

### Issue: Calculations are wrong

**Solution:**
- Compare with manual calculation
- Check parameter parsing (string → number)
- Verify formula in calculations.ts
- Test with backend API directly (curl)

---

**Last Updated:** December 26, 2025  
**Version:** 1.0.0
