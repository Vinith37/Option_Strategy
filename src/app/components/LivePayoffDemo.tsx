import { useState } from "react";
import { LivePayoffDiagram } from "./LivePayoffDiagram";
import { TrendingUp, Zap, Activity } from "lucide-react";

/**
 * LivePayoffDemo - Demonstration page for LivePayoffDiagram component
 * 
 * Shows three different strategy types:
 * - Bull Call Spread
 * - Iron Condor
 * - Long Straddle
 * 
 * Each updates instantly when you drag the slider - no API calls needed!
 */

type StrategyType = "bull-call-spread" | "iron-condor" | "long-straddle";

interface StrategyInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const strategies: Record<StrategyType, StrategyInfo> = {
  "bull-call-spread": {
    name: "Bull Call Spread",
    description: "Buy lower strike call, sell higher strike call. Limited profit, limited risk.",
    icon: <TrendingUp className="w-6 h-6" strokeWidth={2.5} />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  "iron-condor": {
    name: "Iron Condor",
    description: "Sell OTM put spread + sell OTM call spread. Profit from low volatility.",
    icon: <Activity className="w-6 h-6" strokeWidth={2.5} />,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  "long-straddle": {
    name: "Long Straddle",
    description: "Buy ATM call + buy ATM put. Profit from high volatility in either direction.",
    icon: <Zap className="w-6 h-6" strokeWidth={2.5} />,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
};

export function LivePayoffDemo() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>("bull-call-spread");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Live Updates • No API Calls
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Live Payoff Diagram
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Drag the slider to see instant updates. The chart recalculates and re-renders in real-time with smooth animations.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                ⚡ Instant Recalculation
              </div>
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                🎨 Smooth Animations
              </div>
              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                📊 100 Data Points
              </div>
              <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                📱 Fully Responsive
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Select Strategy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(strategies) as StrategyType[]).map((strategy) => {
              const info = strategies[strategy];
              const isSelected = selectedStrategy === strategy;
              
              return (
                <button
                  key={strategy}
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`
                    p-4 sm:p-6 rounded-xl border-2 transition-all duration-200
                    ${isSelected 
                      ? `${info.bgColor} ${info.borderColor} shadow-lg scale-105` 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className={`flex items-center gap-3 mb-3 ${isSelected ? info.color : 'text-gray-600'}`}>
                    {info.icon}
                    <h3 className="font-bold text-base sm:text-lg">{info.name}</h3>
                  </div>
                  <p className={`text-xs sm:text-sm text-left ${isSelected ? info.color : 'text-gray-600'}`}>
                    {info.description}
                  </p>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-green-700">Active</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Payoff Diagram */}
        <LivePayoffDiagram 
          key={selectedStrategy} 
          strategyType={selectedStrategy} 
        />

        {/* Implementation Details */}
        <div className="mt-8 bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calculation Logic */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                📐 Calculation Logic
              </h3>
              <div className="space-y-3 text-blue-800 text-sm">
                <div className="bg-white/50 rounded-lg p-3 font-mono">
                  <div className="text-blue-600 font-semibold mb-1">Price Range:</div>
                  <code>minPrice = underlyingPrice × (1 - range/100)</code><br/>
                  <code>maxPrice = underlyingPrice × (1 + range/100)</code>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-blue-600 font-semibold mb-1">Data Generation:</div>
                  Generate 100 price points between min and max
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-blue-600 font-semibold mb-1">Payoff Calculation:</div>
                  For each price, calculate P&L based on strategy
                </div>
              </div>
            </div>

            {/* Dynamic Behavior */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">
                ⚡ Dynamic Behavior
              </h3>
              <div className="space-y-3 text-green-800 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                  <div>
                    <strong>Slider moves</strong> → State updates immediately
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                  <div>
                    <strong>useMemo recalculates</strong> → Min/max price computed
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                  <div>
                    <strong>Payoff generated</strong> → 100 data points calculated
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">4</div>
                  <div>
                    <strong>Chart re-renders</strong> → Smooth 400ms animation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-gray-900 border-2 border-gray-700 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Usage Example
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 overflow-x-auto">
            <pre className="text-green-400 text-xs sm:text-sm leading-relaxed">
{`import { LivePayoffDiagram } from "./components/LivePayoffDiagram";

export function MyComponent() {
  return (
    <LivePayoffDiagram strategyType="bull-call-spread" />
  );
}

// Available strategies:
// - "bull-call-spread"
// - "iron-condor"
// - "long-straddle"

// Custom calculation function:
<LivePayoffDiagram
  calculatePayoff={(price, underlyingPrice) => {
    // Your custom logic here
    return myCalculation(price, underlyingPrice);
  }}
/>`}
            </pre>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">100</div>
            <div className="text-gray-600 text-sm font-medium">Data Points</div>
            <div className="text-gray-500 text-xs mt-1">Generated per calculation</div>
          </div>
          
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">400ms</div>
            <div className="text-gray-600 text-sm font-medium">Animation Time</div>
            <div className="text-gray-500 text-xs mt-1">Smooth ease-in-out</div>
          </div>
          
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">0ms</div>
            <div className="text-gray-600 text-sm font-medium">Debounce Delay</div>
            <div className="text-gray-500 text-xs mt-1">Instant calculations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
