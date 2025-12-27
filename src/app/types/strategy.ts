export interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
}

export type StrategyType = 
  | "covered-call"
  | "bull-call-spread"
  | "iron-condor"
  | "long-straddle"
  | "protective-put"
  | "butterfly-spread"
  | "custom-strategy";

export interface StrategyParameter {
  id: string;
  label: string;
  defaultValue: string;
  type: "number" | "text";
}

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
  strikePrice?: number; // For CE/PE
  entryPrice?: number; // For FUT
  lotSize: number;
  premium?: number; // For CE/PE (paid/received)
  
  // Exit tracking fields
  exitPrice?: number; // Exit price for FUT or option exit price
  exitDate?: string; // Exit date for tracking
}