// Mock the signature verification module
jest.mock('@polkadot/util-crypto', () => ({
  signatureVerify: jest.fn(),
}));

import { signatureVerify } from '@polkadot/util-crypto';
import {
  generateTokens,
  verifyRefreshToken,
  createSandboxUser,
  getApiKeyByAddress,
  checkUserExists,
  regenerateSandboxApiKey,
} from './sandboxService';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';
import {
  TEST_SANDBOX_ADDRESS,
  TEST_SANDBOX_ADDRESS_2,
} from '~/test/helper';

const mockedSignatureVerify = signatureVerify as jest.Mock;

describe('sandboxService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: signature verification passes
    mockedSignatureVerify.mockReturnValue({ isValid: true });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokens(TEST_SANDBOX_ADDRESS);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    it('should generate different tokens for different addresses', () => {
      const tokens1 = generateTokens(TEST_SANDBOX_ADDRESS);
      const tokens2 = generateTokens(TEST_SANDBOX_ADDRESS_2);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });

    it('should generate valid JWT tokens', () => {
      const { accessToken, refreshToken } = generateTokens(TEST_SANDBOX_ADDRESS);

      // JWTs have 3 parts separated by dots
      expect(accessToken.split('.')).toHaveLength(3);
      expect(refreshToken.split('.')).toHaveLength(3);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token and return address', () => {
      const { refreshToken } = generateTokens(TEST_SANDBOX_ADDRESS);

      const address = verifyRefreshToken(refreshToken);

      expect(address).toBe(TEST_SANDBOX_ADDRESS);
    });

    it('should throw error for access token (wrong type)', () => {
      const { accessToken } = generateTokens(TEST_SANDBOX_ADDRESS);

      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('Invalid or expired refresh token');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyRefreshToken('invalid.token.here');
      }).toThrow('Invalid or expired refresh token');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyRefreshToken('not-a-jwt');
      }).toThrow('Invalid or expired refresh token');
    });
  });

  describe('createSandboxUser', () => {
    it('should create new user with API key for valid signature', async () => {
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'valid-signature',
        message: 'test message',
      });

      expect(result.isNew).toBe(true);
      expect(result.apiKey).toMatch(/^dp_live_[a-f0-9]{48}$/);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.apiKeyDoc.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
      expect(result.apiKeyDoc.contactEmail).toBe('test@example.com');
      expect(result.apiKeyDoc.tier).toBe(ApiKeyTier.FREE);
      expect(result.apiKeyDoc.isActive).toBe(true);

      // Verify signature verification was called
      expect(mockedSignatureVerify).toHaveBeenCalledWith(
        'test message',
        'valid-signature',
        TEST_SANDBOX_ADDRESS
      );
    });

    it('should return existing user without exposing API key', async () => {
      // First create a user
      await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'first@example.com',
        signature: 'sig1',
        message: 'msg1',
      });

      // Try to create again with same address
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: '', // Empty email for returning user
        signature: 'sig2',
        message: 'msg2',
      });

      expect(result.isNew).toBe(false);
      expect(result.apiKey).toBe(''); // Should not expose API key
      expect(result.apiKeyDoc.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
    });

    it('should update email for existing user if provided', async () => {
      // First create a user
      await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'old@example.com',
        signature: 'sig1',
        message: 'msg1',
      });

      // Update with new email
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'new@example.com',
        signature: 'sig2',
        message: 'msg2',
      });

      expect(result.apiKeyDoc.contactEmail).toBe('new@example.com');
    });

    it('should reject invalid signature', async () => {
      mockedSignatureVerify.mockReturnValue({ isValid: false });

      await expect(
        createSandboxUser({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          contactEmail: 'test@example.com',
          signature: 'invalid-signature',
          message: 'test message',
        })
      ).rejects.toThrow('Invalid signature');
    });

    it('should require email for new users', async () => {
      await expect(
        createSandboxUser({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          contactEmail: '', // Empty email
          signature: 'sig',
          message: 'msg',
        })
      ).rejects.toThrow('Email is required for new user registration');
    });

    it('should store encrypted API key', async () => {
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig',
        message: 'msg',
      });

      // Check encrypted fields are stored in the returned document
      expect(result.apiKeyDoc.encryptedKey).toBeDefined();
      expect(result.apiKeyDoc.encryptionIV).toBeDefined();
      expect(result.apiKeyDoc.encryptionAuthTag).toBeDefined();
      expect(result.apiKeyDoc.encryptedKey).not.toBe('');
    });
  });

  describe('getApiKeyByAddress', () => {
    it('should return API key for existing user', async () => {
      // Create a user first
      await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig',
        message: 'msg',
      });

      const apiKey = await getApiKeyByAddress(TEST_SANDBOX_ADDRESS);

      expect(apiKey).toBeDefined();
      expect(apiKey?.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
    });

    it('should return null for non-existent user', async () => {
      const apiKey = await getApiKeyByAddress('non-existent-address');

      expect(apiKey).toBeNull();
    });

    it('should not return revoked API keys', async () => {
      // Create a user
      const { apiKeyDoc } = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig',
        message: 'msg',
      });

      // Revoke the key
      await ApiKey.findByIdAndUpdate((apiKeyDoc as any)._id, {
        isActive: false,
        revokedAt: new Date(),
      });

      const apiKey = await getApiKeyByAddress(TEST_SANDBOX_ADDRESS);

      expect(apiKey).toBeNull();
    });

    it('should not expose keyHash in result', async () => {
      await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig',
        message: 'msg',
      });

      const apiKey = await getApiKeyByAddress(TEST_SANDBOX_ADDRESS);

      expect(apiKey).toBeDefined();
      const plainObject = apiKey?.toObject();
      expect(plainObject).not.toHaveProperty('keyHash');
    });
  });

  describe('checkUserExists', () => {
    it('should return true for existing user', async () => {
      await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig',
        message: 'msg',
      });

      const exists = await checkUserExists(TEST_SANDBOX_ADDRESS);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      const exists = await checkUserExists('non-existent-address');

      expect(exists).toBe(false);
    });

    it('should return false for revoked user', async () => {
      const { apiKeyDoc } = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig',
        message: 'msg',
      });

      // Revoke the key
      await ApiKey.findByIdAndUpdate((apiKeyDoc as any)._id, {
        isActive: false,
        revokedAt: new Date(),
      });

      const exists = await checkUserExists(TEST_SANDBOX_ADDRESS);

      expect(exists).toBe(false);
    });
  });

  describe('regenerateSandboxApiKey', () => {
    it('should regenerate API key with valid signature', async () => {
      // Create initial user
      const initial = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig1',
        message: 'msg1',
      });

      const initialKeyHash = initial.apiKeyDoc.keyHash;

      // Regenerate key
      const result = await regenerateSandboxApiKey(
        TEST_SANDBOX_ADDRESS,
        'sig2',
        'regenerate message'
      );

      expect(result.apiKey).toMatch(/^dp_live_[a-f0-9]{48}$/);
      expect(result.apiKey).not.toBe(initial.apiKey);
      // keyPrefix is always "dp_live_" (first 8 chars), so check keyHash changed instead
      expect(result.apiKeyDoc.keyHash).not.toBe(initialKeyHash);
    });

    it('should reject invalid signature', async () => {
      // Create initial user
      await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig1',
        message: 'msg1',
      });

      mockedSignatureVerify.mockReturnValue({ isValid: false });

      await expect(
        regenerateSandboxApiKey(TEST_SANDBOX_ADDRESS, 'invalid-sig', 'msg')
      ).rejects.toThrow('Invalid signature');
    });

    it('should throw error if user not found', async () => {
      await expect(
        regenerateSandboxApiKey('non-existent-address', 'sig', 'msg')
      ).rejects.toThrow('No API key found for this address');
    });

    it('should update encrypted key fields', async () => {
      const initial = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'test@example.com',
        signature: 'sig1',
        message: 'msg1',
      });

      const initialEncrypted = initial.apiKeyDoc.encryptedKey;
      const initialIV = initial.apiKeyDoc.encryptionIV;

      await regenerateSandboxApiKey(TEST_SANDBOX_ADDRESS, 'sig2', 'msg2');

      const updatedKey = await ApiKey.findById((initial.apiKeyDoc as any)._id);
      expect(updatedKey?.encryptedKey).not.toBe(initialEncrypted);
      expect(updatedKey?.encryptionIV).not.toBe(initialIV);
    });
  });
});
