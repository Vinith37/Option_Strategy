# 🎯 Custom Strategy Builder - Complete Guide

## Overview

The Custom Strategy Builder is a powerful feature that allows you to create any options strategy by combining multiple legs (FUT, CE, PE) with full exit tracking and P&L calculations.

---

## Features

### ✅ **Unlimited Legs**
- Add as many legs as you need
- Mix and match: Futures, Calls, Puts
- Full control over each position

### ✅ **Three Instrument Types**
- **FUT** - Futures contracts
- **CE** - Call options
- **PE** - Put options

### ✅ **Buy or Sell Each Leg**
- **BUY** - Long position (green)
- **SELL** - Short position (red)

### ✅ **Exit Tracking**
- Track exit date for each leg
- Record exit prices
- Calculate realized P&L

### ✅ **Dynamic Payoff Diagram**
- Automatically adjusts to your strikes
- Intelligent price range calculation
- Real-time updates as you modify legs

### ✅ **Comprehensive P&L Display**
- Max Profit at expiration
- Max Loss at expiration
- Individual leg P&L on exit
- Total realized P&L

---

## Building a Strategy

### **Step 1: Add First Leg**

Click **"Add New Leg"** button to create your first position.

**Default Settings:**
- Type: CE (Call Option)
- Action: BUY
- Strike: 18,000
- Lot Size: 50
- Premium: 200

### **Step 2: Configure the Leg**

#### **For Options (CE/PE):**

**Fields:**
1. **Option Type** - Toggle between CE (Call) or PE (Put)
2. **Action** - BUY or SELL
3. **Instrument Type** - Options or Futures
4. **Strike Price** - The strike price of the option
5. **Lot Size** - Number of contracts
6. **Premium** - Premium paid (BUY) or received (SELL)

**Exit Tracking (Optional):**
7. **Exit Date** - When you closed the position
8. **Exit Price** - Price you sold/bought back at

#### **For Futures (FUT):**

**Fields:**
1. **Action** - BUY (long) or SELL (short)
2. **Instrument Type** - Select "Futures"
3. **Entry Price** - Price you entered at
4. **Lot Size** - Number of contracts

**Exit Tracking (Optional):**
5. **Exit Date** - When you closed the position
6. **Exit Price** - Price you exited at

### **Step 3: Add More Legs**

Click **"Add New Leg"** to add additional positions. Each leg is completely independent.

### **Step 4: View Payoff Diagram**

The chart updates automatically showing the combined P&L at expiration for all legs.

### **Step 5: Track Exits (Optional)**

Fill in exit prices for any legs you've closed to see realized P&L.

---

## Mathematical Formulas

### **Futures P&L**

#### **Long Futures (BUY):**
```
P&L = (Exit Price - Entry Price) × Lot Size
```

#### **Short Futures (SELL):**
```
P&L = (Entry Price - Exit Price) × Lot Size
```

**Example:**
```
BUY 100 Futures @ ₹18,000
Exit @ ₹18,500
P&L = (18,500 - 18,000) × 100 = +₹50,000 ✓
```

---

### **Call Option (CE) P&L**

#### **Long Call (BUY):**
```
At Expiration:
- If Price > Strike: P&L = (Price - Strike - Premium) × Lot Size
- If Price ≤ Strike: P&L = -Premium × Lot Size

At Exit:
P&L = (Exit Price - Premium Paid) × Lot Size
```

#### **Short Call (SELL):**
```
At Expiration:
- If Price > Strike: P&L = (Premium - (Price - Strike)) × Lot Size
- If Price ≤ Strike: P&L = Premium × Lot Size

At Exit:
P&L = (Premium Received - Exit Price) × Lot Size
```

**Example - Bought Call:**
```
BUY 50 CE @ Strike ₹18,500, Premium ₹200
Exit @ ₹400
P&L = (400 - 200) × 50 = +₹10,000 ✓
```

**Example - Sold Call:**
```
SELL 50 CE @ Strike ₹18,500, Premium ₹200
Exit @ ₹80
P&L = (200 - 80) × 50 = +₹6,000 ✓
```

---

### **Put Option (PE) P&L**

#### **Long Put (BUY):**
```
At Expiration:
- If Price < Strike: P&L = (Strike - Price - Premium) × Lot Size
- If Price ≥ Strike: P&L = -Premium × Lot Size

At Exit:
P&L = (Exit Price - Premium Paid) × Lot Size
```

