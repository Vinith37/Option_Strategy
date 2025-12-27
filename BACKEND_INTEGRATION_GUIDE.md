# Backend Integration Guide

## Overview
This guide explains how to connect your backend API to the Options Strategy Builder frontend.

---

## Key Files

### 1. **`/src/app/components/StrategyDetailPanel.tsx`**
   - Main component where backend API calls should be made
   - Contains the integration point in `handleParamChange` function (line ~77)

### 2. **`/src/app/utils/strategyConfig.ts`**
   - Defines all strategy parameters and their default values
   - Used to know what parameters each strategy expects

### 3. **`/src/app/types/strategy.ts`**
   - Contains TypeScript interfaces for data structures
   - Important types: `PayoffDataPoint`, `CustomLeg`, `StrategyType`, `LegType`, `LegAction`

---

## API Integration Point

### Location: `/src/app/components/StrategyDetailPanel.tsx`

```typescript
const handleParamChange = (id: string, value: string) => {
  setParams(prev => ({ ...prev, [id]: value }));
  
  // TODO: Call backend API here to calculate payoff based on new parameters
  // Example:
  // fetchPayoffData({ strategyType, ...prev, [id]: value })
  //   .then(data => setPayoffData(data));
};
```

---

## Request Payload Structure

### For Regular Strategies

Send these parameters to your backend:

```typescript
{
  strategyType: string,      // e.g., "covered-call", "bull-call-spread", etc.
  entryDate: string,         // Format: "YYYY-MM-DD"
  expiryDate: string,        // Format: "YYYY-MM-DD"
  parameters: {              // Strategy-specific parameters
    [paramId: string]: string
  }
}
```

### For Custom Strategy

Send these parameters:

```typescript
{
  strategyType: "custom-strategy",
  entryDate: string,
  expiryDate: string,
  customLegs: [
    {
      id: string,
      type: "CE" | "PE" | "FUT",
      action: "BUY" | "SELL",
      strikePrice?: number,    // For CE/PE only
      entryPrice?: number,     // For FUT only
      lotSize: number,
      premium?: number         // For CE/PE only
    }
  ]
}
```

---

## Response Format

Your backend should return an array of payoff data points:

```typescript
PayoffDataPoint[] = [
  {
    price: number,    // Underlying price (e.g., 15000, 15500, 16000...)
    pnl: number       // Profit/Loss at that price
  },
  // ... more data points for the full price range
]
```

**Example:**
```json
[
  { "price": 15000, "pnl": -5000 },
  { "price": 15500, "pnl": -3000 },
  { "price": 16000, "pnl": -1000 },
  { "price": 16500, "pnl": 1000 },
  { "price": 17000, "pnl": 3000 }
]
```

---

## Strategy Parameters by Type

### 1. **Covered Call** (`covered-call`)
```typescript
{
  lotSize: string,           // e.g., "50"
  futuresPrice: string,      // e.g., "18000"
  callStrike: string,        // e.g., "18500"
  premium: string            // e.g., "200"
}
```

### 2. **Bull Call Spread** (`bull-call-spread`)
```typescript
{
  longCallStrike: string,    // e.g., "18000"
  shortCallStrike: string,   // e.g., "19000"
  lotSize: string,           // e.g., "50"
  longCallPremium: string,   // e.g., "300"
  shortCallPremium: string   // e.g., "150"
}
```

### 3. **Iron Condor** (`iron-condor`)
```typescript
{
  lotSize: string,           // e.g., "50"
  putBuyStrike: string,      // e.g., "17000"
  putSellStrike: string,     // e.g., "17500"
  callSellStrike: string,    // e.g., "18500"
  callBuyStrike: string,     // e.g., "19000"
  netPremium: string         // e.g., "100"
}
```

### 4. **Long Straddle** (`long-straddle`)
```typescript
{
  strikePrice: string,       // e.g., "18000"
  callLotSize: string,       // e.g., "50"
  putLotSize: string,        // e.g., "50"
  callPremium: string,       // e.g., "250"
  putPremium: string         // e.g., "240"
}
```

### 5. **Protective Put** (`protective-put`)
```typescript
{
  stockLotSize: string,      // e.g., "50"
  stockPrice: string,        // e.g., "18000"
  putStrike: string,         // e.g., "17500"
  putLotSize: string,        // e.g., "50"
  putPremium: string         // e.g., "150"
}
```

### 6. **Butterfly Spread** (`butterfly-spread`)
```typescript
{
  lotSize: string,           // e.g., "50"
  lowerStrike: string,       // e.g., "17500"
  middleStrike: string,      // e.g., "18000"
  upperStrike: string,       // e.g., "18500"
  lowerPremium: string,      // e.g., "300"
  middlePremium: string,     // e.g., "200"
  upperPremium: string       // e.g., "120"
}
```

