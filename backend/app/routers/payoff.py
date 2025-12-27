"""
Payoff calculation endpoints (Controller layer).
Handles HTTP requests/responses and delegates to service layer.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from ..schemas.strategy import PayoffRequest, PayoffDataPoint, StandardResponse
from ..services.payoff_calculator import PayoffCalculatorService

router = APIRouter(
    prefix="/payoff",
    tags=["Payoff Calculation"]
)


@router.post(
    "/calculate",
    response_model=List[PayoffDataPoint],
    status_code=status.HTTP_200_OK,
    summary="Calculate payoff diagram",
    description="Calculate payoff curve for a given strategy and price range"
)
async def calculate_payoff(request: PayoffRequest):
    """
    Calculate payoff diagram for a strategy.
    
    **Request Body:**
    - strategy_type: Type of strategy (covered-call, bull-call-spread, etc.)
    - entry_date: Entry date (YYYY-MM-DD)
    - expiry_date: Expiry date (YYYY-MM-DD)
    - parameters: Strategy-specific parameters (dict)
    - underlying_price: Current underlying price (default: 18000)
    - price_range_percent: Price range % (10-100, default: 30)
    - custom_legs: For custom strategies (array of leg objects)
    
    **Returns:**
    Array of {price, pnl} objects for charting
    
    **Example:**
    ```json
    {
      "strategy_type": "covered-call",
      "entry_date": "2025-12-26",
      "expiry_date": "2026-01-26",
      "parameters": {
        "futuresPrice": "18000",
        "callStrike": "18500",
        "premium": "200",
        "futuresLotSize": "50",
        "callLotSize": "50"
      },
      "underlying_price": 18000,
      "price_range_percent": 30
    }
    ```
    """
    try:
        # Delegate to service layer for calculation
        payoff_data = PayoffCalculatorService.calculate_payoff(
            strategy_type=request.strategy_type,
            parameters=request.parameters,
            underlying_price=request.underlying_price,
            price_range_percent=request.price_range_percent,
            custom_legs=request.custom_legs
        )
        
        return payoff_data
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
