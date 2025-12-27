"""
Strategy service - Business logic for strategy CRUD operations.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.strategy import Strategy
from ..schemas.strategy import StrategyCreate, StrategyUpdate


class StrategyService:
    """Service for managing strategies in the database."""
    
    @staticmethod
    def create_strategy(db: Session, strategy_data: StrategyCreate) -> Strategy:
        """
        Create a new strategy in the database.
        
        Args:
            db: Database session
            strategy_data: Strategy creation data
            
        Returns:
            Created Strategy model instance
        """
        db_strategy = Strategy(
            name=strategy_data.name,
            strategy_type=strategy_data.strategy_type,
            entry_date=strategy_data.entry_date,
            expiry_date=strategy_data.expiry_date,
            parameters=strategy_data.parameters,
            custom_legs=strategy_data.custom_legs or [],
            notes=strategy_data.notes
        )
        
        db.add(db_strategy)
        db.commit()
        db.refresh(db_strategy)
        
        return db_strategy
    
    @staticmethod
    def get_strategies(db: Session, skip: int = 0, limit: int = 100) -> List[Strategy]:
        """
        Retrieve all strategies with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of Strategy instances
        """
        return db.query(Strategy).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_strategy_by_id(db: Session, strategy_id: int) -> Optional[Strategy]:
        """
        Retrieve a strategy by ID.
        
        Args:
            db: Database session
            strategy_id: Strategy ID
            
        Returns:
            Strategy instance or None if not found
        """
        return db.query(Strategy).filter(Strategy.id == strategy_id).first()
    
    @staticmethod
    def update_strategy(
        db: Session,
        strategy_id: int,
        strategy_data: StrategyUpdate
    ) -> Optional[Strategy]:
        """
        Update an existing strategy.
        
        Args:
            db: Database session
            strategy_id: Strategy ID
            strategy_data: Updated strategy data
            
        Returns:
            Updated Strategy instance or None if not found
        """
        db_strategy = StrategyService.get_strategy_by_id(db, strategy_id)
        
        if not db_strategy:
            return None
        
        # Update fields if provided
        update_data = strategy_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_strategy, field, value)
        
        db.commit()
        db.refresh(db_strategy)
        
        return db_strategy
    
    @staticmethod
    def delete_strategy(db: Session, strategy_id: int) -> bool:
        """
        Delete a strategy by ID.
        
        Args:
            db: Database session
            strategy_id: Strategy ID
            
        Returns:
            True if deleted, False if not found
        """
        db_strategy = StrategyService.get_strategy_by_id(db, strategy_id)
        
        if not db_strategy:
            return False
        
        db.delete(db_strategy)
        db.commit()
        
        return True
