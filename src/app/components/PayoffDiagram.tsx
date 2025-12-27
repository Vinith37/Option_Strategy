import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceArea 
} from "recharts";
import { Minus, Plus, TrendingUp } from "lucide-react";
import { PayoffDataPoint } from "../types/strategy";
import { Highlighter } from "./Highlighter";

/**
 * PayoffDiagram Component - Interactive payoff chart with real-time updates
 * 
 * Features:
 * - Real-time chart updates as user changes inputs
 * - Smooth animations (no snapping)
 * - Debounced slider for performance
 * - Responsive design (mobile → desktop)
 * - Break-even point visualization
 * - Price range controls with live feedback
 * 
 * Props:
 * - data: PayoffDataPoint[] - Chart data from calculations
 * - isLoading?: boolean - Shows loading state
 * - onPriceRangeChange?: (price: number, rangePercent: number) => void
 * - initialUnderlyingPrice?: number
 * - initialPriceRange?: number
 */

interface PayoffDiagramProps {
  data: PayoffDataPoint[];
  isLoading?: boolean;
  onPriceRangeChange?: (underlyingPrice: number, priceRangePercent: number) => void;
  initialUnderlyingPrice?: number;
  initialPriceRange?: number;
}

// Calculation utilities separated from UI
const calculateBreakEvenPoints = (data: PayoffDataPoint[]): number[] => {
  const breakEvens: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    
    // Check if P&L crosses zero
    if ((prev.pnl <= 0 && curr.pnl > 0) || (prev.pnl >= 0 && curr.pnl < 0)) {
      // Linear interpolation to find exact break-even price
      const slope = (curr.pnl - prev.pnl) / (curr.price - prev.price);
      const breakEvenPrice = prev.price - (prev.pnl / slope);
      breakEvens.push(Math.round(breakEvenPrice));
    }
  }
  
  return breakEvens;
};

const calculateMaxProfit = (data: PayoffDataPoint[]): number => {
  if (data.length === 0) return 0;
  return Math.max(...data.map(d => d.pnl));
};

const calculateMaxLoss = (data: PayoffDataPoint[]): number => {
  if (data.length === 0) return 0;
  return Math.min(...data.map(d => d.pnl));
};

