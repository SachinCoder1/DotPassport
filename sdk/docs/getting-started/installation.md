# Installation

## Requirements

- **Node.js**: 16+ or modern browser
- **TypeScript**: 5.0+ (for TypeScript users)

## NPM Installation

Install the DotPassport SDK via npm:

```bash
npm install @dotpassport/sdk
```

## Yarn Installation

```bash
yarn add @dotpassport/sdk
```

## PNPM Installation

```bash
pnpm add @dotpassport/sdk
```

## CDN Installation

For browser usage without a build step:

```html
<script type="module">
  import { DotPassportClient, createWidget } from 'https://cdn.jsdelivr.net/npm/@dotpassport/sdk/+esm';

  // Use the SDK
  const client = new DotPassportClient({ apiKey: 'your-key' });
</script>
```

## Verify Installation

After installation, verify it works:

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'test_key'
});

console.log('SDK installed successfully!');
```

## Next Steps

- [Quick Start Guide](./quick-start.md) - Get started in 5 minutes
- [Authentication](./authentication.md) - Get your API key
- [API Client Overview](../api-client/overview.md) - Learn about the client
