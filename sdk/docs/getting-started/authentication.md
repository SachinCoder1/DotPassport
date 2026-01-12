# Authentication

Learn how to authenticate with the DotPassport API using API keys.

## Overview

All API requests require authentication via an API key. The SDK handles authentication automatically once you provide your key during initialization.

## Getting an API Key

### Step 1: Create an Account

1. Visit [dotpassport.com/developers](https://dotpassport.com/developers)
2. Sign up for a developer account
3. Verify your email address

### Step 2: Generate API Key

1. Navigate to the **API Keys** section in your dashboard
2. Click **Generate New Key**
3. Choose your key type (Test or Live)
4. Copy your API key immediately (it won't be shown again)

{% hint style="danger" %}
**Important**: Store your API key securely. Never expose it in client-side code or commit it to version control.
{% endhint %}

## API Key Types

### Test Keys (`test_*`)

- For development and testing
- Access to sandbox data only
- No production data access
- Unlimited for development

### Live Keys (`live_*`)

- For production use
- Access to real user data
- Rate limits apply based on tier
- Requires verified account

## Using API Keys

### Environment Variables (Recommended)

Store your API key in environment variables:

```bash
# .env file
DOTPASSPORT_API_KEY=live_your_api_key_here
```

Then use it in your code:

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});
```

### Configuration Files

For Node.js applications, use a config file:

```typescript
// config.ts
export const config = {
  dotpassport: {
    apiKey: process.env.DOTPASSPORT_API_KEY!,
    baseUrl: process.env.DOTPASSPORT_API_URL
  }
};

// app.ts
import { DotPassportClient } from '@dotpassport/sdk';
import { config } from './config';

const client = new DotPassportClient(config.dotpassport);
```

### Framework-Specific Setup

#### Next.js

```typescript
// lib/dotpassport.ts
import { DotPassportClient } from '@dotpassport/sdk';

export const dotpassport = new DotPassportClient({
  apiKey: process.env.NEXT_PUBLIC_DOTPASSPORT_API_KEY!
});
```

#### Vite

```typescript
// src/lib/dotpassport.ts
import { DotPassportClient } from '@dotpassport/sdk';

export const dotpassport = new DotPassportClient({
  apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY
});
```

#### Create React App

```typescript
// src/lib/dotpassport.ts
import { DotPassportClient } from '@dotpassport/sdk';

export const dotpassport = new DotPassportClient({
  apiKey: process.env.REACT_APP_DOTPASSPORT_API_KEY!
});
```

## Security Best Practices

### DO ✅

- Store API keys in environment variables
- Use server-side API calls when possible
- Rotate keys regularly
- Use different keys for development and production
- Restrict API key permissions
- Monitor API key usage

### DON'T ❌

- Commit API keys to version control
- Expose keys in client-side JavaScript (for sensitive operations)
- Share keys between environments
- Use production keys in development
- Hardcode keys in source code
- Log API keys

## Key Permissions

Configure what your API keys can access:

| Permission | Description | Recommended For |
|------------|-------------|-----------------|
| **Read Only** | Fetch user data only | Public widgets, display-only apps |
| **Read/Write** | Fetch and update data | Admin dashboards, management tools |
| **Full Access** | All API operations | Server-side applications |

{% hint style="info" %}
Use the principle of least privilege: grant only the permissions your application needs.
{% endhint %}

## Rotating API Keys

Regularly rotate your API keys for security:

1. Generate a new API key
2. Update your environment variables
3. Deploy the changes
4. Verify the new key works
5. Revoke the old key

## Troubleshooting

### Invalid API Key (401)

**Problem**: Getting "Invalid API key" error

**Solutions**:
- Verify the key is correctly copied (no extra spaces)
- Check the key starts with `live_` or `test_`
- Ensure the key hasn't been revoked
- Verify environment variables are loaded

### Missing API Key

**Problem**: Getting "Missing API key" error

**Solutions**:
- Check environment variable is set
- Verify the variable name matches your code
- Restart your development server
- Check `.env` file is in the correct location

### Permission Denied (403)

**Problem**: API key doesn't have required permissions

**Solutions**:
- Check key permissions in dashboard
- Generate a new key with correct permissions
- Use a different key for this operation

## Next Steps

- [Quick Start Guide](./quick-start.md) - Start using the SDK
- [API Client Methods](../api-client/overview.md) - Explore available methods
- [Rate Limiting](../api-client/rate-limiting.md) - Understand rate limits
