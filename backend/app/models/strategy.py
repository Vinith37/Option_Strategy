"""
SQLAlchemy model for Strategy entity.
Represents saved trading strategies in the database.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base


class Strategy(Base):
    """
    Strategy database model.
    Stores user-configured trading strategies.
    """
    __tablename__ = "strategies"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Strategy identification
    name = Column(String(255), nullable=False, index=True)
    strategy_type = Column(String(100), nullable=False, index=True)
    
    # Dates
    entry_date = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=False)
    
    # Strategy parameters (stored as JSON)
    parameters = Column(JSON, nullable=False, default={})
    
    # Custom strategy legs (stored as JSON array)
    custom_legs = Column(JSON, nullable=True, default=[])
    
    # User notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return f"<Strategy(id={self.id}, name='{self.name}', type='{self.strategy_type}')>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON response."""
        return {
            "id": self.id,
            "name": self.name,
            "strategy_type": self.strategy_type,
            "entry_date": self.entry_date,
            "expiry_date": self.expiry_date,
            "parameters": self.parameters,
            "custom_legs": self.custom_legs,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
