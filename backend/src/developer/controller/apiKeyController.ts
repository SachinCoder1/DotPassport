import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import {
  createApiKey,
  listApiKeys,
  getApiKeyById,
  updateApiKey,
  revokeApiKey,
  getUsageStats,
} from '../service/apiKeyService';
import { ApiKeyTier } from '../models/ApiKey';
import {
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  RevokeApiKeyRequest,
  ListApiKeysQuery,
} from '../types';

/**
 * Create a new API key (admin only)
 * POST /api/v1/admin/api-keys
 */
export async function createApiKeyHandler(
  req: Request<{}, {}, CreateApiKeyRequest>,
  res: Response,
  next: NextFunction
) {
  const adminId = req.user?.id;
  if (!adminId) {
    return next(new HttpError(401, 'Unauthorized'));
  }

  try {
    const { appName, contactEmail, tier, allowedOrigins, metadata } = req.body;

    const { apiKey, apiKeyDoc } = await createApiKey({
      appName,
      contactEmail,
      tier,
      allowedOrigins,
      metadata,
      createdBy: adminId,
    });

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      apiKey: {
        key: apiKey, // Only shown once
        keyPrefix: apiKeyDoc.keyPrefix,
        appName: apiKeyDoc.appName,
        contactEmail: apiKeyDoc.contactEmail,
        tier: apiKeyDoc.tier,
        isActive: apiKeyDoc.isActive,
        allowedOrigins: apiKeyDoc.allowedOrigins,
        rateLimits: apiKeyDoc.rateLimits,
        createdAt: apiKeyDoc.createdAt,
      },
    });
  } catch (err: any) {
    logger.error('Error in createApiKeyHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to create API key')
    );
  }
}

/**
 * List API keys with pagination (admin only)
 * GET /api/v1/admin/api-keys
 */
export async function listApiKeysHandler(
  req: Request<{}, {}, {}, ListApiKeysQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(String(req.query.page || '1')) || 1;
    const limit = parseInt(String(req.query.limit || '20')) || 20;
    const tier = (typeof req.query.tier === 'string' ? req.query.tier : undefined) as ApiKeyTier | undefined;
    const isActive =
      typeof req.query.isActive === 'string' && req.query.isActive === 'true'
        ? true
        : typeof req.query.isActive === 'string' && req.query.isActive === 'false'
        ? false
        : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const result = await listApiKeys({ page, limit, tier, isActive, search });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    logger.error('Error in listApiKeysHandler', { error: err });
    return next(new HttpError(500, 'Failed to list API keys'));
  }
}

/**
 * Get API key details (admin only)
 * GET /api/v1/admin/api-keys/:keyId
 */
export async function getApiKeyHandler(
  req: Request<{ keyId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const keyId = req.params.keyId;
    const apiKey = await getApiKeyById(keyId);

    res.status(200).json({
      success: true,
      data: apiKey,
    });
  } catch (err: any) {
    logger.error('Error in getApiKeyHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get API key')
    );
  }
}

/**
 * Update API key (admin only)
 * PATCH /api/v1/admin/api-keys/:keyId
 */
export async function updateApiKeyHandler(
  req: Request<{ keyId: string }, {}, UpdateApiKeyRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const keyId = req.params.keyId;
    const updates = req.body;

    const apiKey = await updateApiKey(keyId, updates);

    res.status(200).json({
      success: true,
      message: 'API key updated successfully',
      data: apiKey,
    });
  } catch (err: any) {
    logger.error('Error in updateApiKeyHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to update API key')
    );
  }
}

/**
 * Revoke API key (admin only)
 * DELETE /api/v1/admin/api-keys/:keyId
 */
export async function revokeApiKeyHandler(
  req: Request<{ keyId: string }, {}, RevokeApiKeyRequest>,
  res: Response,
  next: NextFunction
) {
  const adminId = req.user?.id;
  if (!adminId) {
    return next(new HttpError(401, 'Unauthorized'));
  }

  try {
    const keyId = req.params.keyId;
    const { reason } = req.body;

    const apiKey = await revokeApiKey(keyId, adminId, reason);

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
      data: {
        id: apiKey.id,
        revokedAt: apiKey.revokedAt,
        revokedBy: apiKey.revokedBy,
        revokedReason: apiKey.revokedReason,
      },
    });
  } catch (err: any) {
    logger.error('Error in revokeApiKeyHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to revoke API key')
    );
  }
}

/**
 * Get usage statistics for an API key (admin only)
 * GET /api/v1/admin/api-keys/:keyId/usage
 */
export async function getUsageStatsHandler(
  req: Request<{ keyId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const keyId = req.params.keyId;
    const stats = await getUsageStats(keyId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    logger.error('Error in getUsageStatsHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get usage stats')
    );
  }
}
