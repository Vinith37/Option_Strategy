import { PayoffDiagramExample } from "./PayoffDiagramExample";

/**
 * PayoffDiagramDemo - Main demo page for the PayoffDiagram component
 * 
 * This page demonstrates:
 * - Real-time chart updates with smooth animations
 * - Debounced slider controls for performance
 * - Responsive design across all devices
 * - Interactive price range controls
 * - Break-even point visualization
 * - Max profit/loss calculations
 * 
 * Usage: Import this component to see a working demonstration
 */

export function PayoffDiagramDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Interactive Payoff Diagram
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Real-time options strategy visualization with smooth animations and responsive controls
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                ⚡ Real-time Updates
              </span>
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
                📱 Fully Responsive
              </span>
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold">
                🎨 Smooth Animations
              </span>
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-semibold">
                ♿ Accessible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo Section */}
      <PayoffDiagramExample />

      {/* Technical Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white border-2 border-gray-200 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Performance Optimizations */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Performance
              </h3>
              <ul className="space-y-3 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Debounced Slider</strong>
                    <span className="text-xs sm:text-sm text-blue-700">
                      150ms delay prevents excessive API calls while dragging
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Memoized Calculations</strong>
                    <span className="text-xs sm:text-sm text-blue-700">
                      useMemo for break-even, max profit/loss to avoid re-computation
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Smooth Animations</strong>
                    <span className="text-xs sm:text-sm text-blue-700">
                      500ms chart animation with ease-in-out easing
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Separated Logic</strong>
                    <span className="text-xs sm:text-sm text-blue-700">
                      Calculation functions isolated from UI rendering
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* User Experience */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                User Experience
              </h3>
              <ul className="space-y-3 text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Instant Feedback</strong>
                    <span className="text-xs sm:text-sm text-green-700">
                      Chart updates immediately as slider moves
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">No Button Clicks</strong>
                    <span className="text-xs sm:text-sm text-green-700">
                      Everything updates automatically - no "Calculate" button needed
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Visual Range Display</strong>
                    <span className="text-xs sm:text-sm text-green-700">
                      Shows calculated range (₹min - ₹max) below slider
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Break-even Markers</strong>
                    <span className="text-xs sm:text-sm text-green-700">
                      Automatically calculated and displayed on chart
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Responsive Design */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📱</span>
                Responsive Design
              </h3>
              <ul className="space-y-3 text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Mobile (< 768px)</strong>
                    <span className="text-xs sm:text-sm text-purple-700">
                      Single column layout, 300px chart height, larger touch targets
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Tablet (768px - 1024px)</strong>
                    <span className="text-xs sm:text-sm text-purple-700">
                      Two-column controls, 400px chart height
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Desktop (> 1024px)</strong>
                    <span className="text-xs sm:text-sm text-purple-700">
                      Two-column controls, 530px chart height, optimal spacing
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Touch-Friendly</strong>
                    <span className="text-xs sm:text-sm text-purple-700">
                      48px+ button sizes, custom slider thumb (20px)
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Accessibility */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">♿</span>
                Accessibility
              </h3>
              <ul className="space-y-3 text-orange-800">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">ARIA Labels</strong>
                    <span className="text-xs sm:text-sm text-orange-700">
                      All interactive elements labeled for screen readers
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Keyboard Navigation</strong>
                    <span className="text-xs sm:text-sm text-orange-700">
                      Fully operable via keyboard (Tab, Arrow keys, Enter)
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Focus Indicators</strong>
                    <span className="text-xs sm:text-sm text-orange-700">
                      2px blue ring on all focusable elements
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  <div>
                    <strong className="block text-sm sm:text-base">Color Contrast</strong>
                    <span className="text-xs sm:text-sm text-orange-700">
                      WCAG AA compliant (4.5:1 ratio)
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            Quick Start Code
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 overflow-x-auto">
            <pre className="text-green-400 text-xs sm:text-sm leading-relaxed">
{`import { useState } from "react";
import { PayoffDiagram } from "./components/PayoffDiagram";
import { PayoffDataPoint } from "./types/strategy";

export function MyComponent() {
  const [payoffData, setPayoffData] = useState<PayoffDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePriceRangeChange = async (price: number, rangePercent: number) => {
    setIsLoading(true);
    
    // Fetch data from your API
    const data = await fetchPayoffData({
      underlyingPrice: price,
      priceRangePercent: rangePercent,
      // ... other strategy parameters
    });
    
    setPayoffData(data);
    setIsLoading(false);
  };

  return (
    <PayoffDiagram
      data={payoffData}
      isLoading={isLoading}
      onPriceRangeChange={handlePriceRangeChange}
      initialUnderlyingPrice={18000}
      initialPriceRange={30}
    />
  );
}`}
            </pre>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-sm">✓</span>
              <span className="text-white text-sm font-medium">TypeScript Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-sm">✓</span>
              <span className="text-white text-sm font-medium">React Hooks</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-sm">✓</span>
              <span className="text-white text-sm font-medium">Production Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
