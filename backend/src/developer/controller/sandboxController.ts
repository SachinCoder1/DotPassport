import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import {
  createSandboxUser,
  getApiKeyByAddress,
  regenerateSandboxApiKey,
  generateTokens,
  verifyRefreshToken,
  checkUserExists,
} from '../service/sandboxService';
import {
  getRequestLogs,
  getRequestLogStats,
} from '../service/requestLogService';
import { getPlaintextApiKeyByAddress } from '../service/apiKeyService';
import { refreshRateLimitCounters } from '../service/rateLimitService';
import crypto from 'crypto';
import { TIER_RATE_LIMITS } from '../models/ApiKey';

// In-memory challenge store (could use Redis in production)
const challenges = new Map<
  string,
  { message: string; expiresAt: number }
>();

/**
 * Request a challenge for wallet signature
 * POST /api/v1/sandbox/challenge
 */
export async function requestChallengeHandler(
  req: Request<{}, {}, { polkadotAddress: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { polkadotAddress } = req.body;

    if (!polkadotAddress) {
      throw new HttpError(400, 'Polkadot address is required');
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const message = `Sign this message to authenticate with DotPassport Sandbox.\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
    const expiresAt = timestamp + 5 * 60 * 1000; // 5 minutes

    challenges.set(polkadotAddress, { message, expiresAt });

    // Clean up expired challenges periodically
    setTimeout(() => {
      const challenge = challenges.get(polkadotAddress);
      if (challenge && challenge.expiresAt < Date.now()) {
        challenges.delete(polkadotAddress);
      }
    }, 5 * 60 * 1000);

    // Check if user already exists (for skipping email input on frontend)
    const isRegistered = await checkUserExists(polkadotAddress);

    res.json({ message, isRegistered });
  } catch (err: any) {
    logger.error('Error in requestChallengeHandler', { error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, 'Failed to generate challenge')
    );
  }
}

/**
 * Signup/Login - Create or get API key
 * POST /api/v1/sandbox/auth
 */
export async function authenticateHandler(
  req: Request<
    {},
    {},
    {
      polkadotAddress: string;
      signature: string;
      message: string;
      contactEmail: string;
    }
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const { polkadotAddress, signature, message, contactEmail } = req.body;

    // Validate challenge
    const challenge = challenges.get(polkadotAddress);
    if (!challenge) {
      throw new HttpError(
        400,
        'No challenge found. Please request a challenge first.'
      );
    }

    if (challenge.expiresAt < Date.now()) {
      challenges.delete(polkadotAddress);
      throw new HttpError(400, 'Challenge expired');
    }

    if (challenge.message !== message) {
      throw new HttpError(400, 'Message mismatch');
    }

    // Create or get user
    const result = await createSandboxUser({
      polkadotAddress,
      contactEmail,
      signature,
      message,
    });

    // Clear challenge
    challenges.delete(polkadotAddress);

    // Get decrypted API key for display (for both new and existing users)
    let displayApiKey: string | null = null;
    if (result.isNew && result.apiKey) {
      // New users: use the freshly generated key
      displayApiKey = result.apiKey;
    } else {
      // Existing users: try to get decrypted key
      displayApiKey = await getPlaintextApiKeyByAddress(polkadotAddress);
    }

    // Transform rate limits and usage to frontend expected format
    const rateLimits = {
      hourly: result.apiKeyDoc.rateLimits.requestsPerHour,
      daily: result.apiKeyDoc.rateLimits.requestsPerDay,
      monthly: result.apiKeyDoc.rateLimits.requestsPerMonth,
    };

    // Refresh rate limit counters (reset expired windows) before returning
    // This ensures returning users see accurate usage after time has passed
    const refreshedUsage = await refreshRateLimitCounters(String(result.apiKeyDoc._id));
    const usage = refreshedUsage;

    // Build user object for response
    const userResponse: any = {
      polkadotAddress: result.apiKeyDoc.polkadotAddress,
      contactEmail: result.apiKeyDoc.contactEmail,
      tier: result.apiKeyDoc.tier.toUpperCase(), // Frontend expects uppercase
      keyPrefix: result.apiKeyDoc.keyPrefix,
      isActive: result.apiKeyDoc.isActive,
      rateLimits,
      usage,
      createdAt: result.apiKeyDoc.createdAt,
      apiKey: displayApiKey, // Include for both new and existing users (if available)
    };

    res.status(result.isNew ? 201 : 200).json({
      success: true,
      isNew: result.isNew,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: userResponse,
    });
  } catch (err: any) {
    logger.error('Error in authenticateHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Authentication failed')
    );
  }
}

/**
 * Refresh access token
 * POST /api/v1/sandbox/refresh
 */
export async function refreshTokenHandler(
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new HttpError(400, 'Refresh token is required');
    }

    // Verify refresh token and get address
    const polkadotAddress = verifyRefreshToken(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(polkadotAddress);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    logger.error('Error in refreshTokenHandler', { error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, 'Failed to refresh token')
    );
  }
}

/**
 * Logout user
 * POST /api/v1/sandbox/logout
 */
export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // But we can add token to blacklist if needed in future
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err: any) {
    logger.error('Error in logoutHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Logout failed')
    );
  }
}

/**
 * Get current user info by address
 * GET /api/v1/sandbox/me/:address
 */
export async function getMeHandler(
  req: Request<{ address: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { address } = req.params;

    const apiKey = await getApiKeyByAddress(address);

    if (!apiKey) {
      throw new HttpError(404, 'No API key found for this address');
    }

    // Retrieve plaintext API key for display
    const plaintextKey = await getPlaintextApiKeyByAddress(address);

    // Refresh rate limit counters (reset expired windows) before returning
    const refreshedUsage = await refreshRateLimitCounters(String(apiKey._id));

    // Transform rate limits and usage to frontend expected format
    const rateLimits = {
      hourly: apiKey.rateLimits.requestsPerHour,
      daily: apiKey.rateLimits.requestsPerDay,
      monthly: apiKey.rateLimits.requestsPerMonth,
    };

    // Use refreshed usage values (expired windows are reset)
    const usage = refreshedUsage;

    res.json({
      success: true,
      data: {
        polkadotAddress: apiKey.polkadotAddress,
        contactEmail: apiKey.contactEmail,
        tier: apiKey.tier.toUpperCase(), // Frontend expects uppercase
        keyPrefix: apiKey.keyPrefix,
        isActive: apiKey.isActive,
        rateLimits,
        usage,
        createdAt: apiKey.createdAt,
        apiKey: plaintextKey,
      },
    });
  } catch (err: any) {
    logger.error('Error in getMeHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get user info')
    );
  }
}

/**
 * Regenerate API key
 * POST /api/v1/sandbox/regenerate-key
 */
export async function regenerateKeyHandler(
  req: Request<
    {},
    {},
    { polkadotAddress: string; signature: string; message: string }
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const { polkadotAddress, signature, message } = req.body;

    const result = await regenerateSandboxApiKey(
      polkadotAddress,
      signature,
      message
    );

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      apiKey: result.apiKey,
      keyPrefix: result.apiKeyDoc.keyPrefix,
    });
  } catch (err: any) {
    logger.error('Error in regenerateKeyHandler', { error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, 'Failed to regenerate API key')
    );
  }
}

/**
 * Get request logs for authenticated user
 * GET /api/v1/sandbox/logs
 */
export async function getRequestLogsHandler(
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      page,
      limit,
      startDate,
      endDate,
      endpoint,
      method,
      statusCode,
    } = req.query;

    // SECURITY FIX: Use authenticated user's address from JWT, not query param
    if (!req.sandboxUser?.polkadotAddress) {
      throw new HttpError(401, 'Unauthorized');
    }

    const result = await getRequestLogs({
      polkadotAddress: req.sandboxUser.polkadotAddress,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      endpoint,
      method,
      statusCode: statusCode ? parseInt(statusCode) : undefined,
    });

    // Flatten pagination into top level for frontend compatibility
    res.json({
      success: true,
      data: {
        logs: result.logs,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    });
  } catch (err: any) {
    logger.error('Error in getRequestLogsHandler', { error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, 'Failed to get request logs')
    );
  }
}

/**
 * Get request log statistics for authenticated user
 * GET /api/v1/sandbox/stats
 */
export async function getStatsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // SECURITY FIX: Use authenticated user's address from JWT, not URL param
    if (!req.sandboxUser?.polkadotAddress) {
      throw new HttpError(401, 'Unauthorized');
    }

    const stats = await getRequestLogStats(req.sandboxUser.polkadotAddress);

    res.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    logger.error('Error in getStatsHandler', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get statistics')
    );
  }
}
