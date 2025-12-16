import crypto from 'crypto';
import { ApiKey, IApiKey, ApiKeyTier, TIER_RATE_LIMITS } from '../models/ApiKey';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { ListApiKeysQuery } from '../types';

/**
 * Generate a secure API key
 * Format: dp_{env}_{random_hex}
 */
export function generateApiKey(env: 'live' | 'test' = 'live'): string {
  const randomBytes = crypto.randomBytes(24); // 48 hex characters
  const randomHex = randomBytes.toString('hex');
  return `dp_${env}_${randomHex}`;
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Create a new API key
 */
export async function createApiKey(data: {
  appName: string;
  contactEmail: string;
  tier: ApiKeyTier;
  allowedOrigins?: string[];
  metadata?: Record<string, any>;
  createdBy: string;
}): Promise<{ apiKey: string; apiKeyDoc: IApiKey }> {
  try {
    // Generate API key
    const apiKey = generateApiKey('live');
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8);

    // Get rate limits for tier
    const rateLimits = TIER_RATE_LIMITS[data.tier];

    // Create API key document
    const apiKeyDoc = await ApiKey.create({
      keyHash,
      keyPrefix,
      appName: data.appName,
      contactEmail: data.contactEmail,
      tier: data.tier,
      allowedOrigins: data.allowedOrigins || [],
      rateLimits,
      metadata: data.metadata || {},
      createdBy: data.createdBy,
      isActive: true,
    });

    logger.info('API key created', {
      appName: data.appName,
      tier: data.tier,
      createdBy: data.createdBy,
    });

    return { apiKey, apiKeyDoc };
  } catch (err: any) {
    logger.error('Error creating API key', { error: err });
    throw new HttpError(500, 'Failed to create API key');
  }
}

/**
 * List API keys with pagination and filtering
 */
export async function listApiKeys(options: ListApiKeysQuery) {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  if (options.tier) query.tier = options.tier;
  if (options.isActive !== undefined) query.isActive = options.isActive;
  if (options.search) {
    query.$or = [
      { appName: { $regex: options.search, $options: 'i' } },
      { contactEmail: { $regex: options.search, $options: 'i' } },
    ];
  }

  // Execute query
  const [apiKeys, total] = await Promise.all([
    ApiKey.find(query)
      .select('-keyHash') // Never return the hash
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ApiKey.countDocuments(query),
  ]);

  return {
    apiKeys,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get API key by ID
 */
export async function getApiKeyById(keyId: string): Promise<IApiKey> {
  const apiKey = await ApiKey.findById(keyId).select('-keyHash');
  if (!apiKey) {
    throw new HttpError(404, 'API key not found');
  }
  return apiKey;
}

/**
 * Update API key
 */
export async function updateApiKey(
  keyId: string,
  updates: Partial<{
    appName: string;
    contactEmail: string;
    tier: ApiKeyTier;
    allowedOrigins: string[];
    isActive: boolean;
    metadata: Record<string, any>;
  }>
): Promise<IApiKey> {
  const apiKey = await ApiKey.findById(keyId);
  if (!apiKey) {
    throw new HttpError(404, 'API key not found');
  }

  // Update fields
  if (updates.appName) apiKey.appName = updates.appName;
  if (updates.contactEmail) apiKey.contactEmail = updates.contactEmail;
  if (updates.tier) {
    apiKey.tier = updates.tier;
    apiKey.rateLimits = TIER_RATE_LIMITS[updates.tier];
  }
  if (updates.allowedOrigins) apiKey.allowedOrigins = updates.allowedOrigins;
  if (updates.isActive !== undefined) apiKey.isActive = updates.isActive;
  if (updates.metadata) {
    apiKey.metadata = new Map(Object.entries(updates.metadata));
  }

  await apiKey.save();

  logger.info('API key updated', {
    keyId,
    updates: Object.keys(updates),
  });

  return apiKey;
}

/**
 * Revoke API key
 */
export async function revokeApiKey(
  keyId: string,
  revokedBy: string,
  reason?: string
): Promise<IApiKey> {
  const apiKey = await ApiKey.findById(keyId);
  if (!apiKey) {
    throw new HttpError(404, 'API key not found');
  }

  if (apiKey.revokedAt) {
    throw new HttpError(400, 'API key already revoked');
  }

  apiKey.isActive = false;
  apiKey.revokedAt = new Date();
  apiKey.revokedBy = revokedBy;
  apiKey.revokedReason = reason || null;

  await apiKey.save();

  logger.info('API key revoked', {
    keyId,
    revokedBy,
    reason,
  });

  return apiKey;
}

/**
 * Get usage statistics for an API key
 */
export async function getUsageStats(keyId: string) {
  const apiKey = await ApiKey.findById(keyId);
  if (!apiKey) {
    throw new HttpError(404, 'API key not found');
  }

  const usage = apiKey.usage;
  const rateLimits = apiKey.rateLimits;

  return {
    keyId: apiKey.id,
    appName: apiKey.appName,
    tier: apiKey.tier,
    usage: {
      totalRequests: usage.totalRequests,
      currentHourRequests: usage.currentHourRequests,
      currentDayRequests: usage.currentDayRequests,
      currentMonthRequests: usage.currentMonthRequests,
      lastRequestAt: usage.lastRequestAt,
    },
    rateLimits,
    utilizationPercentage: {
      hour: (usage.currentHourRequests / rateLimits.requestsPerHour) * 100,
      day: (usage.currentDayRequests / rateLimits.requestsPerDay) * 100,
      month: (usage.currentMonthRequests / rateLimits.requestsPerMonth) * 100,
    },
  };
}
