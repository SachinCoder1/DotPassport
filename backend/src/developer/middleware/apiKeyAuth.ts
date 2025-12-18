import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { ApiKey } from '../models/ApiKey';
import crypto from 'crypto';

/**
 * API Key Authentication Middleware
 * Validates API key from X-API-Key header
 */
export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract API key from header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      logger.warn('API key missing from request', {
        path: req.path,
        ip: req.ip,
      });
      return next(new HttpError(401, 'API key is required'));
    }

    // 2. Validate API key format (should start with dp_live_ or dp_test_)
    if (!apiKey.startsWith('dp_live_') && !apiKey.startsWith('dp_test_')) {
      logger.warn('Invalid API key format', {
        keyPrefix: apiKey.substring(0, 8),
        path: req.path,
      });
      return next(new HttpError(401, 'Invalid API key format'));
    }

    // 3. Hash the API key
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // 4. Find API key in database
    const apiKeyDoc = await ApiKey.findOne({
      keyHash,
      isActive: true,
      revokedAt: null,
    });

    if (!apiKeyDoc) {
      logger.warn('Invalid or revoked API key', {
        keyPrefix: apiKey.substring(0, 16),
        path: req.path,
        ip: req.ip,
      });
      return next(new HttpError(401, 'Invalid or revoked API key'));
    }

    // 5. Check CORS origin if configured
    const origin = req.headers.origin || req.headers.referer;
    if (apiKeyDoc.allowedOrigins.length > 0 && origin) {
      const isAllowedOrigin = apiKeyDoc.allowedOrigins.some((allowedOrigin) => {
        // Support wildcard subdomain matching
        if (allowedOrigin.startsWith('*.')) {
          const domain = allowedOrigin.substring(2);
          return origin.endsWith(domain);
        }
        return origin === allowedOrigin || origin.startsWith(allowedOrigin);
      });

      if (!isAllowedOrigin) {
        logger.warn('Request from disallowed origin', {
          origin,
          allowedOrigins: apiKeyDoc.allowedOrigins,
          appName: apiKeyDoc.appName,
        });
        return next(new HttpError(403, 'Origin not allowed'));
      }
    }

    // 6. Attach API key info to request
    req.apiKey = {
      id: apiKeyDoc.id,
      appName: apiKeyDoc.appName,
      tier: apiKeyDoc.tier,
      allowedOrigins: apiKeyDoc.allowedOrigins,
    };

    logger.info('API key authenticated', {
      appName: apiKeyDoc.appName,
      tier: apiKeyDoc.tier,
      path: req.path,
    });

    next();
  } catch (err: any) {
    logger.error('Error in API key authentication', { error: err });
    return next(new HttpError(500, 'Authentication failed'));
  }
};