#### **Short Put (SELL):**
```
At Expiration:
- If Price < Strike: P&L = (Premium - (Strike - Price)) × Lot Size
- If Price ≥ Strike: P&L = Premium × Lot Size

At Exit:
P&L = (Premium Received - Exit Price) × Lot Size
```

**Example - Bought Put:**
```
BUY 50 PE @ Strike ₹17,500, Premium ₹180
Exit @ ₹300
P&L = (300 - 180) × 50 = +₹6,000 ✓
```

**Example - Sold Put:**
```
SELL 50 PE @ Strike ₹17,500, Premium ₹180
Exit @ ₹50
P&L = (180 - 50) × 50 = +₹6,500 ✓
```

---

## Example Strategies

### **1. Custom Covered Call**

**Setup:**
```
Leg 1: BUY 100 FUT @ ₹18,000
Leg 2: SELL 100 CE @ Strike ₹18,500, Premium ₹200
```

**Payoff Characteristics:**
- Max Profit: ₹70,000 (at ₹18,500 or above)
- Max Loss: Unlimited downside
- Breakeven: ₹17,800

**Exit Example:**
```
Futures Exit @ ₹18,400
Call Exit @ ₹80

Leg 1 P&L: (18,400 - 18,000) × 100 = +₹40,000
Leg 2 P&L: (200 - 80) × 100 = +₹12,000
Total: +₹52,000 ✓
```

---

### **2. Custom Iron Condor**

**Setup:**
```
Leg 1: BUY 50 PE @ Strike ₹17,000, Premium ₹80
Leg 2: SELL 50 PE @ Strike ₹17,500, Premium ₹150
Leg 3: SELL 50 CE @ Strike ₹18,500, Premium ₹150
Leg 4: BUY 50 CE @ Strike ₹19,000, Premium ₹80
```

**Payoff Characteristics:**
- Max Profit: ₹11,000 (between ₹17,500 and ₹18,500)
- Max Loss: ₹14,000 (below ₹17,000 or above ₹19,000)
- Breakeven: ₹17,280 and ₹18,720

**Exit Example:**
```
All legs closed halfway through expiration:
Leg 1 Exit @ ₹40
Leg 2 Exit @ ₹70
Leg 3 Exit @ ₹70
Leg 4 Exit @ ₹40

Leg 1 P&L: (40 - 80) × 50 = -₹2,000
Leg 2 P&L: (150 - 70) × 50 = +₹4,000
Leg 3 P&L: (150 - 70) × 50 = +₹4,000
Leg 4 P&L: (40 - 80) × 50 = -₹2,000
Total: +₹4,000 ✓
```

---

### **3. Custom Straddle**

**Setup:**
```
Leg 1: BUY 50 CE @ Strike ₹18,000, Premium ₹250
Leg 2: BUY 50 PE @ Strike ₹18,000, Premium ₹240
```

**Payoff Characteristics:**
- Max Profit: Unlimited
- Max Loss: ₹24,500 (at ₹18,000)
- Breakeven: ₹17,510 and ₹18,490

**Exit Example:**
```
Big move up, close for profit:
CE Exit @ ₹600
PE Exit @ ₹50

Leg 1 P&L: (600 - 250) × 50 = +₹17,500
Leg 2 P&L: (50 - 240) × 50 = -₹9,500
Total: +₹8,000 ✓
```

---

### **4. Ratio Spread**

**Setup:**
```
Leg 1: BUY 50 CE @ Strike ₹18,000, Premium ₹300
Leg 2: SELL 100 CE @ Strike ₹18,500, Premium ₹150
```

**Payoff Characteristics:**
- Max Profit: ₹25,000 (at ₹18,500)
- Max Loss: Unlimited above ₹19,000
- Breakeven: ₹18,000 (below), ₹19,000 (above)

**Exit Example:**
```
Price at ₹18,300, close early:
Leg 1 Exit @ ₹400
Leg 2 Exit @ ₹100

Leg 1 P&L: (400 - 300) × 50 = +₹5,000
Leg 2 P&L: (150 - 100) × 100 = +₹5,000
Total: +₹10,000 ✓
```

---

### **5. Butterfly Spread**

**Setup:**
```
Leg 1: BUY 50 CE @ Strike ₹17,500, Premium ₹350
Leg 2: SELL 100 CE @ Strike ₹18,000, Premium ₹220
Leg 3: BUY 50 CE @ Strike ₹18,500, Premium ₹120
```

**Payoff Characteristics:**
- Max Profit: ₹15,000 (at ₹18,000)
- Max Loss: ₹10,000 (below ₹17,500 or above ₹18,500)
- Breakeven: ₹17,700 and ₹18,300

