import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiResponse,
  UserProfile,
  UserScores,
  SpecificCategoryScore,
  UserBadges,
  SpecificUserBadge,
  BadgeDefinitions,
  CategoryDefinitions,
} from './types';
import { getDefaultBaseUrl } from './config';

export interface DotPassportConfig {
  apiKey: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
}

export class DotPassportError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'DotPassportError';
  }
}

// Cache entry with data and expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Global cache shared across all client instances (persists across page navigation)
const globalWidgetCache = new Map<string, CacheEntry<unknown>>();

// Default cache TTL: 5 minutes (300000ms)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Clear all global widget cache (for testing purposes)
 */
export function clearGlobalCache(): void {
  globalWidgetCache.clear();
}

export class DotPassportClient {
  private client: AxiosInstance;
  private cacheTTL: number;

  constructor(config: DotPassportConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.cacheTTL = DEFAULT_CACHE_TTL;

    this.client = axios.create({
      baseURL: config.baseUrl || getDefaultBaseUrl(),
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
        ...(config.customHeaders || {}),
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const message = (error.response.data as any)?.message || error.message;
          throw new DotPassportError(
            message,
            error.response.status,
            error.response.data
          );
        }
        throw new DotPassportError(error.message);
      }
    );
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached<T>(key: string): T | null {
    const entry = globalWidgetCache.get(key) as CacheEntry<T> | undefined;
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data;
    }
    // Remove expired entry
    if (entry) {
      globalWidgetCache.delete(key);
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(key: string, data: T): void {
    globalWidgetCache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheTTL,
    });
  }

  /**
   * Generate cache key for widget requests
   */
  private getCacheKey(type: string, address: string, params?: Record<string, string>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `widget:${type}:${address}:${paramStr}`;
  }

  /**
   * Clear all cached widget data
   */
  clearCache(): void {
    globalWidgetCache.clear();
  }

  /**
   * Clear cache for a specific address
   */
  clearCacheForAddress(address: string): void {
    for (const key of globalWidgetCache.keys()) {
      if (key.includes(`:${address}:`)) {
        globalWidgetCache.delete(key);
      }
    }
  }

  /**
   * Get user profile by address
   * @param address - Polkadot address
   * @param signal - Optional AbortSignal for request cancellation
   * @returns User profile data
   */
  async getProfile(address: string, signal?: AbortSignal): Promise<UserProfile> {
    const response = await this.client.get<ApiResponse<UserProfile>>(
      `/api/v2/profiles/${address}`,
      { signal }
    );
    return response.data.data;
  }

  /**
   * Get all scores for a user by address
   * @param address - Polkadot address
   * @param signal - Optional AbortSignal for request cancellation
   * @returns User scores data
   */
  async getScores(address: string, signal?: AbortSignal): Promise<UserScores> {
    const response = await this.client.get<ApiResponse<UserScores>>(
      `/api/v2/scores/${address}`,
      { signal }
    );
    return response.data.data;
  }

  /**
   * Get specific category score for a user
   * @param address - Polkadot address
   * @param categoryKey - Category key (e.g., 'longevity', 'txCount')
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Specific category score data
   */
  async getCategoryScore(
    address: string,
    categoryKey: string,
    signal?: AbortSignal
  ): Promise<SpecificCategoryScore> {
    const response = await this.client.get<ApiResponse<SpecificCategoryScore>>(
      `/api/v2/scores/${address}/${categoryKey}`,
      { signal }
    );
    return response.data.data;
  }

  /**
   * Get all badges for a user by address
   * @param address - Polkadot address
   * @param signal - Optional AbortSignal for request cancellation
   * @returns User badges data
   */
  async getBadges(address: string, signal?: AbortSignal): Promise<UserBadges> {
    const response = await this.client.get<ApiResponse<UserBadges>>(
      `/api/v2/badges/${address}`,
      { signal }
    );
    return response.data.data;
  }

  /**
   * Get specific badge for a user
   * @param address - Polkadot address
   * @param badgeKey - Badge key
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Specific user badge data
   */
  async getBadge(
    address: string,
    badgeKey: string,
    signal?: AbortSignal
  ): Promise<SpecificUserBadge> {
    const response = await this.client.get<ApiResponse<SpecificUserBadge>>(
      `/api/v2/badges/${address}/${badgeKey}`,
      { signal }
    );
    return response.data.data;
  }

  /**
   * Get all badge definitions (metadata)
   * @returns Badge definitions
   */
  async getBadgeDefinitions(): Promise<BadgeDefinitions> {
    const response = await this.client.get<ApiResponse<BadgeDefinitions>>(
      '/api/v2/metadata/badges'
    );
    return response.data.data;
  }

  /**
   * Get all category definitions (metadata)
   * @returns Category definitions
   */
  async getCategoryDefinitions(): Promise<CategoryDefinitions> {
    const response = await this.client.get<ApiResponse<CategoryDefinitions>>(
      '/api/v2/metadata/categories'
    );
    return response.data.data;
  }

  // ============================================
  // Widget API Methods (Consolidated endpoints)
  // These methods fetch all widget data in a single API call,
  // reducing rate limit usage and improving performance.
  // Widget responses are cached to avoid re-fetching on page navigation.
  // ============================================

  /**
   * Get reputation widget data (scores) in a single API call
   * @param address - Polkadot address
   * @param signal - Optional AbortSignal for request cancellation
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns User scores data
   */
  async getWidgetReputation(
    address: string,
    signal?: AbortSignal,
    forceRefresh = false
  ): Promise<UserScores> {
    const cacheKey = this.getCacheKey('reputation', address);

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCached<UserScores>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await this.client.get<ApiResponse<UserScores>>(
      `/api/v2/widget/reputation/${address}`,
      { signal }
    );

    // Cache the response
    this.setCache(cacheKey, response.data.data);
    return response.data.data;
  }

  /**
   * Get profile widget data in a single API call
   * @param address - Polkadot address
   * @param signal - Optional AbortSignal for request cancellation
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns User profile data
   */
  async getWidgetProfile(
    address: string,
    signal?: AbortSignal,
    forceRefresh = false
  ): Promise<UserProfile> {
    const cacheKey = this.getCacheKey('profile', address);

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCached<UserProfile>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await this.client.get<ApiResponse<UserProfile>>(
      `/api/v2/widget/profile/${address}`,
      { signal }
    );

    // Cache the response
    this.setCache(cacheKey, response.data.data);
    return response.data.data;
  }

  /**
   * Get badge widget data in a single API call
   * @param address - Polkadot address
   * @param badgeKey - Optional specific badge key
   * @param signal - Optional AbortSignal for request cancellation
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns User badges data or specific badge data
   */
  async getWidgetBadges(
    address: string,
    badgeKey?: string,
    signal?: AbortSignal,
    forceRefresh = false
  ): Promise<UserBadges | SpecificUserBadge> {
    const params = badgeKey ? { badgeKey } : {};
    const cacheKey = this.getCacheKey('badge', address, params as Record<string, string>);

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCached<UserBadges | SpecificUserBadge>(cacheKey);
      if (cached) {
        console.log('[DotPassportClient] Returning cached badge data');
        return cached;
      }
    }

    console.log('[DotPassportClient] Fetching badge data from API:', { address, badgeKey });

    const response = await this.client.get<ApiResponse<UserBadges | SpecificUserBadge>>(
      `/api/v2/widget/badge/${address}`,
      { params, signal }
    );

    console.log('[DotPassportClient] Badge API response:', response.data);

    // Cache the response
    this.setCache(cacheKey, response.data.data);
    return response.data.data;
  }

  /**
   * Get category widget data in a single API call
   * @param address - Polkadot address
   * @param categoryKey - Category key
   * @param signal - Optional AbortSignal for request cancellation
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns Specific category score data
   */
  async getWidgetCategory(
    address: string,
    categoryKey: string,
    signal?: AbortSignal,
    forceRefresh = false
  ): Promise<SpecificCategoryScore> {
    const cacheKey = this.getCacheKey('category', address, { categoryKey });

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCached<SpecificCategoryScore>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await this.client.get<ApiResponse<SpecificCategoryScore>>(
      `/api/v2/widget/category/${address}`,
      { params: { categoryKey }, signal }
    );

    // Cache the response
    this.setCache(cacheKey, response.data.data);
    return response.data.data;
  }
}
