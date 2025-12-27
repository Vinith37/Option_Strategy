import { PayoffDataPoint, CustomLeg } from "../types";

/**
 * Generate price range for payoff calculations
 */
export function generatePriceRange(
  centerPrice: number,
  rangePercent: number = 20,
  points: number = 100
): number[] {
  const minPrice = centerPrice * (1 - rangePercent / 100);
  const maxPrice = centerPrice * (1 + rangePercent / 100);
  const step = (maxPrice - minPrice) / (points - 1);
  
  const prices: number[] = [];
  for (let i = 0; i < points; i++) {
    prices.push(Math.round((minPrice + step * i) * 100) / 100);
  }
  return prices;
}

/**
 * Covered Call Strategy
 * Long Futures + Short Call
 */
export function calculateCoveredCall(
  params: {
    futuresLotSize: string;
    futuresPrice: string;
    callLotSize: string;
    callStrike: string;
    premium: string;
  },
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  const futuresLotSize = parseFloat(params.futuresLotSize);
  const futuresPrice = parseFloat(params.futuresPrice);
  const callLotSize = parseFloat(params.callLotSize);
  const callStrike = parseFloat(params.callStrike);
  const premium = parseFloat(params.premium);

  const centerPrice = underlyingPrice || futuresPrice;
  const rangePercent = priceRangePercent || 30;
  const prices = generatePriceRange(centerPrice, rangePercent);

  return prices.map(price => {
    // Long Futures P&L
    const futuresPnL = (price - futuresPrice) * futuresLotSize;
    
    // Short Call P&L
    let callPnL: number;
    if (price <= callStrike) {
      // Call expires worthless, keep premium
      callPnL = premium * callLotSize;
    } else {
      // Call exercised, lose (price - strike) but keep premium
      callPnL = premium * callLotSize - (price - callStrike) * callLotSize;
    }
    
    const totalPnL = futuresPnL + callPnL;
    
    return { price, pnl: Math.round(totalPnL) };
  });
}

/**
 * Bull Call Spread Strategy
 * Long Call (lower strike) + Short Call (higher strike)
 */
export function calculateBullCallSpread(
  params: {
    longCallStrike: string;
    shortCallStrike: string;
    lotSize: string;
    longCallPremium: string;
    shortCallPremium: string;
  },
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  const longStrike = parseFloat(params.longCallStrike);
  const shortStrike = parseFloat(params.shortCallStrike);
  const lotSize = parseFloat(params.lotSize);
  const longPremium = parseFloat(params.longCallPremium);
  const shortPremium = parseFloat(params.shortCallPremium);

  const centerPrice = underlyingPrice || (longStrike + shortStrike) / 2;
  const rangePercent = priceRangePercent || 30;
  const prices = generatePriceRange(centerPrice, rangePercent);

  return prices.map(price => {
    // Long Call P&L
    const longCallPnL = price > longStrike 
      ? (price - longStrike) * lotSize - longPremium * lotSize
      : -longPremium * lotSize;
    
    // Short Call P&L
    const shortCallPnL = price > shortStrike
      ? shortPremium * lotSize - (price - shortStrike) * lotSize
      : shortPremium * lotSize;
    
    const totalPnL = longCallPnL + shortCallPnL;
    
    return { price, pnl: Math.round(totalPnL) };
  });
}

/**
 * Iron Condor Strategy
 * Long Put (lower) + Short Put (higher) + Short Call (lower) + Long Call (higher)
 */
export function calculateIronCondor(
  params: {
    lotSize: string;
    putBuyStrike: string;
    putSellStrike: string;
    callSellStrike: string;
    callBuyStrike: string;
    netPremium: string;
  },
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  const lotSize = parseFloat(params.lotSize);
  const putBuyStrike = parseFloat(params.putBuyStrike);
  const putSellStrike = parseFloat(params.putSellStrike);
  const callSellStrike = parseFloat(params.callSellStrike);
  const callBuyStrike = parseFloat(params.callBuyStrike);
  const netPremium = parseFloat(params.netPremium);

  const centerPrice = underlyingPrice || (putSellStrike + callSellStrike) / 2;
  const rangePercent = priceRangePercent || 30;
  const prices = generatePriceRange(centerPrice, rangePercent);

  return prices.map(price => {
    let pnl = netPremium * lotSize; // Start with net premium received
    
    // Long Put (lower strike)
    if (price < putBuyStrike) {
      pnl += (putBuyStrike - price) * lotSize;
    }
    
    // Short Put (higher strike)
    if (price < putSellStrike) {
      pnl -= (putSellStrike - price) * lotSize;
    }
    
    // Short Call (lower strike)
    if (price > callSellStrike) {
      pnl -= (price - callSellStrike) * lotSize;
    }
    
    // Long Call (higher strike)
    if (price > callBuyStrike) {
      pnl += (price - callBuyStrike) * lotSize;
    }
    
    return { price, pnl: Math.round(pnl) };
  });
}

/**
 * Long Straddle Strategy
 * Long Call + Long Put (same strike)
 */
export function calculateLongStraddle(
  params: {
    strikePrice: string;
    callLotSize: string;
    putLotSize: string;
    callPremium: string;
    putPremium: string;
  },
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  const strikePrice = parseFloat(params.strikePrice);
  const callLotSize = parseFloat(params.callLotSize);
  const putLotSize = parseFloat(params.putLotSize);
  const callPremium = parseFloat(params.callPremium);
  const putPremium = parseFloat(params.putPremium);

  const centerPrice = underlyingPrice || strikePrice;
  const rangePercent = priceRangePercent || 30;
  const prices = generatePriceRange(centerPrice, rangePercent);

  return prices.map(price => {
    // Long Call P&L
    const callPnL = price > strikePrice
      ? (price - strikePrice) * callLotSize - callPremium * callLotSize
      : -callPremium * callLotSize;
    
    // Long Put P&L
    const putPnL = price < strikePrice
      ? (strikePrice - price) * putLotSize - putPremium * putLotSize
      : -putPremium * putLotSize;
    
    const totalPnL = callPnL + putPnL;
    
    return { price, pnl: Math.round(totalPnL) };
  });
}

