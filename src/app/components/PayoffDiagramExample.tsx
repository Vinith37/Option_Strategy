import { useState, useEffect } from "react";
import { PayoffDiagram } from "./PayoffDiagram";
import { PayoffDataPoint } from "../types/strategy";

/**
 * PayoffDiagramExample - Demonstration component showing how to use PayoffDiagram
 * 
 * This example shows:
 * - How to integrate PayoffDiagram with your data source
 * - How to handle price range changes
 * - How to calculate payoff data based on user inputs
 * - Real-time updates pattern
 */

export function PayoffDiagramExample() {
  const [payoffData, setPayoffData] = useState<PayoffDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [underlyingPrice, setUnderlyingPrice] = useState(18000);
  const [priceRangePercent, setPriceRangePercent] = useState(30);

  // Calculate payoff data (this would typically call your backend API)
  const calculatePayoffData = async (price: number, rangePercent: number) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calculate price range
      const range = price * (rangePercent / 100);
      const minPrice = price - range;
      const maxPrice = price + range;
      const step = (maxPrice - minPrice) / 100; // 100 data points
      
      // Generate sample payoff data for a bull call spread
      const data: PayoffDataPoint[] = [];
      const longStrike = price - 500;  // Lower strike (buy)
      const shortStrike = price + 500; // Higher strike (sell)
      const longPremium = 200;         // Premium paid for long call
      const shortPremium = 100;        // Premium received for short call
      const netDebit = longPremium - shortPremium; // Net cost of the spread
      
      for (let currentPrice = minPrice; currentPrice <= maxPrice; currentPrice += step) {
        let pnl = 0;
        
        // Long call payoff
        if (currentPrice > longStrike) {
          pnl += (currentPrice - longStrike - longPremium);
        } else {
          pnl -= longPremium;
        }
        
        // Short call payoff
        if (currentPrice > shortStrike) {
          pnl -= (currentPrice - shortStrike - shortPremium);
        } else {
          pnl += shortPremium;
        }
        
        data.push({
          price: Math.round(currentPrice),
          pnl: Math.round(pnl)
        });
      }
      
      setPayoffData(data);
    } catch (error) {
      console.error("Error calculating payoff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial calculation
  useEffect(() => {
    calculatePayoffData(underlyingPrice, priceRangePercent);
  }, []);

  // Handle price range changes from the diagram
  const handlePriceRangeChange = (newPrice: number, newRangePercent: number) => {
    setUnderlyingPrice(newPrice);
    setPriceRangePercent(newRangePercent);
    calculatePayoffData(newPrice, newRangePercent);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Payoff Diagram Demo
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Interactive payoff chart with real-time updates as you adjust controls
        </p>
      </div>

      {/* PayoffDiagram Component */}
      <PayoffDiagram
        data={payoffData}
        isLoading={isLoading}
        onPriceRangeChange={handlePriceRangeChange}
        initialUnderlyingPrice={underlyingPrice}
        initialPriceRange={priceRangePercent}
      />

      {/* Integration Instructions */}
      <div className="mt-8 bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          How to Integrate
        </h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Import the Component</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
{`import { PayoffDiagram } from "./components/PayoffDiagram";`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Set Up State Management</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
{`const [payoffData, setPayoffData] = useState<PayoffDataPoint[]>([]);
const [isLoading, setIsLoading] = useState(false);`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Create Calculation Function</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
{`const handlePriceRangeChange = async (price, rangePercent) => {
  setIsLoading(true);
  const data = await fetchPayoffData({
    underlyingPrice: price,
    priceRangePercent: rangePercent,
    // ... other params
  });
  setPayoffData(data);
  setIsLoading(false);
};`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Use the Component</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
{`<PayoffDiagram
  data={payoffData}
  isLoading={isLoading}
  onPriceRangeChange={handlePriceRangeChange}
  initialUnderlyingPrice={18000}
  initialPriceRange={30}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">✨ Features</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>✅ Real-time chart updates</li>
            <li>✅ Smooth animations (500ms)</li>
            <li>✅ Debounced slider (150ms)</li>
            <li>✅ Responsive design</li>
            <li>✅ Touch-friendly controls</li>
            <li>✅ Keyboard accessible</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-3">🎯 UX Benefits</h3>
          <ul className="space-y-2 text-purple-800 text-sm">
            <li>✅ No page reloads</li>
            <li>✅ No button clicks needed</li>
            <li>✅ Immediate visual feedback</li>
            <li>✅ Break-even point markers</li>
            <li>✅ Max profit/loss display</li>
            <li>✅ Price range indicators</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