const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString('en-IN')}`;
};

export function PayoffDiagram({
  data,
  isLoading = false,
  onPriceRangeChange,
  initialUnderlyingPrice = 18000,
  initialPriceRange = 30
}: PayoffDiagramProps) {
  // State for price range controls
  const [underlyingPrice, setUnderlyingPrice] = useState(initialUnderlyingPrice);
  const [priceRangePercent, setPriceRangePercent] = useState(initialPriceRange);
  
  // State for smooth animations
  const [chartData, setChartData] = useState<PayoffDataPoint[]>(data);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate derived values using memoization for performance
  const breakEvenPoints = useMemo(() => calculateBreakEvenPoints(chartData), [chartData]);
  const maxProfit = useMemo(() => calculateMaxProfit(chartData), [chartData]);
  const maxLoss = useMemo(() => calculateMaxLoss(chartData), [chartData]);
  
  // Calculate price range display
  const priceRange = useMemo(() => {
    const range = underlyingPrice * (priceRangePercent / 100);
    const min = Math.round(underlyingPrice - range);
    const max = Math.round(underlyingPrice + range);
    return { min, max, range };
  }, [underlyingPrice, priceRangePercent]);
  
  // Calculate X-axis ticks for uniform display
  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const step = range / 9; // 10 ticks total
    
    const ticks: number[] = [];
    for (let i = 0; i < 10; i++) {
      const tick = Math.round(minPrice + (step * i));
      ticks.push(tick);
    }
    
    return ticks;
  }, [chartData]);
  
  // Smoothly update chart data when prop data changes
  useEffect(() => {
    if (data.length > 0) {
      setIsAnimating(true);
      
      // Small delay to trigger animation
      const timer = setTimeout(() => {
        setChartData(data);
        setIsAnimating(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [data]);
  
  // Debounced callback to parent component
  const notifyPriceRangeChange = useCallback((price: number, range: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (onPriceRangeChange) {
        onPriceRangeChange(price, range);
      }
    }, 300); // 300ms debounce
  }, [onPriceRangeChange]);
  
  // Handle underlying price changes
  const handleUnderlyingPriceChange = (newPrice: number) => {
    if (newPrice > 0) {
      setUnderlyingPrice(newPrice);
      notifyPriceRangeChange(newPrice, priceRangePercent);
    }
  };
  
  // Handle price increment/decrement
  const incrementPrice = (amount: number) => {
    const newPrice = underlyingPrice + amount;
    handleUnderlyingPriceChange(newPrice);
  };
  
  // Handle range slider changes with immediate visual feedback
  const handleRangeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = parseInt(e.target.value);
    setPriceRangePercent(newRange);
    
    // Clear existing timer
    if (sliderTimerRef.current) {
      clearTimeout(sliderTimerRef.current);
    }
    
    // Debounce the API call, but update UI immediately
    sliderTimerRef.current = setTimeout(() => {
      if (onPriceRangeChange) {
        onPriceRangeChange(underlyingPrice, newRange);
      }
    }, 150); // Shorter debounce for slider (150ms)
  };
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (sliderTimerRef.current) {
        clearTimeout(sliderTimerRef.current);
      }
    };
  }, []);
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Price</p>
          <p className="font-bold text-base mb-2">{formatCurrency(data.price)}</p>
          <p className="text-xs text-gray-400 mb-1">P&L</p>
          <p className={`font-bold text-base ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(data.pnl)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl">
            <Highlighter color="purple">
              Payoff Diagram
            </Highlighter>
          </h3>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Updating...</span>
          </div>
        )}
      </div>

      {/* Price Range Controls */}
      <div className="mb-6 md:mb-8 bg-gray-50 rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-gray-200">
        <h4 className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-4">
          Price Range Controls
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Underlying Price Input */}
          <div>
            <label className="block text-gray-700 font-medium text-sm mb-2">
              Underlying Price
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => incrementPrice(-100)}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Decrease price by 100"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" strokeWidth={2.5} />
              </button>
              
              <input
                type="number"
                value={underlyingPrice}
                onChange={(e) => handleUnderlyingPriceChange(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-center font-bold text-lg transition-all"
                min="0"
                step="100"
              />
              
              <button
                onClick={() => incrementPrice(100)}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Increase price by 100"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700 font-medium text-sm">
                Price Range (%)
              </label>
              <span className="text-blue-600 font-bold text-lg">
                {priceRangePercent}%
              </span>
            </div>
            
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={priceRangePercent}
              onChange={handleRangeSliderChange}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-custom focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Adjust price range percentage"
            />
            
            {/* Range Display */}
            <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <span className="font-medium">{formatCurrency(priceRange.min)}</span>
              <span className="text-gray-400">Range</span>
              <span className="font-medium">{formatCurrency(priceRange.max)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        {/* Max Profit */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
          <div className="text-green-600 text-xs sm:text-sm font-medium mb-1">
            Max Profit
          </div>
          <div className="text-green-800 font-bold text-base sm:text-lg md:text-xl">
            {formatCurrency(maxProfit)}
          </div>
        </div>

        {/* Max Loss */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4">
          <div className="text-red-600 text-xs sm:text-sm font-medium mb-1">
            Max Loss
          </div>
          <div className="text-red-800 font-bold text-base sm:text-lg md:text-xl">
            {formatCurrency(maxLoss)}
          </div>
        </div>

        {/* Break-even Points */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 col-span-2 md:col-span-1">
          <div className="text-blue-600 text-xs sm:text-sm font-medium mb-1">
            Break-even {breakEvenPoints.length > 1 ? 'Points' : 'Point'}
          </div>
          <div className="text-blue-800 font-bold text-base sm:text-lg md:text-xl">
            {breakEvenPoints.length > 0 
              ? breakEvenPoints.map(formatCurrency).join(', ')
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div 
        className="relative h-[300px] sm:h-[400px] md:h-[530px] transition-opacity duration-300"
        style={{ opacity: isAnimating ? 0.7 : 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              vertical={false}
            />
            
            <XAxis
              dataKey="price"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={xAxisTicks}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              stroke="#6B7280"
              style={{ fontSize: '12px', fontWeight: '500' }}
              tickLine={false}
              axisLine={{ stroke: '#D1D5DB' }}
            />
            
            <YAxis
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              stroke="#6B7280"
              style={{ fontSize: '12px', fontWeight: '500' }}
              tickLine={false}
              axisLine={{ stroke: '#D1D5DB' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Zero line */}
            <ReferenceLine 
              y={0} 
              stroke="#9CA3AF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: 'Break-even', 
                position: 'insideTopRight',
                fill: '#6B7280',
                fontSize: 12,
                fontWeight: 600
              }}
            />
            
            {/* Profit area */}
            <ReferenceArea
              y1={0}
              y2={maxProfit > 0 ? maxProfit : 0}
              fill="url(#profitGradient)"
              fillOpacity={1}
            />
            
            {/* Loss area */}
            <ReferenceArea
              y1={0}
              y2={maxLoss < 0 ? maxLoss : 0}
              fill="url(#lossGradient)"
              fillOpacity={1}
            />
            
            {/* Payoff line with animation */}
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
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
                  position: 'top',
                  fill: '#3B82F6',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Slider Styling */}
      <style>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border: 3px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
        }
        
        .slider-custom::-webkit-slider-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        
        .slider-custom::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border: 3px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
        }
        
        .slider-custom::-moz-range-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        
        .slider-custom::-webkit-slider-runnable-track {
          background: linear-gradient(to right, 
            #DBEAFE 0%, 
            #3B82F6 ${(priceRangePercent - 10) / 90 * 100}%, 
            #E5E7EB ${(priceRangePercent - 10) / 90 * 100}%, 
            #E5E7EB 100%
          );
          height: 12px;
          border-radius: 6px;
        }
        
        .slider-custom::-moz-range-track {
          background: #E5E7EB;
          height: 12px;
          border-radius: 6px;
        }
        
        .slider-custom::-moz-range-progress {
          background: linear-gradient(to right, #DBEAFE, #3B82F6);
          height: 12px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
