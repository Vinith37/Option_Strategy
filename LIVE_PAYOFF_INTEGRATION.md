# 🔗 LivePayoffDiagram Integration Guide

## Quick Integration Options

You have **three ways** to use the LivePayoffDiagram component in your Options Strategy Builder app.

---

## Option 1: Replace Existing App (Demo Mode)

### Update `/src/index.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LivePayoffApp } from './app/LivePayoffApp';
import './styles/fonts.css';
import './styles/theme.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LivePayoffApp />
  </React.StrictMode>
);
```

**Result:** Shows the full demo page with strategy selector and live diagrams.

---

## Option 2: Add to Existing Strategy Detail Panel

### Update `/src/app/components/StrategyDetailPanel.tsx`

Replace the existing chart section with the LivePayoffDiagram:

```tsx
import { LivePayoffDiagram } from "./LivePayoffDiagram";

export function StrategyDetailPanel({ strategyName, strategyType }: StrategyDetailPanelProps) {
  // ... existing code ...
  
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
      {/* ... existing header and controls ... */}
      
      {/* Replace existing chart with LivePayoffDiagram */}
      <LivePayoffDiagram 
        strategyType={strategyType as any}
      />
    </div>
  );
}
```

**Result:** Each strategy in your sidebar will use the live diagram.

---

## Option 3: Add as New Tab/Section

### Update `/src/app/App.tsx`

Add a toggle to switch between views:

```tsx
import { useState } from "react";
import { LivePayoffDemo } from "./components/LivePayoffDemo";
import { TopNav } from "./components/TopNav";
// ... other imports ...

export default function App() {
  const [showLiveDemo, setShowLiveDemo] = useState(false);
  
  if (showLiveDemo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <button
          onClick={() => setShowLiveDemo(false)}
          className="m-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ← Back to Strategy Builder
        </button>
        <LivePayoffDemo />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      {/* Add toggle button */}
      <button
        onClick={() => setShowLiveDemo(true)}
        className="m-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
      >
        View Live Payoff Demo
      </button>
      {/* ... existing app code ... */}
    </div>
  );
}
```

**Result:** Toggle between your main app and the live demo.

---

## Standalone Component Usage

### Basic Usage

```tsx
import { LivePayoffDiagram } from "./components/LivePayoffDiagram";

export function MyPage() {
  return (
    <div className="p-8">
      <LivePayoffDiagram strategyType="bull-call-spread" />
    </div>
  );
}
```

### With Custom Strategy

```tsx
<LivePayoffDiagram
  calculatePayoff={(price, underlyingPrice) => {
    // Your custom calculation
    const strike = underlyingPrice;
    const premium = 300;
    
    let pnl = -premium;
    if (price > strike) {
      pnl += (price - strike);
    }
    
    return Math.round(pnl);
  }}
/>
```

---

## Mapping Strategy Types

If you want to integrate with your existing strategies, map them:

```tsx
const strategyTypeMapping = {
  "covered-call": "bull-call-spread", // Use similar strategy
  "bull-call-spread": "bull-call-spread",
  "iron-condor": "iron-condor",
  "long-straddle": "long-straddle",
  "protective-put": "bull-call-spread", // Use similar
  "butterfly-spread": "iron-condor", // Use similar
  "custom-strategy": undefined // Use custom calculation
};

// Then in your component:
<LivePayoffDiagram 
  strategyType={strategyTypeMapping[strategyType]}
