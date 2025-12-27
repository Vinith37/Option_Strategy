"""
FastAPI main application.
Entry point for the Options Strategy Builder API.
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import init_db
from .routers import payoff, strategies

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Runs on startup and shutdown.
    """
    # Startup
    logger.info("=" * 60)
    logger.info("🚀 Starting Options Strategy Builder API")
    logger.info(f"📡 Environment: {settings.environment}")
    logger.info(f"🔗 CORS enabled for: {settings.frontend_url}")
    logger.info(f"🗄️  Database: {settings.database_url.split('@')[1] if '@' in settings.database_url else 'configured'}")
    logger.info("=" * 60)
    
    # Initialize database tables
    try:
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Options Strategy Builder API")


# Create FastAPI application
app = FastAPI(
    title="Options Strategy Builder API",
    description="Backend API for calculating and managing options trading strategies",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],  # Frontend URL from environment
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(payoff.router, prefix="/api")
app.include_router(strategies.router, prefix="/api")


@app.get(
    "/",
    status_code=status.HTTP_200_OK,
    tags=["Health"],
    summary="Root endpoint",
    description="Basic information about the API"
)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Options Strategy Builder API",
        "version": "2.0.0",
        "environment": settings.environment,
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "calculate_payoff": "POST /api/payoff/calculate",
            "create_strategy": "POST /api/strategies",
            "get_strategies": "GET /api/strategies",
            "get_strategy": "GET /api/strategies/{id}",
            "update_strategy": "PUT /api/strategies/{id}",
            "delete_strategy": "DELETE /api/strategies/{id}",
        }
    }


@app.get(
    "/api/health",
    status_code=status.HTTP_200_OK,
    tags=["Health"],
    summary="Health check",
    description="Check if the API is running and database is accessible"
)
async def health_check():
    """
    Health check endpoint.
    Used by frontend to detect backend availability.
    """
    try:
        # Could add database ping here if needed
        return {
            "status": "healthy",
            "service": "Options Strategy Builder API",
            "version": "2.0.0",
            "environment": settings.environment
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for uncaught exceptions.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