---

## Example Implementation

### Example API Call Function

Create a new file: `/src/app/api/payoffApi.ts`

```typescript
import { StrategyType, PayoffDataPoint, CustomLeg } from "../types/strategy";

interface PayoffRequest {
  strategyType: StrategyType;
  entryDate: string;
  expiryDate: string;
  parameters?: Record<string, string>;
  customLegs?: CustomLeg[];
}

export async function fetchPayoffData(request: PayoffRequest): Promise<PayoffDataPoint[]> {
  try {
    const response = await fetch('YOUR_BACKEND_API_URL/calculate-payoff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payoff data');
    }

    const data: PayoffDataPoint[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payoff data:', error);
    // Return default/empty data on error
    return [{ price: 18000, pnl: 0 }];
  }
}
```

### Updated `handleParamChange` in StrategyDetailPanel.tsx

```typescript
import { fetchPayoffData } from "../api/payoffApi";

const handleParamChange = (id: string, value: string) => {
  const newParams = { ...params, [id]: value };
  setParams(newParams);
  
  // Call backend API to calculate payoff
  fetchPayoffData({
    strategyType,
    entryDate,
    expiryDate,
    parameters: newParams,
  }).then(data => {
    setPayoffData(data);
  });
};
```

### Also Update on Date Changes

```typescript
// Update when entry date changes
<input
  type="date"
  value={entryDate}
  onChange={(e) => {
    setEntryDate(e.target.value);
    
    // Recalculate payoff with new date
    fetchPayoffData({
      strategyType,
      entryDate: e.target.value,
      expiryDate,
      parameters: params,
    }).then(data => setPayoffData(data));
  }}
  className="..."
/>

// Update when expiry date changes
<input
  type="date"
  value={expiryDate}
  onChange={(e) => {
    setExpiryDate(e.target.value);
    
    // Recalculate payoff with new date
    fetchPayoffData({
      strategyType,
      entryDate,
      expiryDate: e.target.value,
      parameters: params,
    }).then(data => setPayoffData(data));
  }}
  className="..."
/>
```

---

## Custom Strategy Integration

For Custom Strategy, the integration point is in `/src/app/components/CustomStrategyBuilder.tsx`:

```typescript
// Already integrated - updates are passed via onPayoffChange callback
// The CustomStrategyBuilder has its own internal calculation
// You may want to replace this with backend calls too
```

---

## Save Strategy API Call

When the "Save Strategy" button is clicked, you can save to backend:

```typescript
// In StrategyDetailPanel.tsx, update the Save button onClick:

onClick={async () => {
  setIsSaving(true);
  
  const strategyData = {
    name: strategyName,
    type: strategyType,
    entryDate,
    expiryDate,
    parameters: params,
    ...(isCustomStrategy && { customLegs }),
    notes,
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Call your backend API
    const response = await fetch('YOUR_BACKEND_API_URL/save-strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategyData),
    });
    
    if (response.ok) {
      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  } catch (error) {
    console.error('Error saving strategy:', error);
    setIsSaving(false);
  }
}}
```

---

## Testing Checklist

- [ ] Backend receives correct strategyType
- [ ] Backend receives all required parameters for each strategy
- [ ] Backend receives entryDate and expiryDate
- [ ] Backend returns array of PayoffDataPoint objects
- [ ] Chart updates when parameters change
- [ ] Chart updates when dates change
- [ ] Max Profit/Max Loss cards display correct values
- [ ] Custom Strategy sends customLegs array
- [ ] Save button sends complete strategy data

---

## Notes

1. **All parameter values are strings** in the frontend (from input fields)
   - Convert to numbers in your backend as needed

2. **Price range for payoff calculation**
   - Suggested range: 15000 to 21000
   - Interval: 500 (or smaller for smoother curves)
   - Adjust based on your needs

3. **Error Handling**
   - Add loading states during API calls
   - Show error messages if API fails
   - Provide fallback data if calculation fails

4. **Performance**
   - Consider debouncing API calls if user types quickly
   - Cache results if parameters haven't changed
   - Use WebSockets for real-time updates if needed

---

## Quick Start

1. Create `/src/app/api/payoffApi.ts` with the example code above
2. Replace `YOUR_BACKEND_API_URL` with your actual API endpoint
3. Import `fetchPayoffData` in `StrategyDetailPanel.tsx`
4. Update `handleParamChange` function as shown above
5. Update date change handlers as shown above
6. Test with one strategy first, then expand to all

---

## Support

For questions or issues, refer to:
- Type definitions: `/src/app/types/strategy.ts`
- Strategy configs: `/src/app/utils/strategyConfig.ts`
- Main component: `/src/app/components/StrategyDetailPanel.tsx`
