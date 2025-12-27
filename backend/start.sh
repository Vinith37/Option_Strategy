#!/bin/bash
# Startup script for Railway deployment

echo "🚀 Starting Options Strategy Builder API..."

# Start the FastAPI application
# Database tables will be created automatically via init_db() in main.py
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
