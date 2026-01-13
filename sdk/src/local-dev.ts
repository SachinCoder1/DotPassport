/**
 * Local Development Setup
 *
 * Import this file at the top of your development/demo files to use localhost API.
 * This file should NOT be imported in production code.
 *
 * Usage:
 * ```typescript
 * // At the top of your demo/test file
 * import '@dotpassport/sdk/local-dev';
 *
 * // Or import and use directly
 * import { setDefaultBaseUrl, LOCAL_URL } from '@dotpassport/sdk';
 * setDefaultBaseUrl(LOCAL_URL);
 * ```
 */

import { setDefaultBaseUrl, LOCAL_URL } from './config';

// Automatically set to localhost when this file is imported
setDefaultBaseUrl(LOCAL_URL);

console.log('[DotPassport SDK] Local development mode enabled: ' + LOCAL_URL);
