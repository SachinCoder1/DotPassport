// src/controllers/AuthController.ts

import { Request, Response, NextFunction } from 'express';
import { signatureVerify } from '@polkadot/util-crypto';
import jwt from 'jsonwebtoken';
import { User } from '~/models/User';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '~/constant';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { generateAccessToken, generateRefreshToken } from '~/utils/authTokens';

// POST /api/v1/auth/polkadot
export async function polkadotLogin(req: Request, res: Response, next: NextFunction) {
  const { address, message, signature } = req.body as {
    address: string;
    message: string;
    signature: string;
  };

  // 1. verify signature
  const { isValid } = signatureVerify(message, signature, address);
  if (!isValid) {
    logger.warn('Polkadot signature invalid', { address });
    return next(new HttpError(401, 'Invalid signature'));
  }

  try {
    // 2. upsert user by address
    const user = await User.findOneAndUpdate(
      { address },
      { address },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. issue tokens
    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return res.json({ accessToken, refreshToken });
  } catch (err: any) {
    logger.error('Error in polkadotLogin', { error: err });
    return next(new HttpError(500, 'Internal Server Error'));
  }
}

// POST /api/v1/auth/refresh
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('Refresh token missing');
    return next(new HttpError(401, 'Unauthorized'));
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Refresh' || !token) {
    logger.warn('Bad refresh scheme or missing token', { authHeader });
    return next(new HttpError(401, 'Unauthorized'));
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const newAccessToken = generateAccessToken(payload.id);
    return res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      logger.info('Refresh token expired', { error: err });
      return next(new HttpError(401, 'TOKEN_EXPIRED'));
    }
    logger.error('Error in refreshToken', { error: err });
    return next(new HttpError(500, 'Internal Server Error'));
  }
}

// POST /api/v1/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  // If you maintain a blacklist or store refresh tokens server‑side, revoke it here.
  // For stateless JWT, you can just respond OK and let the frontend drop tokens.
  logger.info('User logged out', { user: req.user?.id });
  return res.status(200).json({ message: 'Logged out' });
}
