import { encryptApiKey, decryptApiKey } from './encryption';

describe('encryption utility', () => {
  const testApiKey = 'dp_live_1234567890abcdef1234567890abcdef1234567890abcdef';

  describe('encryptApiKey', () => {
    it('should encrypt API key and return encrypted data with IV and auth tag', () => {
      const result = encryptApiKey(testApiKey);

      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();

      // IV should be 16 bytes = 32 hex characters
      expect(result.iv).toHaveLength(32);

      // Auth tag should be 16 bytes = 32 hex characters
      expect(result.authTag).toHaveLength(32);

      // Encrypted data should be different from original
      expect(result.encrypted).not.toBe(testApiKey);
    });

    it('should produce different output for same input (due to random IV)', () => {
      const result1 = encryptApiKey(testApiKey);
      const result2 = encryptApiKey(testApiKey);

      // Encrypted values should be different because IV is random
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.authTag).not.toBe(result2.authTag);
    });

    it('should encrypt different API keys to different values', () => {
      const apiKey1 = 'dp_live_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const apiKey2 = 'dp_live_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

      const result1 = encryptApiKey(apiKey1);
      const result2 = encryptApiKey(apiKey2);

      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should handle empty string', () => {
      const result = encryptApiKey('');

      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);
      const result = encryptApiKey(longString);

      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt encrypted API key to original value', () => {
      const { encrypted, iv, authTag } = encryptApiKey(testApiKey);

      const decrypted = decryptApiKey(encrypted, iv, authTag);

      expect(decrypted).toBe(testApiKey);
    });

    it('should correctly round-trip multiple API keys', () => {
      const apiKeys = [
        'dp_live_key1key1key1key1key1key1key1key1key1key1key1key1',
        'dp_test_key2key2key2key2key2key2key2key2key2key2key2key2',
        'dp_live_abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
      ];

      for (const originalKey of apiKeys) {
        const { encrypted, iv, authTag } = encryptApiKey(originalKey);
        const decrypted = decryptApiKey(encrypted, iv, authTag);
        expect(decrypted).toBe(originalKey);
      }
    });

    it('should throw error with tampered encrypted data', () => {
      const { encrypted, iv, authTag } = encryptApiKey(testApiKey);

      // Tamper with encrypted data
      const tamperedEncrypted = encrypted.slice(0, -2) + 'ff';

      expect(() => {
        decryptApiKey(tamperedEncrypted, iv, authTag);
      }).toThrow();
    });

    it('should throw error with wrong IV', () => {
      const { encrypted, authTag } = encryptApiKey(testApiKey);

      // Use a different IV
      const wrongIv = '00'.repeat(16);

      expect(() => {
        decryptApiKey(encrypted, wrongIv, authTag);
      }).toThrow();
    });

    it('should throw error with wrong auth tag', () => {
      const { encrypted, iv } = encryptApiKey(testApiKey);

      // Use a different auth tag
      const wrongAuthTag = '00'.repeat(16);

      expect(() => {
        decryptApiKey(encrypted, iv, wrongAuthTag);
      }).toThrow();
    });

    it('should decrypt empty string correctly', () => {
      const { encrypted, iv, authTag } = encryptApiKey('');

      const decrypted = decryptApiKey(encrypted, iv, authTag);

      expect(decrypted).toBe('');
    });

    it('should decrypt long strings correctly', () => {
      const longString = 'a'.repeat(1000);
      const { encrypted, iv, authTag } = encryptApiKey(longString);

      const decrypted = decryptApiKey(encrypted, iv, authTag);

      expect(decrypted).toBe(longString);
    });

    it('should handle special characters in API key', () => {
      const specialKey = 'dp_live_!@#$%^&*()_+-=[]{}|;:,.<>?';
      const { encrypted, iv, authTag } = encryptApiKey(specialKey);

      const decrypted = decryptApiKey(encrypted, iv, authTag);

      expect(decrypted).toBe(specialKey);
    });

    it('should handle unicode characters', () => {
      const unicodeKey = 'dp_live_🔑🔐💾';
      const { encrypted, iv, authTag } = encryptApiKey(unicodeKey);

      const decrypted = decryptApiKey(encrypted, iv, authTag);

      expect(decrypted).toBe(unicodeKey);
    });
  });

  describe('Integration', () => {
    it('should maintain consistency across multiple encrypt/decrypt cycles', () => {
      let currentValue = testApiKey;

      // Encrypt and decrypt 5 times
      for (let i = 0; i < 5; i++) {
        const { encrypted, iv, authTag } = encryptApiKey(currentValue);
        currentValue = decryptApiKey(encrypted, iv, authTag);
      }

      expect(currentValue).toBe(testApiKey);
    });
  });
});
