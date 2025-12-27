# ✅ Covered Call - Decoupled Lot Sizes

## What Changed

The Covered Call strategy now has **separate lot sizes** for the futures position and the call option, giving you more flexibility in how you structure the trade.

---

## New Parameters

### Before (Old):
```
- Lot Size (applied to both futures and call)
- Futures Price
- Call Strike Price
- Premium Received
```

### After (New):
```
- Futures Lot Size (independent)
- Futures Entry Price
- Call Lot Size (independent)
- Call Strike Price
- Call Premium Received
```

---

## Why This Matters

### Scenario 1: Fully Covered Call
```
Futures Lot Size: 50
Call Lot Size: 50
```
**Result**: Every futures contract is "covered" by a call option. This is the classic covered call.

### Scenario 2: Partially Covered Call
```
Futures Lot Size: 100
Call Lot Size: 50
```
**Result**: You own 100 futures but only sold calls on 50. The remaining 50 futures have unlimited upside.

### Scenario 3: Over-Covered (Ratio Call Write)
```
Futures Lot Size: 50
Call Lot Size: 100
```
**Result**: You own 50 futures but sold calls on 100. The extra 50 calls are "naked" and have unlimited risk.

---

## Mathematical Formulas

### Total P&L Calculation
```
Total P&L = Futures P&L + Short Call P&L
```

### Futures P&L
```
Futures P&L = (Current Price - Entry Price) × Futures Lot Size
```

### Short Call P&L
```
If Current Price ≤ Call Strike:
    Call P&L = Premium × Call Lot Size

If Current Price > Call Strike:
    Call P&L = Premium × Call Lot Size - (Current Price - Strike) × Call Lot Size
```

---

## Examples

### Example 1: Fully Covered (Classic)

**Parameters**:
- Futures Lot Size: 50
- Futures Price: ₹18,000
- Call Lot Size: 50
- Call Strike: ₹18,500
- Premium: ₹200

**At Price = ₹19,000**:
```
Futures P&L = (19,000 - 18,000) × 50 = ₹50,000
Call P&L = (200 - (19,000 - 18,500)) × 50 = -₹15,000
Total P&L = ₹35,000 (capped)
```

**Max Profit**: ₹35,000 (when price ≥ ₹18,500)
**Max Loss**: Unlimited (theoretically)
**Break-Even**: ₹17,800

---

### Example 2: Partially Covered

**Parameters**:
- Futures Lot Size: 100
- Futures Price: ₹18,000
- Call Lot Size: 50 (only half covered)
- Call Strike: ₹18,500
- Premium: ₹200

**At Price = ₹19,000**:
```
Futures P&L = (19,000 - 18,000) × 100 = ₹100,000
Call P&L = (200 - (19,000 - 18,500)) × 50 = -₹15,000
Total P&L = ₹85,000 (NOT fully capped!)
```

**At Price = ₹20,000**:
```
Futures P&L = (20,000 - 18,000) × 100 = ₹200,000
Call P&L = (200 - (20,000 - 18,500)) × 50 = -₹75,000
Total P&L = ₹125,000 (still growing!)
```

**Max Profit**: UNLIMITED (because 50 futures are uncovered)
**Max Loss**: Unlimited
**Break-Even**: ₹17,900

**Payoff Characteristics**:
- Below ₹18,500: Same as classic covered call
- Above ₹18,500: Continues to rise (50% of normal futures profit)

---

### Example 3: Over-Covered (Ratio Call Write)

**Parameters**:
- Futures Lot Size: 50
- Futures Price: ₹18,000
- Call Lot Size: 100 (double coverage)
- Call Strike: ₹18,500
- Premium: ₹200

**At Price = ₹19,000**:
```
Futures P&L = (19,000 - 18,000) × 50 = ₹50,000
Call P&L = (200 - (19,000 - 18,500)) × 100 = -₹30,000
Total P&L = ₹20,000
```

