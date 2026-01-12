import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request to include sandboxUser
declare global {
  namespace Express {
    interface Request {
      sandboxUser?: {
        polkadotAddress: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token for sandbox routes
 * Attaches user info to req.sandboxUser
 */
export const sandboxAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      polkadotAddress: string;
      type: string;
    };

    // Ensure it's an access token (not refresh)
    if (decoded.type !== 'access') {
      throw new HttpError(401, 'Invalid token type');
    }

    // Attach user to request
    req.sandboxUser = {
      polkadotAddress: decoded.polkadotAddress,
    };

    next();
  } catch (err: any) {
    logger.error('Error in sandboxAuth middleware', { error: err });

    if (err instanceof jwt.JsonWebTokenError) {
      return next(new HttpError(401, 'Invalid token'));
    }

    if (err instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, 'Token expired'));
    }

    if (err instanceof HttpError) {
      return next(err);
    }

    return next(new HttpError(401, 'Authentication failed'));
  }
};
