export type StrategyType = 
  | "covered-call"
  | "bull-call-spread"
  | "iron-condor"
  | "long-straddle"
  | "protective-put"
  | "butterfly-spread"
  | "custom-strategy";

export interface PayoffDataPoint {
  price: number;
  pnl: number;
}

export type LegType = "CE" | "PE" | "FUT";
export type LegAction = "BUY" | "SELL";

export interface CustomLeg {
  id: string;
  type: LegType;
  action: LegAction;
  strikePrice?: number;
  entryPrice?: number;
  lotSize: number;
  premium?: number;
  
  // Exit tracking fields
  exitPrice?: number; // Exit price for FUT or option exit price
  exitDate?: string; // Exit date for tracking
}

export interface PayoffRequest {
  strategyType: StrategyType;
  entryDate: string;
  expiryDate: string;
  parameters?: Record<string, string>;
  customLegs?: CustomLeg[];
  underlyingPrice?: number;
  priceRangePercent?: number;
}

export interface SaveStrategyRequest {
  name: string;
  type: StrategyType;
  entryDate: string;
  expiryDate: string;
  parameters?: Record<string, string>;
  customLegs?: CustomLeg[];
  notes?: string;
  timestamp: string;
}

export interface SaveStrategyResponse {
  success: boolean;
  id?: string;
  message: string;
}