**At Price = ₹20,000**:
```
Futures P&L = (20,000 - 18,000) × 50 = ₹100,000
Call P&L = (200 - (20,000 - 18,500)) × 100 = -₹130,000
Total P&L = -₹30,000 (LOSSES!)
```

**Max Profit**: ₹35,000 (at strike price ₹18,500)
**Max Loss**: UNLIMITED (naked call risk!)
**Break-Even**: ₹17,800 (downside) and ₹18,850 (upside)

**⚠️ WARNING**: This strategy has unlimited risk above the upper break-even!

---

## Risk Profiles

### Classic Covered Call (1:1 Ratio)
```
Futures: 50, Calls: 50

Risk:   ✓ Limited upside (capped at strike)
        ✓ Unlimited downside (futures risk)
        ✓ Suitable for neutral to slightly bullish
```

### Partially Covered (2:1 Ratio)
```
Futures: 100, Calls: 50

Risk:   ✓ Partial upside (50% of futures gains above strike)
        ✓ Unlimited downside (futures risk)
        ✓ Suitable for moderately bullish
```

### Over-Covered / Ratio Call Write (1:2 Ratio)
```
Futures: 50, Calls: 100

Risk:   ⚠️ LIMITED upside (capped at strike)
        ⚠️ UNLIMITED downside (futures risk)
        ⚠️ UNLIMITED upside risk (naked calls)
        ⚠️ Only for experienced traders!
```

---

## UI Changes

### Input Fields (New Order):
1. **Futures Lot Size** - How many futures contracts to buy
2. **Futures Entry Price** - Entry price for futures
3. **Call Lot Size** - How many call contracts to sell
4. **Call Strike Price** - Strike price for calls
5. **Call Premium Received** - Premium per call

### Visual Separation:
The fields are now organized in a logical flow:
- **Futures section** (Lot Size + Entry Price)
- **Call Option section** (Lot Size + Strike + Premium)

---

## Testing

### Test 1: Verify Fully Covered
1. Set Futures Lot Size: 50
2. Set Call Lot Size: 50
3. All other defaults
4. **Expected**: Chart shows max profit ₹35,000 (flat above ₹18,500)

### Test 2: Verify Partially Covered
1. Set Futures Lot Size: 100
2. Set Call Lot Size: 50
3. All other defaults
4. **Expected**: Chart continues rising above ₹18,500 (not flat)

### Test 3: Verify Over-Covered
1. Set Futures Lot Size: 50
2. Set Call Lot Size: 100
3. All other defaults
4. **Expected**: Chart turns negative above ~₹18,850

---

## Code Changes

### Frontend:
- ✅ `/src/app/utils/strategyConfig.ts` - Updated parameters
- ✅ `/src/app/utils/localCalculations.ts` - Updated calculation logic

### Backend:
- ✅ `/backend/src/utils/calculations.ts` - Updated calculation logic

### No Changes Needed:
- StrategyDetailPanel (automatically reads new config)
- API layer (parameters passed through)

---

## Backward Compatibility

**Old parameters are NOT compatible** with the new structure. If you have saved strategies, they will need to be recreated with the new parameters.

**Migration**:
- Old `lotSize` → New `futuresLotSize` AND `callLotSize`
- Default behavior: Both set to 50 (fully covered)

---

## Use Cases

### Conservative Income Generation
```
Futures: 50, Calls: 50
Strategy: Classic covered call
Goal: Generate premium income with capped upside
```

### Bullish with Income
```
Futures: 100, Calls: 50
Strategy: Partially covered
Goal: Keep some upside potential while generating income
```

### Advanced Income (High Risk)
```
Futures: 50, Calls: 75
Strategy: Ratio call write
Goal: Maximize premium income (expert traders only)
```

---

## Summary

✅ **More Flexibility**: Separate lot sizes for futures and calls
✅ **More Strategies**: Classic, partial, ratio call writes
✅ **Same Math**: Calculations remain accurate and precise
✅ **Clear Labels**: Input fields clearly labeled
✅ **Real-time Updates**: Chart updates immediately with changes

**The Covered Call strategy is now more powerful and flexible!** 🎯📈
