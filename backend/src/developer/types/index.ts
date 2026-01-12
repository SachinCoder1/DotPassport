import { ApiKeyTier, IRateLimitConfig } from '../models/ApiKey';

// Extended Express Request type for API key context
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        appName: string;
        tier: ApiKeyTier;
        allowedOrigins: string[];
      };
    }
  }
}

// Request types for admin API
export interface CreateApiKeyRequest {
  appName: string;
  contactEmail: string;
  tier: ApiKeyTier;
  allowedOrigins?: string[];
  metadata?: Record<string, any>;
  polkadotAddress?: string;
}

export interface UpdateApiKeyRequest {
  appName?: string;
  contactEmail?: string;
  tier?: ApiKeyTier;
  allowedOrigins?: string[];
  isActive?: boolean;
  metadata?: Record<string, any>;
  polkadotAddress?: string;
}

export interface RevokeApiKeyRequest {
  reason?: string;
}

export interface ListApiKeysQuery {
  page?: number;
  limit?: number;
  tier?: ApiKeyTier;
  isActive?: boolean;
  search?: string;
}

// Response types
export interface ApiKeyResponse {
  key?: string; // Only included when creating a new key
  keyPrefix: string;
  appName: string;
  contactEmail: string;
  tier: ApiKeyTier;
  isActive: boolean;
  allowedOrigins: string[];
  rateLimits: IRateLimitConfig;
  createdAt: Date;
  polkadotAddress?: string;
}

export interface ApiKeyDetailResponse {
  id: string;
  keyPrefix: string;
  appName: string;
  contactEmail: string;
  tier: ApiKeyTier;
  isActive: boolean;
  allowedOrigins: string[];
  rateLimits: IRateLimitConfig;
  usage: {
    totalRequests: number;
    lastRequestAt: Date | null;
    currentHourRequests: number;
    currentDayRequests: number;
    currentMonthRequests: number;
  };
  metadata?: Record<string, any>;
  lastUsedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  polkadotAddress?: string;
}

export interface UsageStatsResponse {
  keyId: string;
  appName: string;
  tier: ApiKeyTier;
  usage: {
    totalRequests: number;
    currentHourRequests: number;
    currentDayRequests: number;
    currentMonthRequests: number;
    lastRequestAt: Date | null;
  };
  rateLimits: IRateLimitConfig;
  utilizationPercentage: {
    hour: number;
    day: number;
    month: number;
  };
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Rate limit result type
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  window: 'hour' | 'day' | 'month';
}

// Developer API response types
export interface DeveloperProfileResponse {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  polkadotIdentities?: Array<{
    address: string;
    display?: string;
    web?: string;
    twitter?: string;
    github?: string;
    judgements?: Array<{ index: number; judgement: string }>;
  }>;
}

export interface DeveloperScoreResponse {
  address: string;
  totalScore: number;
  calculatedAt: Date;
  categories: Record<
    string,
    {
      score: number;
      reason: string;
      title: string;
    }
  >;
}

export interface DeveloperBadgeResponse {
  address: string;
  badges: Array<{
    badgeKey: string;
    achievedLevel: number;
    achievedLevelKey: string;
    achievedLevelTitle: string;
    earnedAt: Date;
  }>;
  count: number;
}
