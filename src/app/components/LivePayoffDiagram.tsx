import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Minus, Plus } from "lucide-react";

/**
 * LivePayoffDiagram - Self-contained payoff chart with direct slider connection
 * 
 * Features:
 * - Slider directly controls chart range
 * - Instant recalculation (no API calls)
 * - Smooth animations
 * - No external dependencies
 * 
 * Calculation Logic:
 * - minPrice = underlyingPrice × (1 - range/100)
 * - maxPrice = underlyingPrice × (1 + range/100)
 * - Generate 100 price points between min/max
 * - Calculate P&L for each price
 */

interface PayoffDataPoint {
  price: number;
  pnl: number;
}

interface LivePayoffDiagramProps {
  strategyType?: "bull-call-spread" | "iron-condor" | "long-straddle" | "custom";
  // Optional custom calculation function
  calculatePayoff?: (price: number, underlyingPrice: number) => number;
}

// ============================================================================
// CALCULATION LOGIC (Separated from UI)
// ============================================================================

/**
 * Calculate payoff for Bull Call Spread
 * Buy lower strike call, sell higher strike call
 */
const calculateBullCallSpread = (
  currentPrice: number,
  underlyingPrice: number
): number => {
  const longStrike = underlyingPrice - 500; // Buy call at lower strike
  const shortStrike = underlyingPrice + 500; // Sell call at higher strike
  const longPremium = 200; // Premium paid
  const shortPremium = 100; // Premium received
  const netDebit = longPremium - shortPremium;

  let pnl = -netDebit;

  // Long call payoff
  if (currentPrice > longStrike) {
    pnl += currentPrice - longStrike;
  }

  // Short call payoff
  if (currentPrice > shortStrike) {
    pnl -= currentPrice - shortStrike;
  }

  return Math.round(pnl);
};

/**
 * Calculate payoff for Iron Condor
 * Sell OTM put spread + sell OTM call spread
 */
const calculateIronCondor = (
  currentPrice: number,
  underlyingPrice: number
): number => {
  const putLongStrike = underlyingPrice - 1000;
  const putShortStrike = underlyingPrice - 500;
  const callShortStrike = underlyingPrice + 500;
  const callLongStrike = underlyingPrice + 1000;

  const creditReceived = 150; // Net credit from selling spreads

  let pnl = creditReceived;

  // Put spread
  if (currentPrice < putShortStrike) {
    pnl -= putShortStrike - currentPrice;
  }
  if (currentPrice < putLongStrike) {
    pnl += putLongStrike - currentPrice;
  }

  // Call spread
  if (currentPrice > callShortStrike) {
    pnl -= currentPrice - callShortStrike;
  }
  if (currentPrice > callLongStrike) {
    pnl += currentPrice - callLongStrike;
  }

  return Math.round(pnl);
};

/**
 * Calculate payoff for Long Straddle
 * Buy ATM call + buy ATM put
 */
const calculateLongStraddle = (
  currentPrice: number,
  underlyingPrice: number
): number => {
  const strike = underlyingPrice;
  const callPremium = 300;
  const putPremium = 300;
  const totalCost = callPremium + putPremium;

  let pnl = -totalCost;

  // Call payoff
  if (currentPrice > strike) {
    pnl += currentPrice - strike;
  }

  // Put payoff
  if (currentPrice < strike) {
    pnl += strike - currentPrice;
  }

  return Math.round(pnl);
};

/**
 * Generate payoff data for given price range
 */
const generatePayoffData = (
  underlyingPrice: number,
  priceRangePercent: number,
  calculatePayoff: (price: number, underlyingPrice: number) => number,
  numPoints: number = 100
): PayoffDataPoint[] => {
  // Calculate price range
  const minPrice = underlyingPrice * (1 - priceRangePercent / 100);
  const maxPrice = underlyingPrice * (1 + priceRangePercent / 100);
  const step = (maxPrice - minPrice) / (numPoints - 1);

  const data: PayoffDataPoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    const price = minPrice + step * i;
    const pnl = calculatePayoff(price, underlyingPrice);

    data.push({
      price: Math.round(price),
      pnl,
    });
  }

  return data;
};

/**
 * Calculate break-even points
 */
