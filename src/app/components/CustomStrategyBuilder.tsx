import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CustomLeg, LegType, LegAction, PayoffDataPoint } from "../types/strategy";
import { Highlighter } from "./Highlighter";

// Custom Strategy Builder Component - Build unlimited custom option strategies
interface CustomStrategyBuilderProps {
  onLegsChange: (legs: CustomLeg[]) => void;
  onPayoffChange: (data: PayoffDataPoint[]) => void;
}

export function CustomStrategyBuilder({ onLegsChange, onPayoffChange }: CustomStrategyBuilderProps) {
  const [legs, setLegs] = useState<CustomLeg[]>([]);

  const generateLegId = () => {
    return `leg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addLeg = () => {
    const newLeg: CustomLeg = {
      id: generateLegId(),
      type: "CE",
      action: "BUY",
      strikePrice: 18000,
      lotSize: 50,
      premium: 200,
    };
    const updatedLegs = [...legs, newLeg];
    setLegs(updatedLegs);
    onLegsChange(updatedLegs);
    calculatePayoff(updatedLegs);
  };

  const removeLeg = (id: string) => {
    const updatedLegs = legs.filter((leg) => leg.id !== id);
    setLegs(updatedLegs);
    onLegsChange(updatedLegs);
    calculatePayoff(updatedLegs);
  };

  const updateLeg = (id: string, updates: Partial<CustomLeg>) => {
    const updatedLegs = legs.map((leg) =>
      leg.id === id ? { ...leg, ...updates } : leg
    );
    setLegs(updatedLegs);
    onLegsChange(updatedLegs);
    calculatePayoff(updatedLegs);
  };

  const calculatePayoff = (currentLegs: CustomLeg[]) => {
    if (currentLegs.length === 0) {
      onPayoffChange([{ price: 18000, pnl: 0 }]);
      return;
    }

    const data: PayoffDataPoint[] = [];
    
    // ========== IMPROVED DYNAMIC PRICE RANGE CALCULATION ==========
    // Collect all relevant prices from legs
    const prices = currentLegs.flatMap(leg => [
      leg.strikePrice || 0,
      leg.entryPrice || 0
    ]).filter(p => p > 0);
    
    // If no valid prices, use a sensible default
    if (prices.length === 0) {
      onPayoffChange([{ price: 100, pnl: 0 }]);
      return;
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const midPrice = (minPrice + maxPrice) / 2;
    
    // Calculate range with intelligent buffering
    let range = maxPrice - minPrice;
    
    // If all strikes/prices are the same, create a range around that price
    if (range === 0) {
      range = minPrice * 0.4; // 40% of the price as range
    }
    
    // Dynamic buffer calculation based on price level
    // For low prices (< 1000): use 50% buffer
    // For medium prices (1000-10000): use 40% buffer
    // For high prices (> 10000): use 30% buffer
    let bufferPercent = 0.5;
    if (midPrice > 1000 && midPrice <= 10000) {
      bufferPercent = 0.4;
    } else if (midPrice > 10000) {
      bufferPercent = 0.3;
    }
    
    const buffer = range * bufferPercent;
    
    // Calculate start and end with rounding appropriate to price level
    let roundingFactor = 1;
    if (midPrice >= 10000) {
      roundingFactor = 100; // Round to nearest 100 for high prices
    } else if (midPrice >= 1000) {
      roundingFactor = 10; // Round to nearest 10 for medium prices
    } else if (midPrice >= 100) {
      roundingFactor = 5; // Round to nearest 5 for low prices
    } else {
      roundingFactor = 1; // Round to nearest 1 for very low prices
    }
    
    const start = Math.max(roundingFactor, Math.floor((minPrice - buffer) / roundingFactor) * roundingFactor);
    const end = Math.ceil((maxPrice + buffer) / roundingFactor) * roundingFactor;
    
    // Calculate optimal step size for ~100-150 data points
    const totalRange = end - start;
    let step = totalRange / 120; // Target 120 points
    
    // Round step to a sensible increment based on price level
    if (step < 1) {
      step = Math.max(0.1, Math.round(step * 10) / 10); // Minimum 0.1 step
    } else if (step < 10) {
      step = Math.max(1, Math.round(step));
    } else if (step < 100) {
      step = Math.round(step / 5) * 5; // Round to nearest 5
    } else {
      step = Math.round(step / 10) * 10; // Round to nearest 10
    }
    
    // Ensure we have at least some data points
    if (step === 0 || totalRange / step > 500) {
      step = totalRange / 100;
    }
    
    // Generate payoff data points
    for (let price = start; price <= end; price += step) {
      // Round price to avoid floating point issues
      const roundedPrice = Math.round(price * 100) / 100;
      let totalPnL = 0;

      currentLegs.forEach((leg) => {
        const lotSize = leg.lotSize || 0;

        if (leg.type === "FUT") {
          // Futures P&L calculation
          const entryPrice = leg.entryPrice || 0;
          const futPnL = (roundedPrice - entryPrice) * lotSize;
          totalPnL += leg.action === "BUY" ? futPnL : -futPnL;
        } else if (leg.type === "CE") {
          // Call Option P&L calculation
          const strike = leg.strikePrice || 0;
          const premium = leg.premium || 0;
          const intrinsic = Math.max(0, roundedPrice - strike);
          
          if (leg.action === "BUY") {
            // Bought call: Profit when price > strike + premium
            totalPnL += (intrinsic - premium) * lotSize;
          } else {
            // Sold call: Profit when price < strike + premium
            totalPnL += (premium - intrinsic) * lotSize;
          }
        } else if (leg.type === "PE") {
          // Put Option P&L calculation
          const strike = leg.strikePrice || 0;
          const premium = leg.premium || 0;
          const intrinsic = Math.max(0, strike - roundedPrice);
          
          if (leg.action === "BUY") {
            // Bought put: Profit when price < strike - premium
            totalPnL += (intrinsic - premium) * lotSize;
          } else {
            // Sold put: Profit when price > strike - premium
            totalPnL += (premium - intrinsic) * lotSize;
          }
        }
      });

      // Round P&L to avoid floating point issues
      const roundedPnL = Math.round(totalPnL * 100) / 100;
      data.push({ price: roundedPrice, pnl: roundedPnL });
    }

    onPayoffChange(data);
  };

  return (
    <div className="space-y-6">
      {/* Add Leg Button */}
      <button
        onClick={addLeg}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-6 py-4 font-semibold text-base hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
        Add New Leg
      </button>

      {/* Legs List */}
      {legs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" strokeWidth={2} />
          </div>
          <p className="text-gray-500 font-medium mb-1">No legs added yet</p>
          <p className="text-gray-400 text-sm">Click "Add New Leg" to start building your strategy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {legs.map((leg, index) => (
            <LegCard
              key={leg.id}
              leg={leg}
              index={index}
              onUpdate={(updates) => updateLeg(leg.id, updates)}
              onRemove={() => removeLeg(leg.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LegCardProps {
  leg: CustomLeg;
  index: number;
  onUpdate: (updates: Partial<CustomLeg>) => void;
  onRemove: () => void;
}

function LegCard({ leg, index, onUpdate, onRemove }: LegCardProps) {
  const getLegColor = (type: LegType) => {
    switch (type) {
      case "CE":
        return "from-green-100 to-emerald-100 border-green-300";
      case "PE":
        return "from-red-100 to-rose-100 border-red-300";
      case "FUT":
        return "from-blue-100 to-indigo-100 border-blue-300";
    }
  };

  const getActionColor = (action: LegAction) => {
    return action === "BUY" ? "bg-green-500" : "bg-red-500";
  };

  const getLegTypeName = (type: LegType) => {
    switch (type) {
      case "CE":
        return "Call Option";
      case "PE":
        return "Put Option";
      case "FUT":
        return "Futures";
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getLegColor(leg.type)} border-2 rounded-2xl p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-700 shadow-sm">
            {index + 1}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">
              <Highlighter color={leg.type === "CE" ? "green" : leg.type === "PE" ? "pink" : "blue"}>
                Leg {index + 1}
              </Highlighter>
            </h4>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              {getLegTypeName(leg.type)} • {leg.action}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all group"
          aria-label="Remove leg"
        >
          <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" strokeWidth={2.5} />
        </button>
      </div>

      {/* Leg Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option Type Toggle - Only for CE/PE */}
        {leg.type !== "FUT" && (
          <div>
            <label className="block text-gray-700 font-medium text-sm mb-2">
              Option Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ type: "CE" })}
                className={`flex-1 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  leg.type === "CE"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white text-gray-600 border-2 border-gray-300 hover:border-green-400 hover:text-green-600"
                }`}
              >
                CE
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ type: "PE" })}
                className={`flex-1 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  leg.type === "PE"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white text-gray-600 border-2 border-gray-300 hover:border-red-400 hover:text-red-600"
                }`}
              >
                PE
              </button>
            </div>
          </div>
        )}

        {/* Action Toggle */}
        <div>
          <label className="block text-gray-700 font-medium text-sm mb-2">
            Action
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ action: "BUY" })}
              className={`flex-1 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                leg.action === "BUY"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white text-gray-600 border-2 border-gray-300 hover:border-green-400 hover:text-green-600"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ action: "SELL" })}
              className={`flex-1 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                leg.action === "SELL"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white text-gray-600 border-2 border-gray-300 hover:border-red-400 hover:text-red-600"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Leg Type Selector - Only for switching to/from FUT */}
        <div className={leg.type === "FUT" ? "md:col-span-2" : "md:col-span-2"}>
          <label className="block text-gray-700 font-medium text-sm mb-2">
            Instrument Type
          </label>
          <select
            value={leg.type}
            onChange={(e) => {
              const newType = e.target.value as LegType;
              const updates: Partial<CustomLeg> = { type: newType };
              
              if (newType === "FUT") {
                updates.entryPrice = leg.strikePrice || 620;
                updates.strikePrice = undefined;
                updates.premium = undefined;
              } else {
                updates.strikePrice = leg.entryPrice || 620;
                updates.premium = leg.premium || 10;
                updates.entryPrice = undefined;
              }
              
              onUpdate(updates);
            }}
            className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          >
            <option value="CE">Options (Call/Put)</option>
            <option value="FUT">Futures</option>
          </select>
        </div>

        {/* Strike Price (for CE/PE) or Entry Price (for FUT) */}
        {leg.type === "FUT" ? (
          <div>
            <label className="block text-gray-700 font-medium text-sm mb-2">
              Entry Price
            </label>
            <input
              type="number"
              step="0.01"
              value={leg.entryPrice || ""}
              onChange={(e) => onUpdate({ entryPrice: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Enter price"
            />
          </div>
        ) : (
          <div>
            <label className="block text-gray-700 font-medium text-sm mb-2">
              {leg.type === "CE" ? "Call Strike Price" : "Put Strike Price"}
            </label>
            <input
              type="number"
              step="0.01"
              value={leg.strikePrice || ""}
              onChange={(e) => onUpdate({ strikePrice: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Enter strike"
            />
          </div>
        )}

        {/* Lot Size */}
        <div>
          <label className="block text-gray-700 font-medium text-sm mb-2">
            Lot Size
          </label>
          <input
            type="number"
            step="1"
            value={leg.lotSize || ""}
            onChange={(e) => onUpdate({ lotSize: parseFloat(e.target.value) || 0 })}
            className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter lot size"
          />
        </div>

        {/* Premium (for CE/PE only) */}
        {leg.type !== "FUT" && (
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium text-sm mb-2">
              {leg.type === "CE" ? "Call" : "Put"} Premium ({leg.action === "BUY" ? "Paid" : "Received"})
            </label>
            <input
              type="number"
              step="0.01"
              value={leg.premium || ""}
              onChange={(e) => onUpdate({ premium: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Enter premium"
            />
          </div>
        )}
        
        {/* Exit Tracking Section */}
        <div className="md:col-span-2 pt-4 border-t-2 border-white/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h5 className="text-gray-800 font-bold text-sm">Exit Tracking (Optional)</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exit Date */}
            <div>
              <label className="block text-gray-700 font-medium text-xs mb-2">
                Exit Date
              </label>
              <input
                type="text"
                value={leg.exitDate || ""}
                onChange={(e) => onUpdate({ exitDate: e.target.value })}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="YYYY-MM-DD (optional)"
              />
            </div>
            
            {/* Exit Price */}
            <div>
              <label className="block text-gray-700 font-medium text-xs mb-2">
                Exit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={leg.exitPrice || ""}
                onChange={(e) => onUpdate({ exitPrice: parseFloat(e.target.value) || undefined })}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder={leg.type === "FUT" ? "Exit futures price" : "Exit option price"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leg Summary Badge */}
      <div className="mt-4 pt-4 border-t-2 border-white/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${getActionColor(leg.action)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {leg.action}
          </span>
          <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full border border-gray-300">
            {leg.type}
          </span>
          <span className="text-gray-700 text-sm font-medium">
            {leg.type === "FUT" 
              ? `@ ₹${(leg.entryPrice || 0).toLocaleString()}` 
              : `Strike: ₹${(leg.strikePrice || 0).toLocaleString()}`
            }
          </span>
          <span className="text-gray-700 text-sm font-medium">
            Qty: {(leg.lotSize || 0).toLocaleString()}
          </span>
          {leg.type !== "FUT" && (
            <span className="text-gray-700 text-sm font-medium">
              Premium: ₹{(leg.premium || 0).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
