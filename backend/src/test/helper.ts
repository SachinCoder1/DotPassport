import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JWT_SECRET } from '../constant';
import { TEST_POLKADOT_ADDRESS } from '~/config';
import { ApiKey, ApiKeyTier, TIER_RATE_LIMITS, IApiKey } from '~/developer/models/ApiKey';
import { generateApiKey, hashApiKey } from '~/developer/service/apiKeyService';
import { encryptApiKey } from '~/developer/utils/encryption';

// Define the shape of the options object for better type safety
type AuthTokenOptions = {
  returnId?: boolean;
};

// Define the shape of the return object when returnId is true
type AuthTokenResponse = {
  token: string;
  userId: mongoose.Types.ObjectId;
};

export const polkadotAddress = TEST_POLKADOT_ADDRESS;

// Test Polkadot addresses for sandbox testing
export const TEST_SANDBOX_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
export const TEST_SANDBOX_ADDRESS_2 = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

// JWT secret for sandbox tests (matches sandboxService.ts)
const SANDBOX_JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * A reusable test helper to simulate a logged-in user.
 * This function creates a new user with a Polkadot address in the database
 * and returns a signed JWT token for that user.
 * @param options - Optional: Set `returnId` to true to also get the created user's ID.
 * @returns A token string, or an object with the token and userId if `returnId` is true.
 */
export const getAuthToken = async (
  options: AuthTokenOptions = {}
): Promise<AuthTokenResponse> => {
  // 1. Define user details
  const userId = new mongoose.Types.ObjectId();

  // 2. Create and save the user to the in-memory test database
  const user = new User({
    _id: userId,
    addresses: [polkadotAddress],
  });
  await user.save();

  // 3. Create the JWT token payload
  const payload = { id: userId.toHexString() };

  // 4. Sign the token using your secret
  const token = jwt.sign(payload, JWT_SECRET);

  // 5. Return the required values
  return { token, userId };
};

// ============================================
// Sandbox Test Helpers
// ============================================

/**
 * Generate sandbox JWT tokens (access + refresh) for testing
 */
export function generateSandboxTokens(polkadotAddress: string): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(
    { polkadotAddress, type: 'access' },
    SANDBOX_JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { polkadotAddress, type: 'refresh' },
    SANDBOX_JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Generate an expired sandbox access token for testing expiry scenarios
 */
export function generateExpiredSandboxToken(polkadotAddress: string): string {
  return jwt.sign(
    { polkadotAddress, type: 'access' },
    SANDBOX_JWT_SECRET,
    { expiresIn: '-1s' } // Already expired
  );
}

/**
 * Generate a sandbox refresh token (not access token) for testing token type validation
 */
export function generateSandboxRefreshTokenOnly(polkadotAddress: string): string {
  return jwt.sign(
    { polkadotAddress, type: 'refresh' },
    SANDBOX_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Create a sandbox user with API key in the database for testing
 * Returns the API key document and the plaintext API key
 */
export async function createSandboxUser(options: {
  polkadotAddress?: string;
  contactEmail?: string;
  tier?: ApiKeyTier;
  isActive?: boolean;
} = {}): Promise<{
  apiKey: string;
  apiKeyDoc: IApiKey;
  accessToken: string;
  refreshToken: string;
}> {
  const {
    polkadotAddress: address = TEST_SANDBOX_ADDRESS,
    contactEmail = 'sandbox-test@example.com',
    tier = ApiKeyTier.FREE,
    isActive = true,
  } = options;

  // Generate API key
  const apiKey = generateApiKey('live');
  const keyHash = hashApiKey(apiKey);
  const keyPrefix = apiKey.substring(0, 8);
  const appName = `Sandbox Test - ${address.substring(0, 8)}...`;

  // Encrypt API key for storage
  const { encrypted, iv, authTag } = encryptApiKey(apiKey);

  const rateLimits = TIER_RATE_LIMITS[tier];

  const apiKeyDoc = await ApiKey.create({
    keyHash,
    keyPrefix,
    encryptedKey: encrypted,
    encryptionIV: iv,
    encryptionAuthTag: authTag,
    appName,
    contactEmail,
    tier,
    polkadotAddress: address,
    allowedOrigins: ['http://localhost:5173'],
    rateLimits,
    metadata: {
      source: 'sandbox',
      createdVia: 'test',
    },
    createdBy: address,
    isActive,
  });

  // Generate JWT tokens
  const { accessToken, refreshToken } = generateSandboxTokens(address);

  return {
    apiKey,
    apiKeyDoc,
    accessToken,
    refreshToken,
  };
}

/**
 * Create an ApiUser for JIT service testing
 */
export async function createApiUserWithData(options: {
  address?: string;
  totalScore?: number;
  badges?: Array<{
    badgeKey: string;
    achievedLevel: number;
    achievedLevelKey: string;
    achievedLevelTitle: string;
  }>;
} = {}) {
  const {
    address = TEST_SANDBOX_ADDRESS,
    totalScore = 100,
    badges = [],
  } = options;

  const { ApiUser } = await import('~/models/ApiUser');

  const now = new Date();
  const apiUser = await ApiUser.create({
    address,
    profile: {
      displayName: 'Test User',
      nftCount: 5,
    },
    score: {
      totalScore,
      categories: new Map([
        ['longevity', { score: 25, reason: 'OneYear', title: 'Account Longevity' }],
        ['txCount', { score: 25, reason: 'Moderate', title: 'Transaction Count' }],
      ]),
      calculatedAt: now,
    },
    badges,
    metadata: {
      firstRequestedAt: now,
      lastRequestedAt: now,
      requestCount: 1,
      source: 'api',
    },
    ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return apiUser;
}