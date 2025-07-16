// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { UserMiddlewareType } from '~/types';
import { JWT_SECRET } from '~/constant';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('Authorization header missing');
    return next(new HttpError(401, 'Unauthorized'));
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    logger.warn('Bad auth scheme or missing token', { authHeader });
    return next(new HttpError(401, 'Unauthorized'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserMiddlewareType;
    if (!payload?.id) {
      logger.warn('JWT payload missing user id', { payload });
      return next(new HttpError(401, 'Unauthorized'));
    }

    // attach the decoded user info for downstream handlers
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      logger.info('Access token expired', { error: err });
      return next(new HttpError(401, 'TOKEN_EXPIRED'));
    }

    logger.error('Access token verification failed', { error: err });
    return next(new HttpError(401, 'Unauthorized'));
  }
};
