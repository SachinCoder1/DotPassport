import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { ApiKey } from "../models/ApiKey";
import { CLIENT_URL, SANDBOX_URL } from "~/config";
import { logger } from "~/utils/logger";

/**
 * CORS middleware for /api/v2 routes that dynamically validates origins
 * based on each API key's allowedOrigins configuration.
 *
 * This middleware runs BEFORE apiKeyAuth to handle preflight OPTIONS requests.
 *
 * Flow:
 * 1. If no origin header, allow (server-to-server or same-origin)
 * 2. If origin is CLIENT_URL, always allow (admin panel/main app)
 * 3. For OPTIONS requests: Set CORS headers and return 204 (browsers don't send API key in preflight)
 * 4. For actual requests: Validate API key and check if origin is in allowedOrigins
 */
export const apiKeyCors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin;

  // If no origin header, allow (same-origin request or non-browser client like cURL)
  if (!origin) {
    return next();
  }

  // Always allow CLIENT_URL and SANDBOX_URL (for main app and developer sandbox)
  if (origin === CLIENT_URL || origin === SANDBOX_URL) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key"
    );

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    return next();
  }

  // For OPTIONS (preflight) requests: Set CORS headers and allow
  // NOTE: Browsers don't send custom headers like X-API-Key in preflight requests,
  // so we can't validate the API key here. Security is enforced on the actual request.
  if (req.method === "OPTIONS") {
    logger.debug("CORS preflight: Allowing OPTIONS request", { origin });

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key"
    );
    return res.status(204).end();
  }

  // For actual requests (GET, POST, etc.): Validate API key and origin
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    logger.warn("CORS validation failed: No API key provided", { origin });
    return res.status(403).json({
      success: false,
      error: "API key required",
    });
  }

  try {
    // Hash the API key and look it up
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const apiKeyDoc = await ApiKey.findOne({
      keyHash,
      isActive: true,
      revokedAt: null,
    }).select("allowedOrigins appName");

    if (!apiKeyDoc) {
      logger.warn("CORS validation failed: Invalid API key", {
        origin,
        keyPrefix: apiKey.substring(0, 16),
      });
      return res.status(403).json({
        success: false,
        error: "Invalid API key",
      });
    }

    // If allowedOrigins is empty, allow any origin (for testing)
    if (apiKeyDoc.allowedOrigins.length === 0) {
      logger.debug("CORS validation: Allowing any origin (empty allowedOrigins)", {
        origin,
        appName: apiKeyDoc.appName,
      });

      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      return next();
    }

    // Check if origin matches any allowed origin
    const isAllowedOrigin = apiKeyDoc.allowedOrigins.some((allowedOrigin) => {
      // Support wildcard subdomain matching (*.example.com)
      if (allowedOrigin.startsWith("*.")) {
        const domain = allowedOrigin.substring(2);
        return origin.endsWith(domain);
      }
      // Exact match or starts with (for protocol-agnostic matching)
      return origin === allowedOrigin || origin.startsWith(allowedOrigin);
    });

    if (!isAllowedOrigin) {
      logger.warn("CORS validation failed: Origin not allowed", {
        origin,
        allowedOrigins: apiKeyDoc.allowedOrigins,
        appName: apiKeyDoc.appName,
      });
      return res.status(403).json({
        success: false,
        error: "Origin not allowed",
        origin,
        allowedOrigins: apiKeyDoc.allowedOrigins,
      });
    }

    // Origin is allowed, set CORS headers
    logger.debug("CORS validation: Origin allowed", {
      origin,
      appName: apiKeyDoc.appName,
    });

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  } catch (error) {
    logger.error("CORS validation error", {
      error: error instanceof Error ? error.message : String(error),
      origin,
    });
    return res.status(500).json({
      success: false,
      error: "Internal server error during CORS validation",
    });
  }
};