/**
 * Protective Put Strategy
 * Long Stock/Futures + Long Put
 */
export function calculateProtectivePut(
  params: {
    stockLotSize: string;
    stockPrice: string;
    putStrike: string;
    putLotSize: string;
    putPremium: string;
  },
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  const stockLotSize = parseFloat(params.stockLotSize);
  const stockPrice = parseFloat(params.stockPrice);
  const putStrike = parseFloat(params.putStrike);
  const putLotSize = parseFloat(params.putLotSize);
  const putPremium = parseFloat(params.putPremium);

  const centerPrice = underlyingPrice || stockPrice;
  const rangePercent = priceRangePercent || 30;
  const prices = generatePriceRange(centerPrice, rangePercent);

  return prices.map(price => {
    // Long Stock P&L
    const stockPnL = (price - stockPrice) * stockLotSize;
    
    // Long Put P&L
    const putPnL = price < putStrike
      ? (putStrike - price) * putLotSize - putPremium * putLotSize
      : -putPremium * putLotSize;
    
    const totalPnL = stockPnL + putPnL;
    
    return { price, pnl: Math.round(totalPnL) };
  });
}

/**
 * Butterfly Spread Strategy
 * Long 1 Call (lower) + Short 2 Calls (middle) + Long 1 Call (upper)
 */
export function calculateButterflySpread(
  params: {
    lotSize: string;
    lowerStrike: string;
    middleStrike: string;
    upperStrike: string;
    lowerPremium: string;
    middlePremium: string;
    upperPremium: string;
  },
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  const lotSize = parseFloat(params.lotSize);
  const lowerStrike = parseFloat(params.lowerStrike);
  const middleStrike = parseFloat(params.middleStrike);
  const upperStrike = parseFloat(params.upperStrike);
  const lowerPremium = parseFloat(params.lowerPremium);
  const middlePremium = parseFloat(params.middlePremium);
  const upperPremium = parseFloat(params.upperPremium);

  const centerPrice = underlyingPrice || middleStrike;
  const rangePercent = priceRangePercent || 30;
  const prices = generatePriceRange(centerPrice, rangePercent);

  return prices.map(price => {
    // Long Call (lower strike)
    const lowerCallPnL = price > lowerStrike
      ? (price - lowerStrike) * lotSize - lowerPremium * lotSize
      : -lowerPremium * lotSize;
    
    // Short 2x Calls (middle strike)
    const middleCallPnL = price > middleStrike
      ? 2 * (middlePremium * lotSize - (price - middleStrike) * lotSize)
      : 2 * middlePremium * lotSize;
    
    // Long Call (upper strike)
    const upperCallPnL = price > upperStrike
      ? (price - upperStrike) * lotSize - upperPremium * lotSize
      : -upperPremium * lotSize;
    
    const totalPnL = lowerCallPnL + middleCallPnL + upperCallPnL;
    
    return { price, pnl: Math.round(totalPnL) };
  });
}

/**
 * Custom Strategy
 * Calculate payoff based on custom legs
 */
export function calculateCustomStrategy(
  legs: CustomLeg[],
  underlyingPrice?: number,
  priceRangePercent?: number
): PayoffDataPoint[] {
  if (legs.length === 0) {
    return [{ price: 18000, pnl: 0 }];
  }

  // Determine center price and range
  let centerPrice: number;
  
  if (underlyingPrice) {
    centerPrice = underlyingPrice;
  } else {
    // Dynamic price range based on strikes and entry prices
    const prices: number[] = legs.flatMap(leg => [
      leg.strikePrice || 0,
      leg.entryPrice || 0
    ]).filter(p => p > 0);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 18000;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 18000;
    centerPrice = (minPrice + maxPrice) / 2;
  }
  
  const rangePercent = priceRangePercent || 30;
  const priceRange = generatePriceRange(centerPrice, rangePercent);

  return priceRange.map(price => {
    let totalPnL = 0;

    legs.forEach(leg => {
      const lotSize = leg.lotSize;

      if (leg.type === "FUT") {
        // Futures P&L
        const entryPrice = leg.entryPrice || 0;
        const futuresPnL = (price - entryPrice) * lotSize;
        totalPnL += leg.action === "BUY" ? futuresPnL : -futuresPnL;
      } else if (leg.type === "CE") {
        // Call Option P&L
        const strike = leg.strikePrice || 0;
        const premium = leg.premium || 0;
        const intrinsic = Math.max(0, price - strike);
        
        if (leg.action === "BUY") {
          // Bought call: Profit when price > strike + premium
          totalPnL += (intrinsic - premium) * lotSize;
        } else {
          // Sold call: Profit when price < strike + premium
          totalPnL += (premium - intrinsic) * lotSize;
        }
      } else if (leg.type === "PE") {
        // Put Option P&L
        const strike = leg.strikePrice || 0;
        const premium = leg.premium || 0;
        const intrinsic = Math.max(0, strike - price);
        
        if (leg.action === "BUY") {
          // Bought put: Profit when price < strike - premium
          totalPnL += (intrinsic - premium) * lotSize;
        } else {
          // Sold put: Profit when price > strike - premium
          totalPnL += (premium - intrinsic) * lotSize;
        }
      }
    });

    return { price, pnl: Math.round(totalPnL) };
  });
}