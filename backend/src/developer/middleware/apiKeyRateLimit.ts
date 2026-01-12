import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { trackApiKeyUsage, checkRateLimit } from '../service/rateLimitService';

/**
 * API Key Rate Limiting Middleware
 * Enforces tier-based rate limits per API key
 *
 * Widget handling:
 * - Metadata endpoints (/metadata/badges, /metadata/categories) are free
 * - Widget requests include ?widget=type query param for tracking
 * - Each API call from a widget counts toward the rate limit
 *
 * Future enhancements (TODO):
 * - Add widget session grouping to count widget loads as single request
 * - Implement reduced rate for widget requests (e.g., 0.25 per call)
 */
export const apiKeyRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.apiKey) {
      return next(new HttpError(401, 'API key not authenticated'));
    }

    const apiKeyId = req.apiKey.id;

    // Check rate limit
    const rateLimitResult = await checkRateLimit(apiKeyId);

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', {
        apiKeyId,
        appName: req.apiKey.appName,
        tier: req.apiKey.tier,
        path: req.path,
      });

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimitResult.limit.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', rateLimitResult.resetAt.toString());

      return next(
        new HttpError(
          429,
          `Rate limit exceeded. Limit: ${rateLimitResult.limit} requests per ${rateLimitResult.window}. Resets at ${new Date(rateLimitResult.resetAt).toISOString()}`
        )
      );
    }

    // Skip tracking for metadata endpoints - they're free and internal
    const METADATA_ENDPOINTS = ['/metadata/badges', '/metadata/categories'];
    if (METADATA_ENDPOINTS.includes(req.path)) {
      return next(); // Skip tracking
    }

    // Track usage (increment counters)
    await trackApiKeyUsage(apiKeyId);

    // Set rate limit headers (remaining decreased by 1 after tracking)
    res.setHeader('X-RateLimit-Limit', rateLimitResult.limit.toString());
    res.setHeader('X-RateLimit-Remaining', (rateLimitResult.remaining - 1).toString());
    res.setHeader('X-RateLimit-Reset', rateLimitResult.resetAt.toString());

    logger.info('Rate limit check passed', {
      apiKeyId,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
    });

    next();
  } catch (err: any) {
    logger.error('Error in rate limit middleware', { error: err });
    return next(new HttpError(500, 'Rate limit check failed'));
  }
};
