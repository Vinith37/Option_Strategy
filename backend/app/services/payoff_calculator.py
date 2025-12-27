"""
Payoff calculation service - Business logic layer.
Separated from controllers for clean architecture.
"""
from typing import List, Dict, Any
from ..schemas.strategy import PayoffDataPoint


class PayoffCalculatorService:
    """Service for calculating payoff diagrams."""
    
    @staticmethod
    def calculate_price_range(
        underlying_price: float,
        price_range_percent: float,
        num_points: int = 50
    ) -> List[float]:
        """
        Generate evenly-spaced price points within the range.
        
        Formula:
        - minPrice = underlyingPrice × (1 - range/100)
        - maxPrice = underlyingPrice × (1 + range/100)
        
        Args:
            underlying_price: Current price of underlying asset
            price_range_percent: Percentage range (10-100)
            num_points: Number of price points to generate
            
        Returns:
            List of price points
        """
        min_price = underlying_price * (1 - price_range_percent / 100)
        max_price = underlying_price * (1 + price_range_percent / 100)
        
        step = (max_price - min_price) / (num_points - 1)
        
        return [min_price + (step * i) for i in range(num_points)]
    
    @staticmethod
    def calculate_covered_call(
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """
        Calculate payoff for Covered Call strategy.
        
        Position:
        - Long Futures
        - Short Call
        
        Args:
            parameters: Strategy parameters (futuresPrice, callStrike, premium, lotSize)
            underlying_price: Current underlying price
            price_range_percent: Price range percentage
            
        Returns:
            List of PayoffDataPoint objects
        """
        # Extract parameters
        futures_price = float(parameters.get("futuresPrice", underlying_price))
        call_strike = float(parameters.get("callStrike", underlying_price + 500))
        premium = float(parameters.get("premium", 200))
        futures_lot_size = float(parameters.get("futuresLotSize", 50))
        call_lot_size = float(parameters.get("callLotSize", 50))
        
        # Generate price points
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            # Futures P&L: (currentPrice - entryPrice) × lotSize
            futures_pnl = (price - futures_price) * futures_lot_size
            
            # Call P&L (we sold the call):
            # - If price <= strike: keep premium
            # - If price > strike: premium - (price - strike)
            if price <= call_strike:
                call_pnl = premium * call_lot_size
            else:
                call_pnl = (premium - (price - call_strike)) * call_lot_size
            
            total_pnl = futures_pnl + call_pnl
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_bull_call_spread(
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """
        Calculate payoff for Bull Call Spread.
        
        Position:
        - Buy call at lower strike
        - Sell call at higher strike
        """
        long_call_strike = float(parameters.get("longCallStrike", underlying_price))
        short_call_strike = float(parameters.get("shortCallStrike", underlying_price + 1000))
        long_call_premium = float(parameters.get("longCallPremium", 300))
        short_call_premium = float(parameters.get("shortCallPremium", 150))
        lot_size = float(parameters.get("lotSize", 50))
        
        # Net debit paid
        net_debit = long_call_premium - short_call_premium
        
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            # Long call P&L
            if price <= long_call_strike:
                long_call_pnl = -long_call_premium
            else:
                long_call_pnl = (price - long_call_strike) - long_call_premium
            
            # Short call P&L
            if price <= short_call_strike:
                short_call_pnl = short_call_premium
            else:
                short_call_pnl = short_call_premium - (price - short_call_strike)
            
            total_pnl = (long_call_pnl + short_call_pnl) * lot_size
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_iron_condor(
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """Calculate payoff for Iron Condor."""
        lot_size = float(parameters.get("lotSize", 50))
        put_buy_strike = float(parameters.get("putBuyStrike", underlying_price - 1000))
        put_sell_strike = float(parameters.get("putSellStrike", underlying_price - 500))
        call_sell_strike = float(parameters.get("callSellStrike", underlying_price + 500))
        call_buy_strike = float(parameters.get("callBuyStrike", underlying_price + 1000))
        net_premium = float(parameters.get("netPremium", 100))
        
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            pnl = net_premium  # Start with premium received
            
            # Put spread
            if price < put_buy_strike:
                pnl -= (put_buy_strike - price) - (put_sell_strike - price)
            elif price < put_sell_strike:
                pnl -= (put_sell_strike - price)
            
            # Call spread
            if price > call_buy_strike:
                pnl -= (price - call_buy_strike) - (price - call_sell_strike)
            elif price > call_sell_strike:
                pnl -= (price - call_sell_strike)
            
            total_pnl = pnl * lot_size
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_long_straddle(
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """Calculate payoff for Long Straddle."""
        strike = float(parameters.get("strike", underlying_price))
        call_premium = float(parameters.get("callPremium", 300))
        put_premium = float(parameters.get("putPremium", 300))
        lot_size = float(parameters.get("lotSize", 50))
        
        total_premium_paid = call_premium + put_premium
        
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            # Call payoff
            call_pnl = max(0, price - strike) - call_premium
            
            # Put payoff
            put_pnl = max(0, strike - price) - put_premium
            
            total_pnl = (call_pnl + put_pnl) * lot_size
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_protective_put(
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """Calculate payoff for Protective Put."""
        stock_price = float(parameters.get("stockPrice", underlying_price))
        put_strike = float(parameters.get("putStrike", underlying_price - 500))
        put_premium = float(parameters.get("putPremium", 200))
        lot_size = float(parameters.get("lotSize", 50))
        
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            # Stock P&L
            stock_pnl = price - stock_price
            
            # Put P&L
            put_pnl = max(0, put_strike - price) - put_premium
            
            total_pnl = (stock_pnl + put_pnl) * lot_size
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_butterfly_spread(
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """Calculate payoff for Butterfly Spread."""
        lower_strike = float(parameters.get("lowerStrike", underlying_price - 500))
        middle_strike = float(parameters.get("middleStrike", underlying_price))
        upper_strike = float(parameters.get("upperStrike", underlying_price + 500))
        lower_premium = float(parameters.get("lowerPremium", 300))
        middle_premium = float(parameters.get("middlePremium", 200))
        upper_premium = float(parameters.get("upperPremium", 100))
        lot_size = float(parameters.get("lotSize", 50))
        
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            # Buy lower strike call
            lower_pnl = max(0, price - lower_strike) - lower_premium
            
            # Sell 2x middle strike calls
            middle_pnl = (middle_premium - max(0, price - middle_strike)) * 2
            
            # Buy upper strike call
            upper_pnl = max(0, price - upper_strike) - upper_premium
            
            total_pnl = (lower_pnl + middle_pnl + upper_pnl) * lot_size
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_custom_strategy(
        custom_legs: List[Dict[str, Any]],
        underlying_price: float,
        price_range_percent: float
    ) -> List[PayoffDataPoint]:
        """Calculate payoff for custom multi-leg strategy."""
        price_points = PayoffCalculatorService.calculate_price_range(
            underlying_price, price_range_percent
        )
        
        payoff_data = []
        
        for price in price_points:
            total_pnl = 0
            
            for leg in custom_legs:
                leg_type = leg.get("type")  # FUT, CE, PE
                action = leg.get("action")  # BUY, SELL
                lot_size = float(leg.get("lotSize", 0))
                
                if leg_type == "FUT":
                    entry_price = float(leg.get("entryPrice", underlying_price))
                    if action == "BUY":
                        leg_pnl = (price - entry_price) * lot_size
                    else:  # SELL
                        leg_pnl = (entry_price - price) * lot_size
                else:  # Options (CE or PE)
                    strike = float(leg.get("strike", underlying_price))
                    premium = float(leg.get("premium", 0))
                    
                    if leg_type == "CE":  # Call
                        intrinsic = max(0, price - strike)
                    else:  # PE (Put)
                        intrinsic = max(0, strike - price)
                    
                    if action == "BUY":
                        leg_pnl = (intrinsic - premium) * lot_size
                    else:  # SELL
                        leg_pnl = (premium - intrinsic) * lot_size
                
                total_pnl += leg_pnl
            
            payoff_data.append(
                PayoffDataPoint(
                    price=round(price, 2),
                    pnl=round(total_pnl, 2)
                )
            )
        
        return payoff_data
    
    @staticmethod
    def calculate_payoff(
        strategy_type: str,
        parameters: Dict[str, Any],
        underlying_price: float,
        price_range_percent: float,
        custom_legs: List[Dict[str, Any]] = None
    ) -> List[PayoffDataPoint]:
        """
        Main entry point for payoff calculation.
        Routes to specific strategy calculator.
        """
        # Ensure parameters is a dict (not None)
        if parameters is None:
            parameters = {}
        
        strategy_calculators = {
            "covered-call": PayoffCalculatorService.calculate_covered_call,
            "bull-call-spread": PayoffCalculatorService.calculate_bull_call_spread,
            "iron-condor": PayoffCalculatorService.calculate_iron_condor,
            "long-straddle": PayoffCalculatorService.calculate_long_straddle,
            "protective-put": PayoffCalculatorService.calculate_protective_put,
            "butterfly-spread": PayoffCalculatorService.calculate_butterfly_spread,
        }
        
        if strategy_type == "custom-strategy":
            if not custom_legs:
                return []
            return PayoffCalculatorService.calculate_custom_strategy(
                custom_legs, underlying_price, price_range_percent
            )
        
        calculator = strategy_calculators.get(strategy_type)
        if not calculator:
            raise ValueError(f"Unknown strategy type: {strategy_type}")
        
        return calculator(parameters, underlying_price, price_range_percent)