/>
```

---

## Custom Calculations for Each Strategy

Create a calculation function for each of your strategies:

```tsx
const getCalculationFunction = (strategyType: StrategyType) => {
  switch (strategyType) {
    case "covered-call":
      return (price: number, underlyingPrice: number) => {
        const strike = underlyingPrice + 500;
        const premium = 150;
        
        let pnl = premium; // Credit received
        
        // Short call loss
        if (price > strike) {
          pnl -= (price - strike);
        }
        
        // Long stock profit
        pnl += (price - underlyingPrice);
        
        return Math.round(pnl);
      };
      
    case "protective-put":
      return (price: number, underlyingPrice: number) => {
        const strike = underlyingPrice - 500;
        const premium = 200;
        
        let pnl = -premium; // Debit paid
        
        // Long put profit
        if (price < strike) {
          pnl += (strike - price);
        }
        
        // Long stock profit/loss
        pnl += (price - underlyingPrice);
        
        return Math.round(pnl);
      };
      
    case "butterfly-spread":
      return (price: number, underlyingPrice: number) => {
        const lowerStrike = underlyingPrice - 1000;
        const middleStrike = underlyingPrice;
        const upperStrike = underlyingPrice + 1000;
        
        let pnl = 0;
        
        // Long 1 lower strike call
        if (price > lowerStrike) pnl += (price - lowerStrike);
        pnl -= 400; // Premium
        
        // Short 2 middle strike calls
        if (price > middleStrike) pnl -= 2 * (price - middleStrike);
        pnl += 2 * 250; // Premium
        
        // Long 1 upper strike call
        if (price > upperStrike) pnl += (price - upperStrike);
        pnl -= 100; // Premium
        
        return Math.round(pnl);
      };
      
    default:
      return undefined;
  }
};

// Usage:
<LivePayoffDiagram 
  calculatePayoff={getCalculationFunction(strategyType)}
/>
```

---

## Complete Integration Example

### `/src/app/components/StrategyWithLiveDiagram.tsx`

```tsx
import { LivePayoffDiagram } from "./LivePayoffDiagram";
import { StrategyType } from "../types/strategy";

interface StrategyWithLiveDiagramProps {
  strategyName: string;
  strategyType: StrategyType;
}

export function StrategyWithLiveDiagram({ 
  strategyName, 
  strategyType 
}: StrategyWithLiveDiagramProps) {
  
  // Map your strategy types to live diagram types
  const getLiveDiagramStrategy = () => {
    switch (strategyType) {
      case "bull-call-spread":
        return "bull-call-spread";
      case "iron-condor":
        return "iron-condor";
      case "long-straddle":
        return "long-straddle";
      default:
        return "bull-call-spread"; // Default fallback
    }
  };
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Strategy Header */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {strategyName}
        </h2>
        <p className="text-gray-600">
          Live payoff diagram with instant updates
        </p>
      </div>
      
      {/* Live Diagram */}
      <LivePayoffDiagram 
        strategyType={getLiveDiagramStrategy() as any}
      />
    </div>
  );
}
```

---

## Testing Your Integration

### 1. Import the Component

```bash
# Component is already in your project
# No additional installation needed
```

### 2. Use in Your App

```tsx
import { LivePayoffDiagram } from "./components/LivePayoffDiagram";
```

### 3. Verify It Works

- Drag the slider
- Chart should update instantly
- No console errors
- Smooth animations

---

## Troubleshooting

### Issue: "Module not found"

**Solution:** Check import path:
```tsx
import { LivePayoffDiagram } from "./components/LivePayoffDiagram";
// NOT: from "./LivePayoffDiagram"
```

### Issue: Chart not updating

**Solution:** Check props are passed correctly:
```tsx
<LivePayoffDiagram 
  strategyType="bull-call-spread"  // Must be valid type
/>
```

### Issue: TypeScript errors

**Solution:** Update interface:
```tsx
interface LivePayoffDiagramProps {
  strategyType?: "bull-call-spread" | "iron-condor" | "long-straddle" | "custom";
  calculatePayoff?: (price: number, underlyingPrice: number) => number;
}
```

---

## Summary

✅ **Three integration options available**
✅ **Works with existing strategies**
✅ **Custom calculation support**
✅ **No external dependencies needed**
✅ **Production-ready component**

Choose the option that best fits your needs!

---

## Quick Start Recommendation

**For fastest testing:**

1. Create a new page:
   ```tsx
   // /src/app/pages/LiveDemoPage.tsx
   import { LivePayoffDemo } from "../components/LivePayoffDemo";
   
   export function LiveDemoPage() {
     return <LivePayoffDemo />;
   }
   ```

2. Add route or button to navigate to it

3. See it in action immediately!

**Then integrate into your main app once you're happy with it.**