**Exit Example:**
```
Near max profit, close early:
Leg 1 Exit @ ₹500
Leg 2 Exit @ ₹0 (expires worthless)
Leg 3 Exit @ ₹0 (expires worthless)

Leg 1 P&L: (500 - 350) × 50 = +₹7,500
Leg 2 P&L: (220 - 0) × 100 = +₹22,000
Leg 3 P&L: (0 - 120) × 50 = -₹6,000
Total: +₹23,500 ✓
```

---

## UI Features

### **Leg Card Color Coding**

- **Green gradient** - Call options (CE)
- **Red gradient** - Put options (PE)
- **Blue gradient** - Futures (FUT)

### **Action Badges**

- **Green button** - BUY (long position)
- **Red button** - SELL (short position)

### **Summary Tags**

Each leg shows a quick summary:
- Action (BUY/SELL)
- Instrument type (CE/PE/FUT)
- Strike or entry price
- Lot size
- Premium (for options)

### **Exit P&L Display**

When you add exit prices, a new section appears:

```
┌─────────────────────────────────────┐
│ 📈 Exit P&L Calculation            │
│ Based on exit prices for each leg   │
├─────────────────────────────────────┤
│ Leg 1: BUY Call                    │
│ Premium: ₹250 → Exit: ₹600         │
│ Lot Size: 50                        │
│                         +₹17,500    │
├─────────────────────────────────────┤
│ Leg 2: BUY Put                     │
│ Premium: ₹240 → Exit: ₹50          │
│ Lot Size: 50                        │
│                          -₹9,500    │
├─────────────────────────────────────┤
│ TOTAL REALIZED P&L                  │
│          +₹8,000                    │
│ Exit Date: 2025-01-15               │
│ 2 legs exited                       │
└─────────────────────────────────────┘
```

---

## Dynamic Payoff Chart

### **Intelligent Price Range**

The chart automatically calculates the optimal price range:

1. **Collects all reference prices:**
   - All strike prices from options
   - All entry prices from futures

2. **Determines range:**
   - Min price = lowest reference price
   - Max price = highest reference price
   - Buffer = 50% of range (minimum 3,000)

3. **Creates price axis:**
   - Start = (min - buffer), rounded to nearest 100
   - End = (max + buffer), rounded to nearest 100
   - Step = dynamically calculated for ~100 points

**Example:**
```
Legs:
- CE @ ₹17,500
- CE @ ₹18,000
- CE @ ₹18,500

Min: 17,500
Max: 18,500
Range: 1,000
Buffer: 500
Start: 17,000
End: 19,000
Step: 20
```

---

## Advanced Use Cases

### **1. Earnings Volatility Play**

**Setup:**
```
Before earnings announcement:
Leg 1: BUY 100 CE @ ₹18,000, Premium ₹300
Leg 2: BUY 100 PE @ ₹18,000, Premium ₹280
```

**Strategy:**
- Expect big move either direction
- Close immediately after announcement
- Profit from volatility expansion

### **2. Hedged Futures Position**

**Setup:**
```
Leg 1: BUY 200 FUT @ ₹18,000
Leg 2: BUY 100 PE @ ₹17,500, Premium ₹150 (hedge)
Leg 3: SELL 100 CE @ ₹18,800, Premium ₹180 (income)
```

**Strategy:**
- Long futures with downside protection
- Generate income from short call
- Capped upside but protected downside

### **3. Calendar Spread Adjustments**

**Setup:**
```
Initial position:
Leg 1: SELL 50 CE @ ₹18,500, Premium ₹200 (near expiry)
Leg 2: BUY 50 CE @ ₹18,500, Premium ₹280 (far expiry)

After near expiry expires:
Exit Leg 1 @ ₹0
Keep Leg 2 running
```

**Strategy:**
- Profit from time decay differential
- Track each leg's exit separately
- Roll into new positions

---

## Tips and Best Practices

### **✅ Do:**

1. **Start Simple**
   - Begin with 2-3 legs
   - Understand each component
   - Build complexity gradually

2. **Use Clear Labels**
   - Note action (BUY/SELL)
   - Check strike prices
   - Verify lot sizes match

3. **Track Exits Diligently**
   - Record exit date
   - Note actual prices
   - Review P&L vs. expected

4. **Verify Calculations**
   - Check payoff diagram makes sense
   - Validate max profit/loss
   - Confirm breakevens

