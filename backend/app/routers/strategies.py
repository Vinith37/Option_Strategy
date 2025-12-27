"""
Strategy management endpoints (Controller layer).
CRUD operations for saved strategies.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.strategy import (
    StrategyCreate,
    StrategyUpdate,
    StrategyResponse,
    StandardResponse
)
from ..services.strategy_service import StrategyService

router = APIRouter(
    prefix="/strategies",
    tags=["Strategy Management"]
)


@router.post(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new strategy",
    description="Save a new trading strategy to the database"
)
async def create_strategy(
    strategy: StrategyCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new strategy.
    
    **Request Body:**
    - name: Strategy name
    - strategy_type: Type of strategy
    - entry_date: Entry date (YYYY-MM-DD)
    - expiry_date: Expiry date (YYYY-MM-DD)
    - parameters: Strategy parameters (dict)
    - custom_legs: Custom strategy legs (optional, array)
    - notes: User notes (optional)
    
    **Returns:**
    Standard response with created strategy data
    """
    try:
        db_strategy = StrategyService.create_strategy(db, strategy)
        
        return StandardResponse(
            success=True,
            message="Strategy created successfully",
            data=db_strategy.to_dict()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create strategy: {str(e)}"
        )


@router.get(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all strategies",
    description="Retrieve all saved strategies with pagination"
)
async def get_strategies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all strategies.
    
    **Query Parameters:**
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 100)
    
    **Returns:**
    Standard response with array of strategies
    """
    try:
        strategies = StrategyService.get_strategies(db, skip=skip, limit=limit)
        
        return StandardResponse(
            success=True,
            message=f"Retrieved {len(strategies)} strategies",
            data=[s.to_dict() for s in strategies]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve strategies: {str(e)}"
        )


@router.get(
    "/{strategy_id}",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get strategy by ID",
    description="Retrieve a specific strategy by its ID"
)
async def get_strategy(
    strategy_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a strategy by ID.
    
    **Path Parameters:**
    - strategy_id: Strategy ID (integer)
    
    **Returns:**
    Standard response with strategy data
    """
    strategy = StrategyService.get_strategy_by_id(db, strategy_id)
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with ID {strategy_id} not found"
        )
    
    return StandardResponse(
        success=True,
        message="Strategy retrieved successfully",
        data=strategy.to_dict()
    )


@router.put(
    "/{strategy_id}",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a strategy",
    description="Update an existing strategy by ID"
)
async def update_strategy(
    strategy_id: int,
    strategy: StrategyUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a strategy.
    
    **Path Parameters:**
    - strategy_id: Strategy ID (integer)
    
    **Request Body:**
    Same as create, but all fields are optional
    
    **Returns:**
    Standard response with updated strategy data
    """
    updated_strategy = StrategyService.update_strategy(db, strategy_id, strategy)
    
    if not updated_strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with ID {strategy_id} not found"
        )
    
    return StandardResponse(
        success=True,
        message="Strategy updated successfully",
        data=updated_strategy.to_dict()
    )


@router.delete(
    "/{strategy_id}",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a strategy",
    description="Delete a strategy by ID"
)
async def delete_strategy(
    strategy_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a strategy.
    
    **Path Parameters:**
    - strategy_id: Strategy ID (integer)
    
    **Returns:**
    Standard response confirming deletion
    """
    success = StrategyService.delete_strategy(db, strategy_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with ID {strategy_id} not found"
        )
    
    return StandardResponse(
        success=True,
        message=f"Strategy {strategy_id} deleted successfully",
        data=None
    )
