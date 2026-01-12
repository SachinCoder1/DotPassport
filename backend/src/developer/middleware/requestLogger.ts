import { Request, Response, NextFunction } from 'express';
import { createRequestLog } from '../service/requestLogService';
import { logger } from '~/utils/logger';
import { ApiKey } from '../models/ApiKey';

/**
 * Middleware to log API requests for sandbox users
 * Runs AFTER apiKeyAuth and apiKeyRateLimit
 */
export const logApiRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip logging for metadata endpoints - they're free and internal
  // Note: req.path doesn't include the /api/v2 prefix since middleware is mounted there
  const METADATA_ENDPOINTS = [
    '/metadata/badges',
    '/metadata/categories'
  ];

  if (METADATA_ENDPOINTS.includes(req.path)) {
    return next();
  }

  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to capture response
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    const responseTime = Date.now() - startTime;

    // Only log for sandbox users (those with polkadotAddress)
    if (req.apiKey?.id) {
      ApiKey.findById(req.apiKey.id)
        .select('polkadotAddress')
        .then((apiKey) => {
          if (apiKey?.polkadotAddress) {
            // Check for widget type query parameter for custom logging
            const widgetType = req.query.widget as string | undefined;
            const endpoint = widgetType
              ? `/widget/${widgetType}`
              : req.path;

            // Log asynchronously (don't block response)
            createRequestLog({
              apiKeyId: req.apiKey!.id,
              polkadotAddress: apiKey.polkadotAddress,
              endpoint,
              method: req.method,
              isWidget: !!widgetType, // True if widget query param present
              statusCode: res.statusCode,
              responseTime,
              requestHeaders: sanitizeHeaders(req.headers),
              requestBody: sanitizeBody(req.body),
              responseBody: null, // Don't store response body for privacy
              errorMessage:
                res.statusCode >= 400 ? res.statusMessage : undefined,
              ipAddress: req.ip || 'unknown',
              userAgent: req.get('user-agent') || 'unknown',
            }).catch((err) => {
              logger.error('Failed to create request log', { error: err });
            });
          }
        })
        .catch((err) => {
          logger.error('Failed to check API key for logging', { error: err });
        });
    }

    // Call original end
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

function sanitizeHeaders(headers: any): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const allowedHeaders = ['content-type', 'user-agent', 'origin', 'referer'];

  for (const key of allowedHeaders) {
    if (headers[key]) {
      sanitized[key] = headers[key];
    }
  }

  return sanitized;
}

function sanitizeBody(body: any): any {
  // Limit body size and remove sensitive data
  if (!body) return null;
  if (typeof body !== 'object') return null;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'signature'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