const calculateBreakEvenPoints = (data: PayoffDataPoint[]): number[] => {
  const breakEvens: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];

    // Check if P&L crosses zero
    if ((prev.pnl <= 0 && curr.pnl > 0) || (prev.pnl >= 0 && curr.pnl < 0)) {
      // Linear interpolation to find exact break-even
      const slope = (curr.pnl - prev.pnl) / (curr.price - prev.price);
      if (slope !== 0) {
        const breakEvenPrice = prev.price - prev.pnl / slope;
        breakEvens.push(Math.round(breakEvenPrice));
      }
    }
  }

  return breakEvens;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LivePayoffDiagram({
  strategyType = "bull-call-spread",
  calculatePayoff: customCalculatePayoff,
}: LivePayoffDiagramProps) {
  // State
  const [underlyingPrice, setUnderlyingPrice] = useState(18000);
  const [priceRangePercent, setPriceRangePercent] = useState(30);
  const [isAnimating, setIsAnimating] = useState(false);

  // Select calculation function based on strategy type
  const calculatePayoffFn = useMemo(() => {
    if (customCalculatePayoff) return customCalculatePayoff;

    switch (strategyType) {
      case "iron-condor":
        return calculateIronCondor;
      case "long-straddle":
        return calculateLongStraddle;
      case "bull-call-spread":
      default:
        return calculateBullCallSpread;
    }
  }, [strategyType, customCalculatePayoff]);

  // Generate payoff data (recalculated instantly when slider moves)
  const payoffData = useMemo(() => {
    return generatePayoffData(
      underlyingPrice,
      priceRangePercent,
      calculatePayoffFn
    );
  }, [underlyingPrice, priceRangePercent, calculatePayoffFn]);

  // Calculate derived metrics
  const breakEvenPoints = useMemo(
    () => calculateBreakEvenPoints(payoffData),
    [payoffData]
  );

  const maxProfit = useMemo(() => {
    if (payoffData.length === 0) return 0;
    return Math.max(...payoffData.map((d) => d.pnl));
  }, [payoffData]);

  const maxLoss = useMemo(() => {
    if (payoffData.length === 0) return 0;
    return Math.min(...payoffData.map((d) => d.pnl));
  }, [payoffData]);

  // Calculate price range display
  const priceRange = useMemo(() => {
    const min = Math.round(underlyingPrice * (1 - priceRangePercent / 100));
    const max = Math.round(underlyingPrice * (1 + priceRangePercent / 100));
    return { min, max };
  }, [underlyingPrice, priceRangePercent]);

  // Trigger animation effect when data changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, [payoffData]);

  // Handlers
  const handleUnderlyingPriceChange = (newPrice: number) => {
    if (newPrice > 0) {
      setUnderlyingPrice(newPrice);
    }
  };

  const incrementPrice = (amount: number) => {
    const newPrice = underlyingPrice + amount;
    if (newPrice > 0) {
      setUnderlyingPrice(newPrice);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = parseInt(e.target.value);
    setPriceRangePercent(newRange);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Price</p>
          <p className="font-bold text-base mb-2">
            {formatCurrency(data.price)}
          </p>
          <p className="text-xs text-gray-400 mb-1">P&L</p>
          <p
            className={`font-bold text-base ${
              data.pnl >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {formatCurrency(data.pnl)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Strategy name display
  const strategyName =
    strategyType === "bull-call-spread"
      ? "Bull Call Spread"
      : strategyType === "iron-condor"
      ? "Iron Condor"
      : strategyType === "long-straddle"
      ? "Long Straddle"
      : "Custom Strategy";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Live Payoff Diagram
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {strategyName} • Drag the slider to see instant updates
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Underlying Price */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm mb-3">
              Underlying Price
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => incrementPrice(-100)}
                className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Decrease price by 100"
              >
                <Minus className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
              </button>

              <input
                type="number"
                value={underlyingPrice}
                onChange={(e) =>
                  handleUnderlyingPriceChange(parseInt(e.target.value) || 0)
                }
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-center font-bold text-xl transition-all"
                min="0"
                step="100"
              />

              <button
                onClick={() => incrementPrice(100)}
                className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Increase price by 100"
              >
                <Plus className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-700 font-semibold text-sm">
                Price Range (%)
              </label>
              <span className="text-blue-600 font-bold text-2xl tabular-nums">
                {priceRangePercent}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={priceRangePercent}
              onChange={handleRangeChange}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-live focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Adjust price range percentage"
            />

            {/* Range Display */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-700 font-medium">
              <span>{formatCurrency(priceRange.min)}</span>
              <span className="text-gray-400 text-xs uppercase tracking-wide">
                Range
              </span>
              <span>{formatCurrency(priceRange.max)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        {/* Max Profit */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4">
          <div className="text-green-700 text-xs sm:text-sm font-semibold mb-1 uppercase tracking-wide">
            Max Profit
          </div>
          <div className="text-green-900 font-bold text-lg sm:text-xl md:text-2xl">
            {formatCurrency(maxProfit)}
          </div>
        </div>

        {/* Max Loss */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-4">
          <div className="text-red-700 text-xs sm:text-sm font-semibold mb-1 uppercase tracking-wide">
            Max Loss
          </div>
          <div className="text-red-900 font-bold text-lg sm:text-xl md:text-2xl">
            {formatCurrency(maxLoss)}
          </div>
        </div>

        {/* Break-even Points */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="text-blue-700 text-xs sm:text-sm font-semibold mb-1 uppercase tracking-wide">
            Break-even {breakEvenPoints.length > 1 ? "Points" : "Point"}
          </div>
          <div className="text-blue-900 font-bold text-base sm:text-lg md:text-xl">
            {breakEvenPoints.length > 0
              ? breakEvenPoints.map(formatCurrency).join(", ")
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] transition-opacity duration-200"
        style={{ opacity: isAnimating ? 0.95 : 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={payoffData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />

            {/* X-Axis: Numeric price values only */}
            <XAxis
              dataKey="price"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => `₹${Math.round(value).toLocaleString()}`}
              stroke="#6B7280"
              style={{ fontSize: "12px", fontWeight: "600" }}
              tickLine={false}
              axisLine={{ stroke: "#D1D5DB", strokeWidth: 2 }}
              label={{
                value: "Stock Price at Expiration",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: "14px", fontWeight: "700", fill: "#374151" },
              }}
            />

            {/* Y-Axis: P&L */}
            <YAxis
              tickFormatter={(value) => `₹${Math.round(value).toLocaleString()}`}
              stroke="#6B7280"
              style={{ fontSize: "12px", fontWeight: "600" }}
              tickLine={false}
              axisLine={{ stroke: "#D1D5DB", strokeWidth: 2 }}
              label={{
                value: "Profit / Loss (₹)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "14px", fontWeight: "700", fill: "#374151" },
              }}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Zero line (Break-even) */}
            <ReferenceLine
              y={0}
              stroke="#9CA3AF"
              strokeWidth={3}
              strokeDasharray="5 5"
              label={{
                value: "Break-even Line",
                position: "insideTopRight",
                fill: "#6B7280",
                fontSize: 13,
                fontWeight: 700,
              }}
            />

            {/* Break-even point markers */}
            {breakEvenPoints.map((point, idx) => (
              <ReferenceLine
                key={`breakeven-${idx}`}
                x={point}
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `BE: ${formatCurrency(point)}`,
                  position: "top",
                  fill: "#1E40AF",
                  fontSize: 12,
                  fontWeight: 700,
                  offset: 10,
                }}
              />
            ))}

            {/* Payoff line with smooth animation */}
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#8B5CF6"
              strokeWidth={4}
              dot={false}
              activeDot={{
                r: 8,
                fill: "#8B5CF6",
                stroke: "#fff",
                strokeWidth: 3,
              }}
              isAnimationActive={true}
              animationDuration={400}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Live Update Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-medium">
          Live Updates • {payoffData.length} data points calculated
        </span>
      </div>

      {/* Custom Slider Styling */}
      <style>{`
        .slider-live::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border: 4px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }

        .slider-live::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.7);
        }

        .slider-live::-webkit-slider-thumb:active {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        .slider-live::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border: 4px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }

        .slider-live::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.7);
        }

        .slider-live::-webkit-slider-runnable-track {
          background: linear-gradient(
            to right,
            #DBEAFE 0%,
            #3B82F6 ${((priceRangePercent - 10) / 90) * 100}%,
            #E5E7EB ${((priceRangePercent - 10) / 90) * 100}%,
            #E5E7EB 100%
          );
          height: 12px;
          border-radius: 6px;
        }

        .slider-live::-moz-range-track {
          background: #E5E7EB;
          height: 12px;
          border-radius: 6px;
        }

        .slider-live::-moz-range-progress {
          background: linear-gradient(to right, #DBEAFE, #3B82F6);
          height: 12px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
