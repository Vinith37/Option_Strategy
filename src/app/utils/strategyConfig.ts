import { StrategyType, StrategyParameter } from "../types/strategy";

export const strategyConfigurations: Record<StrategyType, {
  parameters: StrategyParameter[];
}> = {
  "covered-call": {
    parameters: [
      { id: "futuresLotSize", label: "Futures Lot Size", defaultValue: "50", type: "number" },
      { id: "futuresPrice", label: "Futures Entry Price", defaultValue: "18000", type: "number" },
      { id: "callLotSize", label: "Call Lot Size", defaultValue: "50", type: "number" },
      { id: "callStrike", label: "Call Strike Price", defaultValue: "18500", type: "number" },
      { id: "premium", label: "Call Premium Received", defaultValue: "200", type: "number" },
      { id: "exitDate", label: "Exit Date (Optional)", defaultValue: "", type: "text" },
      { id: "exitFuturesPrice", label: "Exit Futures Price (Optional)", defaultValue: "", type: "number" },
      { id: "exitCallPrice", label: "Exit Call Price (Optional)", defaultValue: "", type: "number" },
    ],
  },
  
  "bull-call-spread": {
    parameters: [
      { id: "longCallStrike", label: "Long Call Strike", defaultValue: "18000", type: "number" },
      { id: "shortCallStrike", label: "Short Call Strike", defaultValue: "19000", type: "number" },
      { id: "lotSize", label: "Lot Size", defaultValue: "50", type: "number" },
      { id: "longCallPremium", label: "Long Call Premium Paid", defaultValue: "300", type: "number" },
      { id: "shortCallPremium", label: "Short Call Premium Received", defaultValue: "150", type: "number" },
    ],
  },
  
  "iron-condor": {
    parameters: [
      { id: "lotSize", label: "Lot Size", defaultValue: "50", type: "number" },
      { id: "putBuyStrike", label: "Long Put Strike", defaultValue: "17000", type: "number" },
      { id: "putSellStrike", label: "Short Put Strike", defaultValue: "17500", type: "number" },
      { id: "callSellStrike", label: "Short Call Strike", defaultValue: "18500", type: "number" },
      { id: "callBuyStrike", label: "Long Call Strike", defaultValue: "19000", type: "number" },
      { id: "netPremium", label: "Net Premium Received", defaultValue: "100", type: "number" },
    ],
  },
  
  "long-straddle": {
    parameters: [
      { id: "strikePrice", label: "Strike Price", defaultValue: "18000", type: "number" },
      { id: "callLotSize", label: "Call Lot Size", defaultValue: "50", type: "number" },
      { id: "putLotSize", label: "Put Lot Size", defaultValue: "50", type: "number" },
      { id: "callPremium", label: "Call Premium Paid", defaultValue: "250", type: "number" },
      { id: "putPremium", label: "Put Premium Paid", defaultValue: "240", type: "number" },
    ],
  },
  
  "protective-put": {
    parameters: [
      { id: "stockLotSize", label: "Stock/Futures Lot Size", defaultValue: "50", type: "number" },
      { id: "stockPrice", label: "Current Stock Price", defaultValue: "18000", type: "number" },
      { id: "putStrike", label: "Put Strike Price", defaultValue: "17500", type: "number" },
      { id: "putLotSize", label: "Put Lot Size", defaultValue: "50", type: "number" },
      { id: "putPremium", label: "Put Premium Paid", defaultValue: "150", type: "number" },
    ],
  },
  
  "butterfly-spread": {
    parameters: [
      { id: "lotSize", label: "Lot Size", defaultValue: "50", type: "number" },
      { id: "lowerStrike", label: "Lower Strike (Buy)", defaultValue: "17500", type: "number" },
      { id: "middleStrike", label: "Middle Strike (Sell 2x)", defaultValue: "18000", type: "number" },
      { id: "upperStrike", label: "Upper Strike (Buy)", defaultValue: "18500", type: "number" },
      { id: "lowerPremium", label: "Lower Strike Premium Paid", defaultValue: "300", type: "number" },
      { id: "middlePremium", label: "Middle Strike Premium Received", defaultValue: "200", type: "number" },
      { id: "upperPremium", label: "Upper Strike Premium Paid", defaultValue: "120", type: "number" },
    ],
  },
  
  "custom-strategy": {
    parameters: [],
  }
};