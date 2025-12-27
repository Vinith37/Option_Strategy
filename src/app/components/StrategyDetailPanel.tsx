import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import { ChevronLeft, TrendingUp, Sparkles, RotateCcw } from "lucide-react";
import { StrategyType, PayoffDataPoint, CustomLeg } from "../types/strategy";
import { strategyConfigurations } from "../utils/strategyConfig";
import { Highlighter } from "./Highlighter";
import { CustomStrategyBuilder } from "./CustomStrategyBuilder";
import { fetchPayoffData, saveStrategyToBackend } from "../api/payoffApi";

// Strategy Detail Panel Component - Displays strategy configuration and payoff diagram
interface StrategyDetailPanelProps {
  strategyName: string;
  strategyType: StrategyType;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Helper function to calculate break-even points
function calculateBreakEvenPoints(payoffData: PayoffDataPoint[]): number[] {
  const breakEvens: number[] = [];
  
  for (let i = 1; i < payoffData.length; i++) {
    const prev = payoffData[i - 1];
    const curr = payoffData[i];
    
    // Check if P&L crosses zero
    if ((prev.pnl <= 0 && curr.pnl >= 0) || (prev.pnl >= 0 && curr.pnl <= 0)) {
      // Linear interpolation to find exact break-even point
      const priceDiff = curr.price - prev.price;
      const pnlDiff = curr.pnl - prev.pnl;
      
      if (pnlDiff !== 0) {
        const breakEvenPrice = prev.price + (priceDiff * (-prev.pnl / pnlDiff));
        breakEvens.push(Math.round(breakEvenPrice * 100) / 100);
      }
    }
  }
  
  return breakEvens;
}

export function StrategyDetailPanel({ strategyName, strategyType, onBack, showBackButton = false }: StrategyDetailPanelProps) {
  const config = strategyConfigurations[strategyType];
  const isCustomStrategy = strategyType === "custom-strategy";
  
  // Helper function to format date as YYYY-MM-DD for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to get default expiry date (30 days from today)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return formatDateForInput(date);
  };

  // State for parameters and dates
  const [params, setParams] = useState<Record<string, string>>({});
  const [entryDate, setEntryDate] = useState(formatDateForInput(new Date()));
  const [expiryDate, setExpiryDate] = useState(getDefaultExpiryDate());

  // Payoff data - to be populated from backend
  const [payoffData, setPayoffData] = useState<PayoffDataPoint[]>([
    { price: 18000, pnl: 0 }
  ]);

  // Custom strategy state
  const [customLegs, setCustomLegs] = useState<CustomLeg[]>([]);

  // Notes state
  const [notes, setNotes] = useState<string>("");
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Loading state
  const [isLoadingPayoff, setIsLoadingPayoff] = useState(false);

  // Price range controls
  const [underlyingPrice, setUnderlyingPrice] = useState(18000);
  const [priceRangePercent, setPriceRangePercent] = useState(30);

  // Zoom and Pan State for interactive chart
  const [zoomState, setZoomState] = useState<{
    left: string | number;
    right: string | number;
  } | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | number>("");
  const [refAreaRight, setRefAreaRight] = useState<string | number>("");
  const [isZooming, setIsZooming] = useState(false);

  // Calculate break-even points using memoization
  const breakEvenPoints = useMemo(() => calculateBreakEvenPoints(payoffData), [payoffData]);

