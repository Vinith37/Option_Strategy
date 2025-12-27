# 📚 API Reference - Options Strategy Builder

## Base URL

```
http://localhost:3001/api
```

For production, update the `API_BASE_URL` in your environment.

---

## Health Check

### `GET /health`

Check if the backend server is running.

**Request:**
```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Options Strategy Builder API is running"
}
```

**Status Codes:**
- `200` - Server is healthy

---

## Calculate Payoff

### `POST /calculate-payoff`

Calculate the payoff diagram for a strategy.

---

### **Covered Call**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "covered-call",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "futuresLotSize": "50",
      "futuresPrice": "18000",
      "callLotSize": "50",
      "callStrike": "18500",
      "premium": "200",
      "exitDate": "",
      "exitFuturesPrice": "",
      "exitCallPrice": ""
    }
  }'
```

**Parameters:**
- `futuresLotSize` (required) - Number of futures contracts
- `futuresPrice` (required) - Entry price for futures
- `callLotSize` (required) - Number of call contracts to sell
- `callStrike` (required) - Strike price for the call
- `premium` (required) - Premium received per call
- `exitDate` (optional) - Exit date for P&L tracking
- `exitFuturesPrice` (optional) - Exit price for futures
- `exitCallPrice` (optional) - Exit price for call

**Response:**
```json
[
  { "price": 16200, "pnl": -90000 },
  { "price": 16380, "pnl": -81000 },
  { "price": 16560, "pnl": -72000 },
  ...
  { "price": 18500, "pnl": 35000 },
  { "price": 18680, "pnl": 35000 },
  { "price": 19980, "pnl": 35000 }
]
```

---

### **Bull Call Spread**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "bull-call-spread",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "longCallStrike": "18000",
      "shortCallStrike": "19000",
      "lotSize": "50",
      "longCallPremium": "300",
      "shortCallPremium": "150"
    }
  }'
```

**Parameters:**
- `longCallStrike` (required) - Strike price of the long call
- `shortCallStrike` (required) - Strike price of the short call
- `lotSize` (required) - Number of contracts
- `longCallPremium` (required) - Premium paid for long call
- `shortCallPremium` (required) - Premium received for short call

---

### **Iron Condor**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "iron-condor",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "lotSize": "50",
      "putBuyStrike": "17000",
      "putSellStrike": "17500",
      "callSellStrike": "18500",
      "callBuyStrike": "19000",
      "netPremium": "100"
    }
  }'
```

**Parameters:**
- `lotSize` (required) - Number of contracts
- `putBuyStrike` (required) - Long put strike
- `putSellStrike` (required) - Short put strike
- `callSellStrike` (required) - Short call strike
- `callBuyStrike` (required) - Long call strike
- `netPremium` (required) - Net premium received

---

### **Long Straddle**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "long-straddle",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "strikePrice": "18000",
      "callLotSize": "50",
      "putLotSize": "50",
      "callPremium": "250",
      "putPremium": "240"
    }
  }'
```

**Parameters:**
- `strikePrice` (required) - Strike price for both options
- `callLotSize` (required) - Number of call contracts
- `putLotSize` (required) - Number of put contracts
- `callPremium` (required) - Premium paid for call
- `putPremium` (required) - Premium paid for put

---

### **Protective Put**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "protective-put",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "stockLotSize": "50",
      "stockPrice": "18000",
      "putStrike": "17500",
      "putLotSize": "50",
      "putPremium": "150"
    }
  }'
```

**Parameters:**
- `stockLotSize` (required) - Number of stock/futures contracts
- `stockPrice` (required) - Current stock price
- `putStrike` (required) - Put strike price
- `putLotSize` (required) - Number of put contracts
- `putPremium` (required) - Premium paid for put

---

### **Butterfly Spread**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "butterfly-spread",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "lotSize": "50",
      "lowerStrike": "17500",
      "middleStrike": "18000",
      "upperStrike": "18500",
      "lowerPremium": "300",
      "middlePremium": "200",
      "upperPremium": "120"
    }
  }'
```

**Parameters:**
- `lotSize` (required) - Number of contracts
- `lowerStrike` (required) - Lower strike (buy)
- `middleStrike` (required) - Middle strike (sell 2x)
- `upperStrike` (required) - Upper strike (buy)
- `lowerPremium` (required) - Premium paid for lower strike
- `middlePremium` (required) - Premium received for middle strike
- `upperPremium` (required) - Premium paid for upper strike

---

### **Custom Strategy**

**Request:**
```bash
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{
    "strategyType": "custom-strategy",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "customLegs": [
      {
        "id": "leg-1",
        "type": "FUT",
        "action": "BUY",
        "entryPrice": 18000,
        "lotSize": 50
      },
      {
        "id": "leg-2",
        "type": "CE",
        "action": "SELL",
        "strikePrice": 18500,
        "lotSize": 50,
        "premium": 200
      }
    ]
  }'
```

**Leg Types:**
- `FUT` - Futures
- `CE` - Call Option
- `PE` - Put Option

**Leg Actions:**
- `BUY` - Long position
- `SELL` - Short position

**Leg Parameters:**
- `id` (required) - Unique identifier
- `type` (required) - FUT, CE, or PE
- `action` (required) - BUY or SELL
- `lotSize` (required) - Number of contracts
- `strikePrice` (required for CE/PE) - Strike price
- `entryPrice` (required for FUT) - Entry price
- `premium` (required for CE/PE) - Premium paid/received

