import api from "@/lib/api";

export interface ApiKey {
  _id: string;
  keyPrefix: string;
  appName: string;
  contactEmail: string;
  tier: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  allowedOrigins: string[];
  rateLimits: {
    requestsPerHour: number;
    requestsPerDay: number;
    requestsPerMonth: number;
  };
  usage: {
    totalRequests: number;
    lastRequestAt: Date | null;
    currentHourRequests: number;
    currentDayRequests: number;
    currentMonthRequests: number;
    currentHourWindowStart: Date;
    currentDayStart: Date;
    currentMonthStart: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
}

export interface CreateApiKeyPayload {
  appName: string;
  contactEmail: string;
  tier: 'free' | 'pro' | 'enterprise';
  allowedOrigins?: string[];
}

export interface UpdateApiKeyPayload {
  appName?: string;
  tier?: 'free' | 'pro' | 'enterprise';
  allowedOrigins?: string[];
}

export interface RevokeApiKeyPayload {
  reason: string;
}

export interface ApiKeyListResponse {
  success: boolean;
  data: {
    apiKeys: ApiKey[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ApiKeyResponse {
  success: boolean;
  message: string;
  apiKey: ApiKey & { key?: string }; // key only present on creation
}

export interface UsageStatsResponse {
  success: boolean;
  usage: ApiKey['usage'];
}

/**
 * Check if current user is admin by attempting to list API keys
 */
export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    await api.get('/admin/api-keys', { params: { limit: 1 } });
    return true;
  } catch (error: any) {
    if (error.response?.status === 403) {
      return false;
    }
    throw error;
  }
};

/**
 * Get all API keys with optional pagination
 */
export const getApiKeys = async (
  page = 1,
  limit = 100
): Promise<ApiKeyListResponse> => {
  const response = await api.get('/admin/api-keys', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Get a single API key by ID
 */
export const getApiKey = async (keyId: string): Promise<ApiKeyResponse> => {
  const response = await api.get(`/admin/api-keys/${keyId}`);
  return response.data;
};

/**
 * Create a new API key
 */
export const createApiKey = async (
  payload: CreateApiKeyPayload
): Promise<ApiKeyResponse> => {
  const response = await api.post('/admin/api-keys', payload);
  return response.data;
};

/**
 * Update an API key
 */
export const updateApiKey = async (
  keyId: string,
  payload: UpdateApiKeyPayload
): Promise<ApiKeyResponse> => {
  const response = await api.patch(`/admin/api-keys/${keyId}`, payload);
  return response.data;
};

/**
 * Revoke an API key
 */
export const revokeApiKey = async (
  keyId: string,
  payload: RevokeApiKeyPayload
): Promise<ApiKeyResponse> => {
  const response = await api.delete(`/admin/api-keys/${keyId}`, {
    data: payload
  });
  return response.data;
};

/**
 * Get usage statistics for an API key
 */
export const getApiKeyUsage = async (
  keyId: string
): Promise<UsageStatsResponse> => {
  const response = await api.get(`/admin/api-keys/${keyId}/usage`);
  return response.data;
};
