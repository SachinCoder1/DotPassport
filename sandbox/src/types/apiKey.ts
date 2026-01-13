export interface ApiKeyInfo {
  id: string;
  keyPrefix: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  polkadotAddress: string;
  contactEmail: string;
  rateLimits: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  usage: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ApiKeyStats {
  totalRequests: number;
  requestsToday: number;
  avgResponseTime: number;
  rateLimitUsage: {
    hourly: {
      used: number;
      limit: number;
      percentage: number;
    };
    daily: {
      used: number;
      limit: number;
      percentage: number;
    };
    monthly: {
      used: number;
      limit: number;
      percentage: number;
    };
  };
  statusBreakdown: {
    success: number; // 2xx
    clientError: number; // 4xx
    serverError: number; // 5xx
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  percentage: number;
}
