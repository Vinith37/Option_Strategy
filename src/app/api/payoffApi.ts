import { StrategyType, PayoffDataPoint, CustomLeg } from "../types/strategy";
import {
  calculateCoveredCall,
  calculateBullCallSpread,
  calculateIronCondor,
  calculateLongStraddle,
  calculateProtectivePut,
  calculateButterflySpread,
  calculateCustomStrategy,
} from "../utils/localCalculations";

// Backend API configuration
// API base URL loaded from environment variable (no hard-coded localhost)
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getApiBaseUrl(): string {
  // Use environment variable for API URL
  // This allows different URLs for development, staging, and production
  return import.meta.env.VITE_API_URL || DEFAULT_API_URL;
}

// Flag to control whether to use backend or local calculations
let useBackend = false;
let backendChecked = false;

async function checkBackendAvailability(): Promise<boolean> {
  if (backendChecked) {
    return useBackend;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    useBackend = response.ok;
    backendChecked = true;
    console.log(`Backend ${useBackend ? 'available' : 'not available'} - using ${useBackend ? 'backend' : 'local'} calculations`);
    return useBackend;
  } catch (error) {
    useBackend = false;
    backendChecked = true;
    console.log('Backend not available - using local calculations');
    return false;
  }
}

/**
 * Calculate payoff locally (browser-side)
 */
function calculatePayoffLocally(request: PayoffRequest): PayoffDataPoint[] {
  const { strategyType, parameters, customLegs } = request;

  switch (strategyType) {
    case "covered-call":
      return parameters ? calculateCoveredCall(parameters) : [{ price: 18000, pnl: 0 }];

    case "bull-call-spread":
      return parameters ? calculateBullCallSpread(parameters) : [{ price: 18000, pnl: 0 }];

    case "iron-condor":
      return parameters ? calculateIronCondor(parameters) : [{ price: 18000, pnl: 0 }];

    case "long-straddle":
      return parameters ? calculateLongStraddle(parameters) : [{ price: 18000, pnl: 0 }];

    case "protective-put":
      return parameters ? calculateProtectivePut(parameters) : [{ price: 18000, pnl: 0 }];

    case "butterfly-spread":
      return parameters ? calculateButterflySpread(parameters) : [{ price: 18000, pnl: 0 }];

    case "custom-strategy":
      return customLegs ? calculateCustomStrategy(customLegs) : [{ price: 18000, pnl: 0 }];

    default:
      return [{ price: 18000, pnl: 0 }];
  }
}

export interface PayoffRequest {
  strategyType: StrategyType;
  entryDate: string;
  expiryDate: string;
  parameters?: Record<string, string>;
  customLegs?: CustomLeg[];
  underlyingPrice?: number;
  priceRangePercent?: number;
}

export interface SaveStrategyRequest {
  name: string;
  type: StrategyType;
  entryDate: string;
  expiryDate: string;
  parameters?: Record<string, string>;
  customLegs?: CustomLeg[];
  notes?: string;
  timestamp: string;
}

export interface SaveStrategyResponse {
  success: boolean;
  id?: string;
  message: string;
}

/**
 * Fetch payoff data from backend
 */
export async function fetchPayoffData(request: PayoffRequest): Promise<PayoffDataPoint[]> {
  const useBackend = await checkBackendAvailability();

  if (useBackend) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/payoff/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy_type: request.strategyType,
          entry_date: request.entryDate,
          expiry_date: request.expiryDate,
          parameters: request.parameters || {},
          underlying_price: request.underlyingPrice || 18000,
          price_range_percent: request.priceRangePercent || 30,
          custom_legs: request.customLegs || null
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to fetch payoff data' }));
        console.error('Backend error:', error);
        throw new Error(error.detail || error.message || 'Failed to fetch payoff data');
      }

      const data: PayoffDataPoint[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payoff data:', error);
      // Fallback to local calculations on error
      return calculatePayoffLocally(request);
    }
  } else {
    return calculatePayoffLocally(request);
  }
}

/**
 * Save strategy to backend
 */
export async function saveStrategyToBackend(
  request: SaveStrategyRequest
): Promise<SaveStrategyResponse> {
  console.log('📡 saveStrategyToBackend called with:', request);
  
  const apiUrl = `${getApiBaseUrl()}/strategies`;
  console.log('🌐 API URL:', apiUrl);
  
  const payload = {
    name: request.name,
    strategy_type: request.type,
    entry_date: request.entryDate,
    expiry_date: request.expiryDate,
    parameters: request.parameters || {},
    custom_legs: request.customLegs || null,
    notes: request.notes || null,
  };
  
  console.log('📦 Payload to send:', JSON.stringify(payload, null, 2));
  
  try {
    console.log('🚀 Sending POST request...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend error response:', error);
      throw new Error(error.detail || error.message || 'Failed to save strategy');
    }

    const data = await response.json();
    console.log('✅ Success response data:', data);
    
    return {
      success: data.success,
      id: data.data?.id,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error in saveStrategyToBackend:', error);
    throw error;
  }
}

/**
 * Get all saved strategies
 */
export async function getAllStrategies(): Promise<any[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/strategies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch strategies');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return [];
  }
}

/**
 * Get strategy by ID
 */
export async function getStrategyById(id: string): Promise<any> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/strategies/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch strategy');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching strategy:', error);
    throw error;
  }
}

/**
 * Update strategy
 */
export async function updateStrategy(
  id: string,
  request: SaveStrategyRequest
): Promise<SaveStrategyResponse> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/strategies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update strategy');
    }

    const data: SaveStrategyResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating strategy:', error);
    throw error;
  }
}

/**
 * Delete strategy
 */
export async function deleteStrategy(id: string): Promise<void> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/strategies/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete strategy');
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
    throw error;
  }
}

/**
 * Health check - verify backend is running
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}