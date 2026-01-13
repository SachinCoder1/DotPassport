# Security Best Practices

Keep your DotPassport integration secure.

## API Key Security

### Never Expose in Client Code

API keys should be treated as sensitive credentials:

```typescript
// ❌ Bad - hardcoded API key
const client = new DotPassportClient({
  apiKey: 'dp_live_abc123xyz'
});

// ✅ Good - environment variable
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY
});
```

### Environment Variables

#### React (Vite)

```bash
# .env
VITE_DOTPASSPORT_API_KEY=your_api_key
```

```typescript
// Usage
const apiKey = import.meta.env.VITE_DOTPASSPORT_API_KEY;
```

#### Next.js

```bash
# .env.local
NEXT_PUBLIC_DOTPASSPORT_API_KEY=your_api_key
```

```typescript
// Usage
const apiKey = process.env.NEXT_PUBLIC_DOTPASSPORT_API_KEY;
```

#### Node.js Backend

```bash
# .env
DOTPASSPORT_API_KEY=your_api_key
```

```typescript
// Usage (server-side only)
const apiKey = process.env.DOTPASSPORT_API_KEY;
```

---

## Rate Limiting Protection

Protect your API key from abuse:

```typescript
class RateLimitedClient {
  private requestCount = 0;
  private resetTime = Date.now();
  private maxRequests = 100;
  private windowMs = 60000; // 1 minute

  async makeRequest<T>(fn: () => Promise<T>): Promise<T> {
    // Reset counter if window passed
    if (Date.now() > this.resetTime + this.windowMs) {
      this.requestCount = 0;
      this.resetTime = Date.now();
    }

    // Check rate limit
    if (this.requestCount >= this.maxRequests) {
      throw new Error('Client-side rate limit exceeded');
    }

    this.requestCount++;
    return fn();
  }
}
```

---

## Input Validation

Always validate user input before making API calls:

```typescript
function isValidPolkadotAddress(address: string): boolean {
  // Basic validation
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check length (SS58 addresses are typically 47-48 characters)
  if (address.length < 45 || address.length > 50) {
    return false;
  }

  // Check format (starts with valid prefix)
  const validPrefixes = ['1', '5', 'D', 'E', 'F', 'G', 'H', 'J'];
  if (!validPrefixes.includes(address[0])) {
    return false;
  }

  // Check for valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

// Usage
function getScoresSafe(address: string) {
  if (!isValidPolkadotAddress(address)) {
    throw new Error('Invalid Polkadot address');
  }
  return client.getScores(address);
}
```

---

## CORS Configuration

If you're proxying API requests through your backend:

```typescript
// Express.js example
import cors from 'cors';

app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

---

## Content Security Policy

Add appropriate CSP headers:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://api.dotpassport.xyz;
  img-src 'self' data: https:;
">
```

---

## Secure Widget Embedding

### Iframe Sandboxing

If embedding widgets in iframes:

```html
<iframe
  src="https://yourapp.com/widget"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

### Subresource Integrity

When using CDN:

```html
<script
  src="https://unpkg.com/@dotpassport/sdk@1.0.0/dist/index.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

---

## Data Privacy

### Minimal Data Collection

Only request what you need:

```typescript
// ✅ Good - fetch only needed data
const scores = await client.getScores(address);

// ❌ Avoid - fetching everything when not needed
const [scores, badges, profile] = await Promise.all([
  client.getScores(address),
  client.getBadges(address),
  client.getProfile(address)
]);
```

### Cache Sensitive Data Carefully

```typescript
// Don't cache in localStorage if sensitive
const cache = new Map(); // In-memory only

// Clear cache on logout
function onLogout() {
  cache.clear();
  sessionStorage.clear();
}
```

---

## Error Message Handling

Don't expose internal errors to users:

```typescript
async function fetchScoresSafe(address: string) {
  try {
    return await client.getScores(address);
  } catch (error) {
    // Log full error internally
    console.error('API Error:', error);

    // Show generic message to user
    if (error instanceof DotPassportError) {
      if (error.statusCode === 401) {
        throw new Error('Authentication failed');
      }
      if (error.statusCode === 404) {
        throw new Error('Address not found');
      }
    }

    throw new Error('Unable to load reputation data');
  }
}
```

---

## Backend Proxy Pattern

For maximum security, proxy requests through your backend:

```typescript
// Frontend
async function getScores(address: string) {
  const response = await fetch(`/api/reputation/${address}`);
  return response.json();
}

// Backend (Node.js/Express)
app.get('/api/reputation/:address', async (req, res) => {
  const { address } = req.params;

  // Validate address
  if (!isValidPolkadotAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  // Make request with server-side API key
  const client = new DotPassportClient({
    apiKey: process.env.DOTPASSPORT_API_KEY // Not exposed to client
  });

  try {
    const scores = await client.getScores(address);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});
```

---

## Security Checklist

- [ ] API key stored in environment variable
- [ ] API key not committed to version control
- [ ] Input validation on all user-provided addresses
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Error messages don't leak sensitive info
- [ ] Cache cleared on logout
- [ ] HTTPS enforced
- [ ] Dependencies regularly updated

---

## Reporting Security Issues

If you discover a security vulnerability in the SDK:

1. **Do not** disclose publicly
2. Email security@dotpassport.xyz
3. Include detailed reproduction steps
4. Allow reasonable time for fix before disclosure

---

## Related

- [Error Handling](../api-client/error-handling.md)
- [Rate Limiting](../api-client/rate-limiting.md)
- [Quick Start](../getting-started/quick-start.md)
