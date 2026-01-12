export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ChallengeResponse {
  message: string;
  isRegistered: boolean; // True if user already exists (skip email input)
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    polkadotAddress: string;
    contactEmail: string;
    apiKey?: string; // Only present for new users
    tier: 'FREE' | 'PRO' | 'ENTERPRISE';
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
    createdAt: string;
    isActive: boolean;
  };
  isNew: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface RegenerateKeyResponse {
  apiKey: string;
  message: string;
}
