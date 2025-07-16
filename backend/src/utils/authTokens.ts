// src/utils/authTokens.ts

import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '~/constant';

/**
 * Generate a short-lived access token (JWT) for authentication
 * @param userId - the MongoDB _id of the user
 * @returns a signed JWT access token
 */
export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '1h' }  // access tokens valid for 1 hour
  );
}

/**
 * Generate a longer-lived refresh token (JWT) to obtain new access tokens
 * @param userId - the MongoDB _id of the user
 * @returns a signed JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }  // refresh tokens valid for 7 days
  );
}
