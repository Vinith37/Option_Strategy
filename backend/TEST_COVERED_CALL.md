# Covered Call Strategy - Test Cases

## Test Parameters
```
Lot Size: 50
Futures Price: ₹18,000
Call Strike: ₹18,500
Premium: ₹200
```

## Expected Calculations

### Test 1: Price = ₹17,000 (Below Entry)
```
Futures P&L = (17,000 - 18,000) × 50 = -50,000
Call P&L = 200 × 50 = 10,000
Total P&L = -40,000 ✓
```

### Test 2: Price = ₹17,800 (Break-Even)
```
Futures P&L = (17,800 - 18,000) × 50 = -10,000
Call P&L = 200 × 50 = 10,000
Total P&L = 0 ✓
```

### Test 3: Price = ₹18,000 (At Entry)
```
Futures P&L = (18,000 - 18,000) × 50 = 0
Call P&L = 200 × 50 = 10,000
Total P&L = 10,000 ✓
```

### Test 4: Price = ₹18,500 (At Strike - Max Profit Begins)
```
Futures P&L = (18,500 - 18,000) × 50 = 25,000
Call P&L = 200 × 50 = 10,000
Total P&L = 35,000 ✓
```

### Test 5: Price = ₹19,000 (Above Strike)
```
Futures P&L = (19,000 - 18,000) × 50 = 50,000
Call P&L = (200 - (19,000 - 18,500)) × 50 = (200 - 500) × 50 = -15,000
Total P&L = 35,000 ✓
```

### Test 6: Price = ₹20,000 (Far Above Strike)
```
Futures P&L = (20,000 - 18,000) × 50 = 100,000
Call P&L = (200 - (20,000 - 18,500)) × 50 = (200 - 1,500) × 50 = -65,000
Total P&L = 35,000 ✓
```

### Test 7: Price = ₹21,600 (Max Range)
```
Futures P&L = (21,600 - 18,000) × 50 = 180,000
Call P&L = (200 - (21,600 - 18,500)) × 50 = (200 - 3,100) × 50 = -145,000
Total P&L = 35,000 ✓
```

### Test 8: Price = ₹14,400 (Min Range)
```
Futures P&L = (14,400 - 18,000) × 50 = -180,000
Call P&L = 200 × 50 = 10,000
Total P&L = -170,000 ✓
```

## cURL Test Command

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
  }' | jq '.[] | select(.price == 17000 or .price == 17800 or .price == 18000 or .price == 18500 or .price == 19000)'
```

## Expected Output (Sample Points)

```json
[
  {
    "price": 14400,
    "pnl": -170000
  },
  {
    "price": 17000,
    "pnl": -40000
  },
  {
    "price": 17800,
    "pnl": 0
  },
  {
    "price": 18000,
    "pnl": 10000
  },
  {
    "price": 18500,
    "pnl": 35000
  },
  {
    "price": 19000,
    "pnl": 35000
  },
  {
    "price": 20000,
    "pnl": 35000
  },
  {
    "price": 21600,
    "pnl": 35000
  }
]
```

## Visual Verification

When you open the frontend:

1. **Max Profit Card** should show: **₹35,000**
2. **Max Loss Card** should show: **-₹170,000** (at price ₹14,400)
3. **Payoff Chart**:
   - Should be a diagonal line from bottom-left
   - Crosses X-axis at ₹17,800 (break-even)
   - Becomes flat horizontal line at ₹18,500
   - Stays flat at ₹35,000 for all prices above ₹18,500

## Validation Checklist

- [ ] Backend returns 100 data points
- [ ] Price range: 14,400 to 21,600
- [ ] Break-even at ₹17,800 (pnl = 0)
- [ ] Max profit at ₹35,000 (when price ≥ ₹18,500)
- [ ] Max loss at -₹170,000 (when price = ₹14,400)
- [ ] Payoff is capped at ₹35,000 for all prices above strike
- [ ] Chart displays correctly in frontend
- [ ] Parameter changes trigger recalculation
