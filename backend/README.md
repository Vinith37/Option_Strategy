# 🔧 Backend - Options Strategy Builder API

FastAPI backend for calculating and managing options trading strategies.

## 🏗️ Architecture

```
app/
├── routers/              # API endpoints (Controllers)
│   ├── payoff.py        # Payoff calculation endpoints
│   └── strategies.py    # Strategy CRUD endpoints
│
├── services/            # Business Logic Layer
│   ├── payoff_calculator.py  # Payoff calculations
│   └── strategy_service.py   # Strategy operations
│
├── models/              # Database Models (SQLAlchemy)
│   └── strategy.py      # Strategy table model
│
├── schemas/             # Request/Response Validation (Pydantic)
│   └── strategy.py      # API schemas
│
├── config.py            # Configuration management
├── database.py          # Database setup and session
└── main.py              # FastAPI application

```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate  # Windows

# Install packages
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
FRONTEND_URL=http://localhost:5173
API_PORT=8000
SECRET_KEY=your-secret-key
```

### 3. Initialize Database

```bash
# Tables are created automatically on first run
# Or manually:
python -c "from app.database import init_db; init_db()"
```

### 4. Run Server

```bash
# Development mode (with auto-reload)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Server runs on `http://localhost:8000`

---

## 📚 API Documentation

### Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "service": "Options Strategy Builder API",
  "version": "2.0.0",
  "environment": "development"
}
```

#### Calculate Payoff
```http
POST /api/payoff/calculate
```

Request:
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

Response:
```json
[
  { "price": 12600, "pnl": -260000 },
  { "price": 12820, "pnl": -249000 },
  ...
]
```

#### Create Strategy
```http
POST /api/strategies
```

Request:
```json
{
  "name": "My Covered Call",
  "strategy_type": "covered-call",
  "entry_date": "2025-12-26",
  "expiry_date": "2026-01-26",
  "parameters": {
    "futuresPrice": "18000",
    "callStrike": "18500",
    "premium": "200"
  },
  "notes": "Conservative strategy"
}
```

Response:
```json
{
  "success": true,
  "message": "Strategy created successfully",
  "data": {
    "id": 1,
    "name": "My Covered Call",
    "strategy_type": "covered-call",
    ...
  }
}
```

#### Get All Strategies
```http
GET /api/strategies?skip=0&limit=100
```

#### Get Strategy by ID
```http
GET /api/strategies/{id}
```

#### Update Strategy
```http
PUT /api/strategies/{id}
```

#### Delete Strategy
```http
DELETE /api/strategies/{id}
```

---

## 🗄️ Database

### Models

**Strategy Table:**
```sql
CREATE TABLE strategies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    strategy_type VARCHAR(100) NOT NULL,
    entry_date VARCHAR(50) NOT NULL,
    expiry_date VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL,
    custom_legs JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `API_PORT` | Server port | `8000` |
| `API_HOST` | Server host | `0.0.0.0` |
| `ENVIRONMENT` | Environment name | `development`/`production` |
| `DEBUG` | Debug mode | `True`/`False` |
| `SECRET_KEY` | Secret key for security | `random-string` |

---

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:8000/api/health
```

### Test Payoff Calculation

```bash
curl -X POST http://localhost:8000/api/payoff/calculate \
  -H "Content-Type: application/json" \
  -d @test_payload.json
```

### Test Database Connection

```python
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))
    print(result.scalar())  # Should print: 1
```

---

## 🚀 Deployment (Railway)

### 1. Create Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

### 2. Configure Environment

In Railway dashboard, add environment variables:
```
DATABASE_URL=<neon-connection-string>
FRONTEND_URL=https://your-frontend.vercel.app
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<secure-random-string>
API_PORT=8000
API_HOST=0.0.0.0
```

### 3. Configure Service

**Root Directory:** `/backend`

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4. Deploy

```bash
railway up
```

Or connect GitHub repository for auto-deployment.

---

## 📁 Code Structure

### Routers (Controllers)
Handle HTTP requests/responses. Delegate to services.

```python
@router.post("/calculate")
async def calculate_payoff(request: PayoffRequest):
    payoff_data = PayoffCalculatorService.calculate_payoff(...)
    return payoff_data
```

### Services (Business Logic)
Perform calculations and operations. No HTTP knowledge.

```python
class PayoffCalculatorService:
    @staticmethod
    def calculate_covered_call(params):
        # Business logic here
        return payoff_data
```

### Models (Database)
SQLAlchemy ORM models.

```python
class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    # ...
```

### Schemas (Validation)
Pydantic models for request/response validation.

```python
class PayoffRequest(BaseModel):
    strategy_type: str
    parameters: Dict[str, Any]
    # ...
```

---

## 🐛 Troubleshooting

### Database Connection Fails

**Error:** `could not connect to server`

**Solution:**
1. Check `DATABASE_URL` format
2. Ensure SSL is enabled: `?sslmode=require`
3. Verify Neon database is active
4. Test connection: `psql $DATABASE_URL`

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
1. Check `FRONTEND_URL` in `.env`
2. Ensure frontend URL matches exactly (no trailing slash)
3. Restart backend after changing `.env`

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
1. Activate virtual environment: `source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Run from project root: `python -m uvicorn app.main:app`

---

## 📝 Development Guidelines

### Adding a New Endpoint

1. **Create route in router:**
   ```python
   # app/routers/my_router.py
   @router.get("/my-endpoint")
   async def my_endpoint():
       return {"message": "Hello"}
   ```

2. **Add business logic to service:**
   ```python
   # app/services/my_service.py
   class MyService:
       @staticmethod
       def do_something():
           # Logic here
   ```

3. **Register router in main.py:**
   ```python
   from app.routers import my_router
   app.include_router(my_router.router, prefix="/api")
   ```

### Adding a New Model

1. **Create model:**
   ```python
   # app/models/my_model.py
   class MyModel(Base):
       __tablename__ = "my_table"
       # columns...
   ```

2. **Import in database.py:**
   ```python
   from app.models import my_model
   ```

3. **Create migration:**
   ```bash
   alembic revision --autogenerate -m "add my_table"
   alembic upgrade head
   ```

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

---

**Last Updated:** December 26, 2025  
**Version:** 2.0.0