5. **Save Your Strategies**
   - Use notes field
   - Document rationale
   - Track performance over time

### **❌ Don't:**

1. **Mix Up Actions**
   - Selling when you meant to buy
   - Check BUY/SELL carefully

2. **Forget Lot Size Differences**
   - Ratio spreads need different sizes
   - Verify each leg independently

3. **Ignore Exit Tracking**
   - Always record actual exits
   - Compare to planned exits
   - Learn from differences

4. **Overcomplicate Unnecessarily**
   - More legs ≠ better strategy
   - Simple often works best

---

## Keyboard Shortcuts

### **Navigation:**
- Tab - Move to next field
- Shift+Tab - Move to previous field
- Enter - Confirm input

### **Quick Actions:**
- Click leg number - Jump to that leg
- Click trash icon - Remove leg
- Click "Add New Leg" - Create position

---

## Common Questions

### **Q: Can I save partial exits?**
A: Yes! Only fill in exit prices for legs you've closed. Leave others blank to keep them in the strategy.

### **Q: What if I close legs at different times?**
A: Each leg has its own exit date field. Record them separately.

### **Q: How do I replicate a predefined strategy?**
A: Just add the same legs! For example, Covered Call = 1 long futures + 1 short call.

### **Q: Can I have different lot sizes?**
A: Absolutely! This enables ratio spreads, hedged positions, and complex strategies.

### **Q: Does the chart update immediately?**
A: Yes! Every change to legs updates the payoff diagram in real-time.

### **Q: Can I mix expiration dates?**
A: The payoff diagram shows all positions at the same expiry date, but you can track different exit dates for P&L.

---

## Calculation Examples

### **Example 1: Three-Leg Strategy**

**Setup:**
```
Leg 1: BUY 50 FUT @ ₹18,000
Leg 2: SELL 50 CE @ Strike ₹18,500, Premium ₹200
Leg 3: BUY 50 PE @ Strike ₹17,500, Premium ₹150
```

**At Expiration (Price = ₹18,200):**
```
Leg 1: (18,200 - 18,000) × 50 = +₹10,000
Leg 2: (200 - 0) × 50 = +₹10,000 (OTM)
Leg 3: (0 - 150) × 50 = -₹7,500 (OTM)
Total: +₹12,500
```

**Early Exit (Price = ₹17,800):**
```
Futures Exit @ ₹17,800
CE Exit @ ₹50
PE Exit @ ₹80

Leg 1: (17,800 - 18,000) × 50 = -₹10,000
Leg 2: (200 - 50) × 50 = +₹7,500
Leg 3: (80 - 150) × 50 = -₹3,500
Total: -₹6,000
```

---

### **Example 2: Complex Iron Butterfly**

**Setup:**
```
Leg 1: BUY 50 PE @ Strike ₹17,500, Premium ₹100
Leg 2: SELL 100 PE @ Strike ₹18,000, Premium ₹180
Leg 3: SELL 100 CE @ Strike ₹18,000, Premium ₹170
Leg 4: BUY 50 CE @ Strike ₹18,500, Premium ₹90
```

**At Expiration (Price = ₹18,000):**
```
Leg 1: (0 - 100) × 50 = -₹5,000 (OTM)
Leg 2: (180 - 0) × 100 = +₹18,000 (ATM)
Leg 3: (170 - 0) × 100 = +₹17,000 (ATM)
Leg 4: (0 - 90) × 50 = -₹4,500 (OTM)
Total: +₹25,500 (MAX PROFIT)
```

**Early Exit (Price = ₹18,300):**
```
All legs closed:
PE ₹17,500 Exit @ ₹20
PE ₹18,000 Exit @ ₹60
CE ₹18,000 Exit @ ₹320
CE ₹18,500 Exit @ ₹30

Leg 1: (20 - 100) × 50 = -₹4,000
Leg 2: (180 - 60) × 100 = +₹12,000
Leg 3: (170 - 320) × 100 = -₹15,000
Leg 4: (30 - 90) × 50 = -₹3,000
Total: -₹10,000 (LOSS due to price move)
```

---

## Summary

The Custom Strategy Builder gives you:

✅ **Complete flexibility** - Build any strategy you can imagine  
✅ **Accurate math** - All calculations match real-world payoffs  
✅ **Exit tracking** - Know your realized P&L  
✅ **Visual feedback** - See payoff diagram in real-time  
✅ **Professional tools** - Everything you need for complex strategies  

**Start building your custom strategies today!** 🚀📈