  // Calculate exactly 10 evenly-spaced x-axis ticks for uniform display
  const xAxisTicks = useMemo(() => {
    if (payoffData.length === 0) return [];
    
    const prices = payoffData.map(d => d.price);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);
    
    // Apply zoom if active
    if (zoomState) {
      minPrice = typeof zoomState.left === 'number' ? zoomState.left : minPrice;
      maxPrice = typeof zoomState.right === 'number' ? zoomState.right : maxPrice;
    }
    
    const range = maxPrice - minPrice;
    const step = range / 10; // Divide into exactly 10 intervals
    
    const ticks: number[] = [];
    const ticksSet = new Set<number>(); // Use Set to ensure uniqueness
    
    for (let i = 0; i <= 10; i++) {
      const tickValue = minPrice + (step * i);
      
      // Smart rounding to prevent duplicates
      let roundedValue: number;
      if (step < 0.1) {
        // Very small step, use 2 decimal places
        roundedValue = Math.round(tickValue * 100) / 100;
      } else if (step < 1) {
        // Small step, use 1 decimal place
        roundedValue = Math.round(tickValue * 10) / 10;
      } else if (step < 10) {
        // Medium step, round to nearest integer
        roundedValue = Math.round(tickValue);
      } else {
        // Large step, round to nearest 10 or appropriate magnitude
        const magnitude = Math.pow(10, Math.floor(Math.log10(step)));
        roundedValue = Math.round(tickValue / magnitude) * magnitude;
      }
      
      // Only add if unique
      if (!ticksSet.has(roundedValue)) {
        ticksSet.add(roundedValue);
        ticks.push(roundedValue);
      }
    }
    
    // If we ended up with less than expected ticks due to duplicates,
    // ensure we at least have min and max
    if (ticks.length < 3) {
      const uniqueTicks = new Set([minPrice, maxPrice]);
      return Array.from(uniqueTicks).sort((a, b) => a - b);
    }
    
    return ticks;
  }, [payoffData, zoomState]);

  // Calculate payoff from backend
  const calculatePayoff = async () => {
    if (isCustomStrategy && customLegs.length === 0) {
      // Don't calculate if custom strategy has no legs
      setPayoffData([{ price: 18000, pnl: 0 }]);
      return;
    }

    setIsLoadingPayoff(true);
    try {
      const data = await fetchPayoffData({
        strategyType,
        entryDate,
        expiryDate,
        parameters: params,
        underlyingPrice,
        priceRangePercent,
        ...(isCustomStrategy && { customLegs }),
      });
      setPayoffData(data);
    } catch (error) {
      console.error("Error calculating payoff:", error);
      // Keep existing data on error
    } finally {
      setIsLoadingPayoff(false);
    }
  };

  // Reset parameters and dates when strategy type changes
  useEffect(() => {
    const newParams: Record<string, string> = {};
    config.parameters.forEach((param) => {
      newParams[param.id] = param.defaultValue;
    });
    setParams(newParams);
    setEntryDate(formatDateForInput(new Date()));
    setExpiryDate(getDefaultExpiryDate());
    
    // Reset custom strategy state
    if (isCustomStrategy) {
      setCustomLegs([]);
      setPayoffData([{ price: 18000, pnl: 0 }]);
    }
    
    // Reset notes
    setNotes("");
    
    // Reset save state
    setShowSaveSuccess(false);
  }, [strategyType, config.parameters, isCustomStrategy]);

  // Calculate payoff when parameters change (for regular strategies)
  useEffect(() => {
    if (!isCustomStrategy && Object.keys(params).length > 0) {
      calculatePayoff();
    }
  }, [params, entryDate, expiryDate]);

  // Recalculate payoff when price range controls change
  useEffect(() => {
    if (!isCustomStrategy && Object.keys(params).length > 0) {
      calculatePayoff();
    } else if (isCustomStrategy && customLegs.length > 0) {
      calculatePayoff();
    }
  }, [underlyingPrice, priceRangePercent]);

  const handleParamChange = (id: string, value: string) => {
    setParams(prev => ({ ...prev, [id]: value }));
  };

  const handleEntryDateChange = (newDate: string) => {
    setEntryDate(newDate);
  };

  const handleExpiryDateChange = (newDate: string) => {
    setExpiryDate(newDate);
  };

  // Zoom handlers for interactive chart
  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setIsZooming(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isZooming && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (!isZooming || refAreaLeft === refAreaRight || refAreaRight === "") {
      setIsZooming(false);
      setRefAreaLeft("");
      setRefAreaRight("");
      return;
    }

    // Perform zoom
    let left = refAreaLeft as number;
    let right = refAreaRight as number;

    if (left > right) {
      [left, right] = [right, left];
    }

    setZoomState({ left, right });
    setRefAreaLeft("");
    setRefAreaRight("");
    setIsZooming(false);
  };

  // Reset zoom to default view
  const handleResetZoom = () => {
    setZoomState(null);
    setRefAreaLeft("");
    setRefAreaRight("");
    setIsZooming(false);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Mobile Back Button */}
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors md:hidden font-medium"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            <span>Back to Strategies</span>
          </button>
        )}

        {/* Header with Icon */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-blue-600" strokeWidth={2} />
            </div>
            <h2 className="text-gray-900 text-2xl md:text-3xl font-bold">
              <Highlighter color="yellow">
                {strategyName}
              </Highlighter>
            </h2>
          </div>
          <p className="text-gray-600 text-base md:text-lg ml-[72px]">
            Configure your strategy parameters and visualize the payoff diagram
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6 md:gap-8">
          {/* Left side - Input card */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 lg:max-h-[900px] lg:overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-bold text-xl">
                <Highlighter color="yellow">
                  Strategy Parameters
                </Highlighter>
              </h3>
            </div>
            
            <div className="space-y-5">
              {/* Entry Date Field */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-2">
                  Entry Date
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => handleEntryDateChange(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Expiry Date Field */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => handleExpiryDateChange(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Custom Strategy Builder or Regular Parameters */}
              {isCustomStrategy ? (
                <CustomStrategyBuilder
                  onLegsChange={setCustomLegs}
                  onPayoffChange={setPayoffData}
                />
              ) : (
                <>
                  {/* Existing Strategy Parameters */}
                  {config.parameters.map(param => (
                    <div key={param.id}>
                      <label className="block text-gray-700 font-medium text-sm mb-2">
                        {param.label}
                      </label>
                      <input
                        type={param.type === "text" ? "text" : "number"}
                        value={params[param.id] || ""}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder={param.type === "text" ? "Optional" : "Enter value"}
                      />
                    </div>
                  ))}
                </>
              )}
              
              {/* Exit P&L Calculation (for Covered Call) */}
              {strategyType === "covered-call" && 
               params.exitFuturesPrice && 
               params.exitCallPrice && 
               params.futuresLotSize &&
               params.futuresPrice &&
               params.callLotSize &&
               params.premium && (
                <div className="pt-6 mt-6 border-t-2 border-gray-200">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-gray-900 font-bold text-base">
                        <Highlighter color="blue">Exit P&L Calculation</Highlighter>
                      </h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Based on your exit prices
                    </p>
                  </div>
                  
                  {(() => {
                    const futuresLotSize = parseFloat(params.futuresLotSize);
                    const futuresEntry = parseFloat(params.futuresPrice);
                    const futuresExit = parseFloat(params.exitFuturesPrice);
                    const callLotSize = parseFloat(params.callLotSize);
                    const premiumReceived = parseFloat(params.premium);
                    const callExitPrice = parseFloat(params.exitCallPrice);
                    
                    // Calculate Futures P&L
                    const futuresPnL = (futuresExit - futuresEntry) * futuresLotSize;
                    
                    // Calculate Call P&L (we sold the call, so buying it back)
                    const callPnL = (premiumReceived - callExitPrice) * callLotSize;
                    
                    // Total P&L
                    const totalPnL = futuresPnL + callPnL;
                    
                    const isProfit = totalPnL > 0;
                    
                    return (
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-gray-600 text-xs font-medium mb-2">Futures Position</div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-sm">Entry: ₹{futuresEntry.toLocaleString()}</span>
                            <span className="text-gray-700 text-sm">Exit: ₹{futuresExit.toLocaleString()}</span>
                          </div>
                          <div className={`text-right font-bold text-base mt-1 ${futuresPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {futuresPnL >= 0 ? '+' : ''}₹{futuresPnL.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-gray-600 text-xs font-medium mb-2">Short Call Position</div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-sm">Received: ₹{premiumReceived.toLocaleString()}</span>
                            <span className="text-gray-700 text-sm">Exit: ₹{callExitPrice.toLocaleString()}</span>
                          </div>
                          <div className={`text-right font-bold text-base mt-1 ${callPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {callPnL >= 0 ? '+' : ''}₹{callPnL.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className={`${isProfit ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-4`}>
                          <div className={`${isProfit ? 'text-green-700' : 'text-red-700'} text-xs font-semibold mb-1 uppercase tracking-wide`}>
                            <Highlighter color={isProfit ? 'green' : 'red'}>
                              Total Realized P&L
                            </Highlighter>
                          </div>
                          <div className={`${isProfit ? 'text-green-800' : 'text-red-800'} font-bold text-2xl`}>
                            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                          </div>
                          {params.exitDate && (
                            <div className="text-gray-600 text-xs mt-2">
                              Exit Date: {params.exitDate}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Exit P&L Calculation (for Custom Strategy) */}
              {isCustomStrategy && customLegs.length > 0 && customLegs.some(leg => leg.exitPrice !== undefined && leg.exitPrice > 0) && (
                <div className="pt-6 mt-6 border-t-2 border-gray-200">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-gray-900 font-bold text-base">
                        <Highlighter color="blue">Exit P&L Calculation</Highlighter>
                      </h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Based on exit prices for each leg
                    </p>
                  </div>
                  
                  {(() => {
                    const legPnLs: Array<{leg: typeof customLegs[0], pnl: number}> = [];
                    let totalPnL = 0;
                    
                    customLegs.forEach((leg) => {
                      if (leg.exitPrice === undefined || leg.exitPrice === 0) return;
                      
                      const lotSize = leg.lotSize || 0;
                      let legPnL = 0;
                      
                      if (leg.type === "FUT") {
                        const entryPrice = leg.entryPrice || 0;
                        const exitPrice = leg.exitPrice;
                        
                        if (leg.action === "BUY") {
                          legPnL = (exitPrice - entryPrice) * lotSize;
                        } else {
                          legPnL = (entryPrice - exitPrice) * lotSize;
                        }
                      } else {
                        // CE or PE
                        const premium = leg.premium || 0;
                        const exitPrice = leg.exitPrice;
                        
                        if (leg.action === "BUY") {
                          // Bought option: paid premium, selling at exitPrice
                          legPnL = (exitPrice - premium) * lotSize;
                        } else {
                          // Sold option: received premium, buying back at exitPrice
                          legPnL = (premium - exitPrice) * lotSize;
                        }
                      }
                      
                      legPnLs.push({ leg, pnl: legPnL });
                      totalPnL += legPnL;
                    });
                    
                    const isProfit = totalPnL > 0;
                    const exitDate = customLegs.find(leg => leg.exitDate)?.exitDate;
                    
                    if (legPnLs.length === 0) return null;
                    
                    return (
                      <div className="space-y-3">
                        {/* Individual Leg P&Ls */}
                        {legPnLs.map(({ leg, pnl }, index) => {
                          const legColor = leg.type === "CE" ? "green" : leg.type === "PE" ? "red" : "blue";
                          const legName = leg.type === "CE" ? "Call" : leg.type === "PE" ? "Put" : "Futures";
                          
                          return (
                            <div key={leg.id} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`bg-${legColor}-100 text-${legColor}-700 text-xs font-bold px-2 py-1 rounded-full`}>
                                  Leg {index + 1}
                                </span>
                                <span className="text-gray-600 text-xs font-medium">
                                  {leg.action} {legName}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                {leg.type === "FUT" ? (
                                  <>
                                    <span className="text-gray-700 text-sm">Entry: ₹{(leg.entryPrice || 0).toLocaleString()}</span>
                                    <span className="text-gray-700 text-sm">Exit: ₹{(leg.exitPrice || 0).toLocaleString()}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-gray-700 text-sm">Premium: ₹{(leg.premium || 0).toLocaleString()}</span>
                                    <span className="text-gray-700 text-sm">Exit: ₹{(leg.exitPrice || 0).toLocaleString()}</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-600 text-xs">Lot Size: {leg.lotSize}</span>
                                <div className={`font-bold text-base ${pnl >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Total P&L */}
                        <div className={`${isProfit ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-4`}>
                          <div className={`${isProfit ? 'text-green-700' : 'text-red-700'} text-xs font-semibold mb-1 uppercase tracking-wide`}>
                            <Highlighter color={isProfit ? 'green' : 'red'}>
                              Total Realized P&L
                            </Highlighter>
                          </div>
                          <div className={`${isProfit ? 'text-green-800' : 'text-red-800'} font-bold text-2xl`}>
                            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                          </div>
                          {exitDate && (
                            <div className="text-gray-600 text-xs mt-2">
                              Exit Date: {exitDate}
                            </div>
                          )}
                          <div className="text-gray-600 text-xs mt-1">
                            {legPnLs.length} leg{legPnLs.length > 1 ? 's' : ''} exited
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="pt-6 mt-6 border-t-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-green-700 text-xs font-semibold mb-1 uppercase tracking-wide">
                      <Highlighter color="green">Max Profit</Highlighter>
                    </div>
                    <div className="text-green-800 font-bold text-lg">
                      ₹{Math.max(...payoffData.map(d => d.pnl)).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="text-red-700 text-xs font-semibold mb-1 uppercase tracking-wide">
                      Max Loss
                    </div>
                    <div className="text-red-800 font-bold text-lg">
                      ₹{Math.min(...payoffData.map(d => d.pnl)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="pt-6 mt-6 border-t-2 border-gray-200">
                <label className="block text-gray-700 font-medium text-sm mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-y min-h-[100px]"
                  placeholder="Add notes about this strategy..."
                />
              </div>

              {/* Save Button */}
              <button
                onClick={async () => {
                  console.log('=== SAVE BUTTON CLICKED ===');
                  setIsSaving(true);
                  
                  // Prepare strategy data
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
                  
                  // Log to console for debugging
                  console.log('📊 Saving strategy:', JSON.stringify(strategyData, null, 2));
                  
                  try {
                    console.log('🚀 Calling saveStrategyToBackend...');
                    // Save to backend
                    const result = await saveStrategyToBackend(strategyData);
                    console.log('✅ Save successful:', result);
                    
                    // Show success indication
                    setIsSaving(false);
                    setShowSaveSuccess(true);
                    
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                      setShowSaveSuccess(false);
                    }, 3000);
                  } catch (error) {
                    console.error('❌ Error saving strategy:', error);
                    setIsSaving(false);
                    alert('Failed to save strategy: ' + (error instanceof Error ? error.message : 'Unknown error'));
                  }
                }}
                disabled={isSaving}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-6 py-4 font-semibold text-base transition-all flex items-center justify-center gap-3 shadow-md ${
                  isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-blue-600 hover:to-purple-600 hover:shadow-lg'
                } ${
                  showSaveSuccess 
                    ? 'from-green-500 to-emerald-500 hover:from-green-500 hover:to-emerald-500' 
                    : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Strategy Saved!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Strategy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right side - Payoff chart */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                </div>
                <h3 className="text-gray-900 font-bold text-xl">
                  <Highlighter color="purple">
                    Payoff Diagram
                  </Highlighter>
                </h3>
              </div>
              
              {/* Reset Zoom Button */}
              {zoomState && (
                <button
                  onClick={handleResetZoom}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                  title="Reset to default view"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                  Reset View
                </button>
              )}
            </div>

            {/* Instruction text */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-gray-500 text-xs italic">
                {zoomState ? "Zoomed view • Click reset to see full chart" : "Click and drag on the chart to zoom into a specific range"}
              </p>
              
              {/* Break-even Points Display */}
              {breakEvenPoints.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-gray-600 text-xs font-medium">Break-even:</span>
                  {breakEvenPoints.map((bePoint, index) => (
                    <div 
                      key={index}
                      className="bg-amber-50 border-2 border-amber-400 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      ₹{bePoint.toLocaleString()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Controls */}
            <div className="mb-6 bg-gray-50 border-2 border-gray-200 rounded-2xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Underlying Price */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-3">
                    Underlying Price
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUnderlyingPrice(prev => Math.max(0, prev - 50))}
                      className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-bold text-xl"
                      title="Decrease by 50"
                    >
                      −
                    </button>
                    <div className="flex-1 bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-center">
                      <input
                        type="number"
                        value={underlyingPrice}
                        onChange={(e) => setUnderlyingPrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-center text-gray-900 font-bold text-lg bg-transparent focus:outline-none"
                        step="50"
                      />
                    </div>
                    <button
                      onClick={() => setUnderlyingPrice(prev => prev + 50)}
                      className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-bold text-xl"
                      title="Increase by 50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Range (%) */}
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-3">
                    Price Range (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={priceRangePercent}
                      onChange={(e) => setPriceRangePercent(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${priceRangePercent}%, #d1d5db ${priceRangePercent}%, #d1d5db 100%)`
                      }}
                    />
                    <div className="w-16 text-center">
                      <span className="text-blue-600 font-bold text-xl">
                        {priceRangePercent}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Range: ₹{Math.round(underlyingPrice * (1 - priceRangePercent / 100)).toLocaleString()} - ₹{Math.round(underlyingPrice * (1 + priceRangePercent / 100)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] md:h-[530px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={payoffData}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeWidth={1.5} />
                  <XAxis 
                    dataKey="price" 
                    stroke="#9ca3af"
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                    label={{ value: 'Underlying Price', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 13, fontWeight: 600 }}
                    strokeWidth={2}
                    ticks={xAxisTicks}
                    domain={zoomState ? [zoomState.left, zoomState.right] : 'auto'}
                    allowDataOverflow
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                    label={{ value: 'P&L (₹)', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 13, fontWeight: 600 }}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
                    }}
                    labelStyle={{ color: '#4b5563', fontWeight: 600, marginBottom: '4px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 500 }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'P&L']}
                  />
                  {/* Zero P&L line */}
                  <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" />
                  
                  {/* Break-even vertical lines */}
                  {breakEvenPoints.map((bePoint, index) => (
                    <ReferenceLine 
                      key={`be-${index}`}
                      x={bePoint} 
                      stroke="#f59e0b" 
                      strokeWidth={2.5}
                      strokeDasharray="8 4"
                      label={{ 
                        value: `BE: ₹${bePoint.toLocaleString()}`, 
                        position: 'top',
                        fill: '#f59e0b',
                        fontSize: 11,
                        fontWeight: 700,
                        offset: 10
                      }}
                    />
                  ))}
                  
                  {/* Zoom selection area */}
                  {refAreaLeft && refAreaRight && (
                    <ReferenceArea
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      strokeOpacity={0.3}
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  )}
                  
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}