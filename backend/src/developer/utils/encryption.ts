import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

if (!process.env.API_KEY_ENCRYPTION_KEY) {
  console.warn('WARNING: Using random encryption key. Set API_KEY_ENCRYPTION_KEY in production!');
}

/**
 * Encrypts an API key using AES-256-GCM
 * @param plaintext The plaintext API key to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
export function encryptApiKey(plaintext: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts an API key using AES-256-GCM
 * @param encrypted The encrypted API key
 * @param iv The initialization vector
 * @param authTag The authentication tag
 * @returns The decrypted plaintext API key
 */
export function decryptApiKey(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