---

## Response Format

### **Success Response**

All calculation endpoints return an array of payoff data points:

```typescript
PayoffDataPoint[] = [
  {
    price: number,  // Underlying price at expiration
    pnl: number     // Profit/Loss at that price
  },
  ...
]
```

**Example:**
```json
[
  { "price": 16200, "pnl": -90000 },
  { "price": 16380, "pnl": -81000 },
  { "price": 16560, "pnl": -72000 }
]
```

---

### **Error Response**

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Status Codes:**
- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error

---

## Strategy Management

### `POST /strategies`

Save a strategy.

**Request:**
```bash
curl -X POST http://localhost:3001/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Covered Call",
    "type": "covered-call",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": {
      "futuresLotSize": "50",
      "futuresPrice": "18000",
      "callLotSize": "50",
      "callStrike": "18500",
      "premium": "200"
    },
    "notes": "Conservative income strategy",
    "timestamp": "2025-01-01T10:00:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "id": "strategy-uuid",
  "message": "Strategy saved successfully"
}
```

---

### `GET /strategies`

Get all saved strategies.

**Request:**
```bash
curl http://localhost:3001/api/strategies
```

**Response:**
```json
[
  {
    "id": "strategy-1",
    "name": "My Covered Call",
    "type": "covered-call",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": { ... },
    "notes": "Conservative income strategy",
    "timestamp": "2025-01-01T10:00:00Z"
  },
  ...
]
```

---

### `GET /strategies/:id`

Get a specific strategy by ID.

**Request:**
```bash
curl http://localhost:3001/api/strategies/strategy-uuid
```

**Response:**
```json
{
  "id": "strategy-uuid",
  "name": "My Covered Call",
  "type": "covered-call",
  "entryDate": "2025-01-01",
  "expiryDate": "2025-01-31",
  "parameters": { ... },
  "notes": "Conservative income strategy",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

---

### `PUT /strategies/:id`

Update a strategy.

**Request:**
```bash
curl -X PUT http://localhost:3001/api/strategies/strategy-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Covered Call",
    "type": "covered-call",
    "entryDate": "2025-01-01",
    "expiryDate": "2025-01-31",
    "parameters": { ... },
    "notes": "Updated notes",
    "timestamp": "2025-01-02T10:00:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Strategy updated successfully"
}
```

---

### `DELETE /strategies/:id`

Delete a strategy.

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/strategies/strategy-uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Strategy deleted successfully"
}
```

---

## Data Types

### **StrategyType**
```typescript
type StrategyType = 
  | "covered-call"
  | "bull-call-spread"
  | "iron-condor"
  | "long-straddle"
  | "protective-put"
  | "butterfly-spread"
  | "custom-strategy";
```

### **LegType**
```typescript
type LegType = "CE" | "PE" | "FUT";
```

### **LegAction**
```typescript
type LegAction = "BUY" | "SELL";
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting middleware.

---

## CORS

CORS is enabled for all origins in development. For production, configure specific allowed origins in `server.ts`.

---

## Authentication

Currently, no authentication is required. For production use with real data, implement proper authentication and authorization.

---

## Error Handling

All endpoints include try-catch error handling and return appropriate HTTP status codes.

**Common Errors:**
- `400` - Missing required parameters
- `404` - Strategy not found
- `500` - Server error

**Error Response Format:**
```json
{
  "error": "Brief error message",
  "message": "Detailed description"
}
```

---

## Testing

### **Using cURL:**

```bash
# Test health check
curl http://localhost:3001/api/health

# Test covered call calculation
curl -X POST http://localhost:3001/api/calculate-payoff \
  -H "Content-Type: application/json" \
  -d '{"strategyType":"covered-call","entryDate":"2025-01-01","expiryDate":"2025-01-31","parameters":{"futuresLotSize":"50","futuresPrice":"18000","callLotSize":"50","callStrike":"18500","premium":"200"}}'
```

### **Using Postman:**

1. Import the collection from `/backend/postman_collection.json` (if available)
2. Set base URL to `http://localhost:3001/api`
3. Run the requests

### **Using JavaScript:**

```javascript
// Calculate covered call payoff
const response = await fetch('http://localhost:3001/api/calculate-payoff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    strategyType: 'covered-call',
    entryDate: '2025-01-01',
    expiryDate: '2025-01-31',
    parameters: {
      futuresLotSize: '50',
      futuresPrice: '18000',
      callLotSize: '50',
      callStrike: '18500',
      premium: '200'
    }
  })
});

const data = await response.json();
console.log(data);
```

---

## Production Deployment

### **Environment Variables:**

Create a `.env` file:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### **Build and Run:**

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start
```

---

## Summary

✅ **Base URL**: `http://localhost:3001/api`
✅ **All strategies supported**: 6 predefined + custom
✅ **RESTful endpoints**: Calculate, Save, Get, Update, Delete
✅ **Flexible parameters**: Generic Record<string, string>
✅ **Error handling**: Proper status codes and messages
✅ **CORS enabled**: For frontend communication
✅ **Health check**: `/health` endpoint

**Ready for production with proper environment configuration!** 🚀
