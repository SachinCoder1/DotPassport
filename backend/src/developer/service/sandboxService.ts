import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { signatureVerify } from '@polkadot/util-crypto';
import { ApiKey, IApiKey, ApiKeyTier, TIER_RATE_LIMITS } from '../models/ApiKey';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { generateApiKey, hashApiKey } from './apiKeyService';
import { encryptApiKey } from '../utils/encryption';
import { ENV } from '~/config';
import { ENV_TYPE } from '~/types/enum';

// System origins that are always included but hidden from users
export const SYSTEM_ORIGINS = ['https://sandbox.dotpassport.io'];

// Use same JWT secret as main app
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generate JWT tokens for sandbox users
 */
export function generateTokens(polkadotAddress: string): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(
    { polkadotAddress, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { polkadotAddress, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): string {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      polkadotAddress: string;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded.polkadotAddress;
  } catch (err: any) {
    logger.error('Error verifying refresh token', { error: err });
    throw new HttpError(401, 'Invalid or expired refresh token');
  }
}

/**
 * Create sandbox user with Polkadot address
 * One API key per address - check if exists first
 */
export async function createSandboxUser(data: {
  polkadotAddress: string;
  contactEmail: string;
  signature: string;
  message: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  apiKeyDoc: IApiKey;
  isNew: boolean;
}> {
  const { polkadotAddress, contactEmail, signature, message } = data;

  try {
    // 1. Verify signature
    const { isValid } = signatureVerify(message, signature, polkadotAddress);
    if (!isValid) {
      throw new HttpError(401, 'Invalid signature');
    }

    // 2. Check if user already exists
    const existingKey = await ApiKey.findOne({
      polkadotAddress,
      isActive: true,
      revokedAt: null,
    });

    if (existingKey) {
      // Update email only if changed AND new email is not empty
      // (empty email is passed when skipping email input for registered users)
      if (contactEmail && existingKey.contactEmail !== contactEmail) {
        existingKey.contactEmail = contactEmail;
        await existingKey.save();
      }

      // Generate new JWT tokens (don't return actual API key for security)
      const { accessToken, refreshToken } = generateTokens(polkadotAddress);

      return {
        accessToken,
        refreshToken,
        apiKey: '', // Don't return actual key for existing users
        apiKeyDoc: existingKey,
        isNew: false,
      };
    }

    // 3. For new users, email is required
    if (!contactEmail) {
      throw new HttpError(400, 'Email is required for new user registration');
    }

    // 4. Create new API key
    const apiKey = generateApiKey('live');
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8);
    const appName = `Sandbox - ${polkadotAddress.substring(0, 8)}...`;

    // Encrypt the API key for storage (so it can be retrieved later)
    const { encrypted, iv, authTag } = encryptApiKey(apiKey);

    const rateLimits = TIER_RATE_LIMITS[ApiKeyTier.FREE];

    const apiKeyDoc = await ApiKey.create({
      keyHash,
      keyPrefix,
      encryptedKey: encrypted,
      encryptionIV: iv,
      encryptionAuthTag: authTag,
      appName,
      contactEmail,
      tier: ApiKeyTier.FREE,
      polkadotAddress,
      // In production, only include system origins. In dev, also add localhost for testing.
      allowedOrigins: ENV === ENV_TYPE.PRODUCTION
        ? [...SYSTEM_ORIGINS]
        : ['http://localhost:5173', ...SYSTEM_ORIGINS],
      rateLimits,
      metadata: {
        source: 'sandbox',
        createdVia: 'polkadot_wallet',
      },
      createdBy: polkadotAddress, // Use address as creator ID
      isActive: true,
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(polkadotAddress);

    logger.info('Sandbox user created', {
      polkadotAddress,
      appName,
      tier: ApiKeyTier.FREE,
    });

    return { accessToken, refreshToken, apiKey, apiKeyDoc, isNew: true };
  } catch (err: any) {
    if (err instanceof HttpError) {
      throw err;
    }
    logger.error('Error creating sandbox user', { error: err });
    throw new HttpError(500, 'Failed to create sandbox user');
  }
}

/**
 * Get API key by Polkadot address
 */
export async function getApiKeyByAddress(
  polkadotAddress: string
): Promise<IApiKey | null> {
  return ApiKey.findOne({
    polkadotAddress,
    isActive: true,
    revokedAt: null,
  }).select('-keyHash');
}

/**
 * Check if a user exists by Polkadot address
 * Used to determine if email input should be skipped during login
 */
export async function checkUserExists(polkadotAddress: string): Promise<boolean> {
  const existingKey = await ApiKey.findOne({
    polkadotAddress,
    isActive: true,
    revokedAt: null,
  });
  return !!existingKey;
}

/**
 * Regenerate API key for sandbox user
 */
export async function regenerateSandboxApiKey(
  polkadotAddress: string,
  signature: string,
  message: string
): Promise<{ apiKey: string; apiKeyDoc: IApiKey }> {
  try {
    // 1. Verify signature
    const { isValid } = signatureVerify(message, signature, polkadotAddress);
    if (!isValid) {
      throw new HttpError(401, 'Invalid signature');
    }

    // 2. Find existing key
    const existingKey = await ApiKey.findOne({
      polkadotAddress,
      isActive: true,
      revokedAt: null,
    });

    if (!existingKey) {
      throw new HttpError(404, 'No API key found for this address');
    }

    // 3. Generate new key
    const newApiKey = generateApiKey('live');
    const newKeyHash = hashApiKey(newApiKey);
    const newKeyPrefix = newApiKey.substring(0, 8);

    // Encrypt the new API key for storage
    const { encrypted, iv, authTag } = encryptApiKey(newApiKey);

    existingKey.keyHash = newKeyHash;
    existingKey.keyPrefix = newKeyPrefix;
    existingKey.encryptedKey = encrypted;
    existingKey.encryptionIV = iv;
    existingKey.encryptionAuthTag = authTag;
    await existingKey.save();

    logger.info('Sandbox API key regenerated', { polkadotAddress });

    return { apiKey: newApiKey, apiKeyDoc: existingKey };
  } catch (err: any) {
    if (err instanceof HttpError) {
      throw err;
    }
    logger.error('Error regenerating sandbox API key', { error: err });
    throw new HttpError(500, 'Failed to regenerate API key');
  }
}
