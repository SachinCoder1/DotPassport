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

export interface DotPassportConfig {
  apiKey: string;
  baseUrl?: string;
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

export class DotPassportClient {
  private client: AxiosInstance;

  constructor(config: DotPassportConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.dotpassport.com',
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
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
   * Get user profile by address
   * @param address - Polkadot address
   * @returns User profile data
   */
  async getProfile(address: string): Promise<UserProfile> {
    const response = await this.client.get<ApiResponse<UserProfile>>(
      `/api/v2/profiles/${address}`
    );
    return response.data.data;
  }

  /**
   * Get all scores for a user by address
   * @param address - Polkadot address
   * @returns User scores data
   */
  async getScores(address: string): Promise<UserScores> {
    const response = await this.client.get<ApiResponse<UserScores>>(
      `/api/v2/scores/${address}`
    );
    return response.data.data;
  }

  /**
   * Get specific category score for a user
   * @param address - Polkadot address
   * @param categoryKey - Category key (e.g., 'longevity', 'txCount')
   * @returns Specific category score data
   */
  async getCategoryScore(
    address: string,
    categoryKey: string
  ): Promise<SpecificCategoryScore> {
    const response = await this.client.get<ApiResponse<SpecificCategoryScore>>(
      `/api/v2/scores/${address}/${categoryKey}`
    );
    return response.data.data;
  }

  /**
   * Get all badges for a user by address
   * @param address - Polkadot address
   * @returns User badges data
   */
  async getBadges(address: string): Promise<UserBadges> {
    const response = await this.client.get<ApiResponse<UserBadges>>(
      `/api/v2/badges/${address}`
    );
    return response.data.data;
  }

  /**
   * Get specific badge for a user
   * @param address - Polkadot address
   * @param badgeKey - Badge key
   * @returns Specific user badge data
   */
  async getBadge(
    address: string,
    badgeKey: string
  ): Promise<SpecificUserBadge> {
    const response = await this.client.get<ApiResponse<SpecificUserBadge>>(
      `/api/v2/badges/${address}/${badgeKey}`
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
}
