/**
 * Bosbase JS SDK
 * Uses BosBase SDK to track API calls and usage statistics
 */

import BosBase from "bosbase";

export interface ApiCallRecord {
  id: string;
  endpoint: string;
  method: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ApiStats {
  totalCalls: number;
  callsToday: number;
  callsThisMonth: number;
  lastCallTime?: number;
}

class BosbaseSDK {
  private pb: BosBase | null;
  private storageKey = "bosbase_api_calls_fallback";
  private statsKey = "bosbase_api_stats_fallback";

  constructor(bosbaseUrl?: string) {
    const url = bosbaseUrl || process.env.NEXT_PUBLIC_BOSBASE_URL || "http://localhost:8090/";
    if (typeof window !== "undefined") {
      this.pb = new BosBase(url);
      // Try to authenticate if credentials are available
      const email = process.env.NEXT_PUBLIC_BOSBASE_EMAIL;
      const password = process.env.NEXT_PUBLIC_BOSBASE_PASSWORD;
      if (email && password) {
        // Note: Client-side should use regular auth, not admin auth
        // Admin auth is only for server-side
        this.pb.authStore.clear();
      }
    } else {
      this.pb = null;
    }
    this.initializeStats();
  }

  /**
   * Initialize stats if they don't exist
   */
  private initializeStats() {
    if (typeof window === "undefined") return;

    const existing = localStorage.getItem(this.statsKey);
    if (!existing) {
      const initialStats: ApiStats = {
        totalCalls: 0,
        callsToday: 0,
        callsThisMonth: 0,
      };
      localStorage.setItem(this.statsKey, JSON.stringify(initialStats));
    }
  }

  /**
   * Record an API call
   */
  recordApiCall(endpoint: string, method: string = "POST", metadata?: Record<string, any>) {
    if (typeof window === "undefined") return;

    const record: ApiCallRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      timestamp: Date.now(),
      userId: undefined,
      metadata,
    };

    // Store the call record
    const calls = this.getApiCalls();
    calls.push(record);
    
    // Keep only last 1000 calls to prevent storage overflow
    if (calls.length > 1000) {
      calls.shift();
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(calls));

    // Update stats
    this.updateStats();

    return record;
  }

  /**
   * Get all API call records
   */
  getApiCalls(): ApiCallRecord[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get API call statistics
   * Uses server-side API route to avoid authentication issues
   */
  async getStats(): Promise<ApiStats> {
    // Use server-side API route instead of direct BosBase access
    // This avoids 403 errors since the server route has proper admin authentication
    try {
      const response = await fetch("/api/bosbase/stats");
      if (response.ok) {
        const data = await response.json();
        return {
          totalCalls: data.totalCalls || 0,
          callsToday: data.callsToday || 0,
          callsThisMonth: data.callsThisMonth || 0,
          lastCallTime: data.lastCallTime,
        };
      } else {
        console.warn("Failed to fetch stats from API route:", response.status);
        return this.getStatsFallback();
      }
    } catch (error) {
      console.error("Failed to get stats from API route:", error);
      return this.getStatsFallback();
    }
  }

  /**
   * Fallback to localStorage if BosBase is not available
   */
  private getStatsFallback(): ApiStats {
    if (typeof window === "undefined") {
      return {
        totalCalls: 0,
        callsToday: 0,
        callsThisMonth: 0,
      };
    }

    try {
      const data = localStorage.getItem(this.statsKey);
      if (!data) {
        this.initializeStats();
        return this.getStatsFallback();
      }
      return JSON.parse(data);
    } catch {
      return {
        totalCalls: 0,
        callsToday: 0,
        callsThisMonth: 0,
      };
    }
  }

  /**
   * Update statistics based on stored calls
   */
  private updateStats() {
    if (typeof window === "undefined") return;

    const calls = this.getApiCalls();
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const monthStart = new Date(now).setDate(1);
    monthStart && new Date(monthStart).setHours(0, 0, 0, 0);

    const stats: ApiStats = {
      totalCalls: calls.length,
      callsToday: calls.filter((call) => call.timestamp >= today).length,
      callsThisMonth: calls.filter((call) => call.timestamp >= (monthStart || 0)).length,
      lastCallTime: calls.length > 0 ? calls[calls.length - 1].timestamp : undefined,
    };

    localStorage.setItem(this.statsKey, JSON.stringify(stats));
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.statsKey);
    this.initializeStats();
  }

  /**
   * Get calls for a specific endpoint
   */
  getCallsForEndpoint(endpoint: string): ApiCallRecord[] {
    return this.getApiCalls().filter((call) => call.endpoint === endpoint);
  }

  /**
   * Get the BosBase instance for realtime subscriptions
   */
  getBosBaseInstance(): BosBase | null {
    return this.pb;
  }
}

// Singleton instance
let sdkInstance: BosbaseSDK | null = null;

/**
 * Get or create the Bosbase SDK instance
 */
export function getBosbaseSDK(bosbaseUrl?: string): BosbaseSDK {
  if (typeof window === "undefined") {
    // Return a new instance for server-side
    return new BosbaseSDK(bosbaseUrl);
  }

  if (!sdkInstance) {
    const url = bosbaseUrl || process.env.NEXT_PUBLIC_BOSBASE_URL;
    sdkInstance = new BosbaseSDK(url);
  }

  return sdkInstance;
}

export default BosbaseSDK;

