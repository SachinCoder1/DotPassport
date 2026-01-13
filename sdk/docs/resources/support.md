# Support

Get help with DotPassport SDK integration.

## Documentation

Start with our comprehensive documentation:

- [Getting Started Guide](../getting-started/quick-start.md)
- [API Reference](../api-reference.md)
- [Widget Documentation](../widgets.md)
- [Framework Guides](../frameworks/react.md)
- [Examples](../examples/basic-usage.md)

---

## Common Issues

### Widget Not Displaying

**Problem:** Widget container shows nothing after mounting.

**Solutions:**
1. Check that the container element exists in the DOM
2. Verify API key is valid
3. Check browser console for errors
4. Ensure address format is correct

```typescript
// Correct usage
const container = document.getElementById('widget');
if (container) {
  createWidget({ ... }).mount(container);
}
```

### API Key Errors

**Problem:** Getting 401 Unauthorized errors.

**Solutions:**
1. Verify API key is correct
2. Check key hasn't expired
3. Ensure key has necessary permissions
4. Check environment variable is loaded

```typescript
// Debug API key loading
console.log('API Key loaded:', !!import.meta.env.VITE_DOTPASSPORT_API_KEY);
```

### Rate Limiting

**Problem:** Getting 429 Too Many Requests.

**Solutions:**
1. Implement caching
2. Add retry logic with exponential backoff
3. Reduce request frequency
4. Contact support for higher limits

```typescript
// Implement caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function getCachedScores(address) {
  const cached = cache.get(address);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  const data = await client.getScores(address);
  cache.set(address, { data, time: Date.now() });
  return data;
}
```

### TypeScript Errors

**Problem:** Type errors when using the SDK.

**Solutions:**
1. Ensure `@dotpassport/sdk` is installed
2. Check TypeScript version (4.5+ recommended)
3. Import types explicitly if needed

```typescript
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

const config: WidgetConfig = {
  apiKey: 'your_api_key',
  address: '5Grwva...',
  type: 'reputation'
};
```

---

## FAQs

### How do I get an API key?

1. Sign up at [dotpassport.xyz](https://dotpassport.xyz)
2. Navigate to Developer Settings
3. Create a new API key
4. Copy and store securely

### What addresses are supported?

DotPassport supports Polkadot ecosystem addresses:
- Polkadot addresses (starting with 1)
- Kusama addresses (starting with C, D, F, G, H, J)
- Substrate addresses (starting with 5)

### Can I use this with server-side rendering?

Yes, but widgets must be mounted client-side:

```tsx
// Next.js example
import dynamic from 'next/dynamic';

const DotPassportWidget = dynamic(
  () => import('./DotPassportWidget'),
  { ssr: false }
);
```

### How often is reputation data updated?

Reputation scores are updated:
- On-chain activity: Within minutes
- Governance actions: Within 1 hour
- Identity changes: Within 24 hours

### Is there a sandbox/test environment?

Yes, use the sandbox API:
- Endpoint: `https://sandbox-api.dotpassport.xyz`
- Use test API keys for development

---

## Contact Support

### GitHub Issues

For bugs and feature requests:
- [Report a Bug](https://github.com/dotpassport/sdk/issues/new?template=bug_report.md)
- [Request a Feature](https://github.com/dotpassport/sdk/issues/new?template=feature_request.md)

### Community Discord

Join our Discord for community support:
- [discord.gg/dotpassport](https://discord.gg/dotpassport)
- Channels: #sdk-help, #general, #showcase

### Email Support

For private inquiries:
- General: support@dotpassport.xyz
- Security: security@dotpassport.xyz
- Partnerships: partners@dotpassport.xyz

### Response Times

| Channel | Typical Response |
|---------|-----------------|
| Discord | < 24 hours |
| GitHub Issues | 1-3 business days |
| Email | 1-5 business days |

---

## Enterprise Support

For enterprise customers:
- Dedicated support channel
- Priority issue resolution
- Custom SLAs available
- Integration assistance

Contact: enterprise@dotpassport.xyz

---

## Status Page

Check service status:
- [status.dotpassport.xyz](https://status.dotpassport.xyz)

Subscribe to updates for:
- API outages
- Maintenance windows
- Performance issues

---

## Security Issues

Found a security vulnerability?

**Do not** create public GitHub issues.

Instead:
1. Email security@dotpassport.xyz
2. Include detailed reproduction steps
3. Allow reasonable time for fix
4. Coordinate disclosure

We follow responsible disclosure practices and acknowledge security researchers.

---

## Related

- [Contributing Guide](./contributing.md)
- [Changelog](./changelog.md)
- [Error Handling](../api-client/error-handling.md)
