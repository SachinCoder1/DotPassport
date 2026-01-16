/**
 * SDK Configuration
 *
 * This file contains the default configuration values for the SDK.
 * The production API URL is used by default when the SDK is published.
 *
 * For local development:
 * - Option 1: Pass `baseUrl` when creating the client
 * - Option 2: Call `setDefaultBaseUrl()` before creating any clients
 * - Option 3: Set `DOTPASSPORT_API_URL` environment variable (Node.js only)
 */

/**
 * Default API base URL (production)
 */
const PRODUCTION_URL = 'https://api.dotpassport.io';

/**
 * Local development URL
 */
export const LOCAL_URL = 'http://localhost:4000';

/**
 * Current default base URL
 * Initialized from environment variable if available, otherwise uses production
 */
let defaultBaseUrl: string =
  (typeof process !== 'undefined' && process.env?.DOTPASSPORT_API_URL) ||
  PRODUCTION_URL;

/**
 * Get the current default base URL
 */
export function getDefaultBaseUrl(): string {
  return defaultBaseUrl;
}

/**
 * Set the default base URL for all new client instances
 *
 * @param url - The base URL to use (e.g., 'http://localhost:4000')
 *
 * @example
 * ```typescript
 * import { setDefaultBaseUrl, LOCAL_URL } from '@dotpassport/sdk';
 *
 * // For local development
 * setDefaultBaseUrl(LOCAL_URL);
 *
 * // Or use a custom URL
 * setDefaultBaseUrl('https://staging.dotpassport.io');
 * ```
 */
export function setDefaultBaseUrl(url: string): void {
  defaultBaseUrl = url;
}

/**
 * Reset the base URL to production default
 */
export function resetToProductionUrl(): void {
  defaultBaseUrl = PRODUCTION_URL;
}

/**
 * Check if currently using local/development URL
 */
export function isLocalMode(): boolean {
  return defaultBaseUrl.includes('localhost') || defaultBaseUrl.includes('127.0.0.1');
}

export { PRODUCTION_URL };
