# DotPassport SDK

<div align="center">

**Official JavaScript/TypeScript SDK for the DotPassport API**

[![npm version](https://img.shields.io/npm/v/@dotpassport/sdk.svg)](https://www.npmjs.com/package/@dotpassport/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Documentation](#documentation) • [API Reference](#api-client) • [Widgets](#embeddable-widgets) • [Examples](./examples)

</div>

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Client](#api-client)
- [Embeddable Widgets](#embeddable-widgets)
- [Documentation](#documentation)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @dotpassport/sdk
```

**Requirements:**
- Node.js 16+ or modern browser
- TypeScript 5.0+ (for TypeScript users)

## Quick Start

### Using the API Client

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

// Initialize the client with your API key
const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here',
  baseUrl: 'https://api.dotpassport.com' // Optional
});

// Get user scores
const scores = await client.getScores('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
console.log(scores.totalScore); // 850

// Get user badges
const badges = await client.getBadges('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
console.log(badges.count); // 5
```

### Using Embeddable Widgets

```html
<div id="reputation-widget"></div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  createWidget({
    apiKey: 'your-api-key',
    address: 'polkadot-address'
  }).mount('#reputation-widget');
</script>
```

## Features

### 🔌 API Client
- **Full API Coverage** - Access all DotPassport API endpoints
- **TypeScript-First** - Complete type safety with auto-completion
- **Automatic Error Handling** - Structured error responses
- **Rate Limit Aware** - Built-in rate limit tracking

### 🎨 Embeddable Widgets
- **Framework-Agnostic** - Works with React, Vue, Svelte, or vanilla JS
- **Customizable** - Theme support (light/dark/auto) and CSS variables
- **Lightweight** - ~7KB gzipped per widget
- **Zero Dependencies** - Self-contained with inline styles

### 🛡️ Developer Experience
- **Full TypeScript Support** - Written in TypeScript with complete type definitions
- **Tree-Shakeable** - Only import what you need
- **Well Documented** - Comprehensive guides and API reference
- **Modern Build** - ES2020 target with CommonJS modules

## API Client

The `DotPassportClient` provides programmatic access to all DotPassport API endpoints.

### Initialization

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here',
  baseUrl: 'https://api.dotpassport.com' // Optional, defaults to production
});
```

### Available Methods

#### Profile

```typescript
// Get user profile
const profile = await client.getProfile(address);
```

**Returns:** `Promise<UserProfile>`

#### Scores

```typescript
// Get all scores for a user
const scores = await client.getScores(address);

// Get specific category score
const categoryScore = await client.getCategoryScore(address, 'longevity');
```

**Returns:** `Promise<UserScores>` | `Promise<SpecificCategoryScore>`

#### Badges

```typescript
// Get all badges for a user
const badges = await client.getBadges(address);

// Get specific badge
const badge = await client.getBadge(address, 'relay_chain_initiate');
```

**Returns:** `Promise<UserBadges>` | `Promise<SpecificUserBadge>`

#### Metadata

```typescript
// Get badge definitions
const badgeDefs = await client.getBadgeDefinitions();

// Get category definitions
const categoryDefs = await client.getCategoryDefinitions();
```

**Returns:** `Promise<BadgeDefinitions>` | `Promise<CategoryDefinitions>`

> **📖 Full API Reference:** See [docs/api-reference.md](./docs/api-reference.md) for detailed documentation

## Embeddable Widgets

DotPassport SDK includes framework-agnostic widgets for displaying reputation data with zero configuration.

### Widget Types

#### 🏆 Reputation Widget (Default)
Displays total reputation score with category breakdown.

```typescript
import { createWidget } from '@dotpassport/sdk';

createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'reputation',
  showCategories: true,
  maxCategories: 6,
  theme: 'light'
}).mount('#reputation-widget');
```

#### 🎖️ Badge Widget
Shows badges earned by the user.

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'badges',
  maxBadges: 3,
  showProgress: true
}).mount('#badge-widget');
```

#### 👤 Profile Widget
User profile card with social links.

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'profile',
  showIdentities: true,
  showSocials: true
}).mount('#profile-widget');
```

#### 📊 Category Widget
Detailed breakdown of a specific category.

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'category',
  categoryKey: 'longevity',
  showBreakdown: true
}).mount('#category-widget');
```

### Framework Integration

<details>
<summary><strong>React</strong></summary>

```tsx
import { useEffect, useRef } from 'react';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

export function DotPassportWidget(config: WidgetConfig) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>();

  useEffect(() => {
    if (ref.current && !widgetRef.current) {
      widgetRef.current = createWidget(config);
      widgetRef.current.mount(ref.current);
    }
    return () => widgetRef.current?.destroy();
  }, []);

  useEffect(() => {
    widgetRef.current?.update(config);
  }, [config]);

  return <div ref={ref} />;
}

// Usage
<DotPassportWidget
  apiKey="your-key"
  address="polkadot-address"
  type="reputation"
/>
```

</details>

<details>
<summary><strong>Vue</strong></summary>

```vue
<template>
  <div ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

const props = defineProps<WidgetConfig>();
const container = ref<HTMLElement>();
let widget: any;

onMounted(() => {
  if (container.value) {
    widget = createWidget(props);
    widget.mount(container.value);
  }
});

onUnmounted(() => widget?.destroy());

watch(() => props, (newConfig) => {
  widget?.update(newConfig);
}, { deep: true });
</script>
```

</details>

<details>
<summary><strong>Svelte</strong></summary>

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

  export let config: WidgetConfig;

  let container: HTMLElement;
  let widget: any;

  onMount(() => {
    widget = createWidget(config);
    widget.mount(container);
  });

  onDestroy(() => widget?.destroy());

  $: if (widget) {
    widget.update(config);
  }
</script>

<div bind:this={container}></div>
```

</details>

### Customization

Widgets support CSS variable overrides for custom styling:

```css
:root {
  --dp-primary: #8b5cf6;
  --dp-secondary: #ec4899;
  --dp-bg: #ffffff;
  --dp-text-primary: #111827;
  --dp-border-radius: 0.75rem;
  /* See docs/widgets.md for all variables */
}
```

> **📖 Widget Documentation:** See [docs/widgets.md](./docs/widgets.md) for complete guide

## Documentation

### Guides
- **[Widget Guide](./docs/widgets.md)** - Complete widget documentation
- **[API Reference](./docs/api-reference.md)** - Detailed API documentation
- **[Integration Examples](./examples/)** - Sample implementations

### Quick Links
- [Getting Started](#quick-start)
- [API Client Methods](#api-client)
- [Widget Types](#widget-types)
- [Framework Integration](#framework-integration)
- [Error Handling](#error-handling)

## Examples

### Basic API Usage

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your-key' });

// Fetch user data
const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

const [profile, scores, badges] = await Promise.all([
  client.getProfile(address),
  client.getScores(address),
  client.getBadges(address)
]);

console.log(`${profile.displayName} has ${scores.totalScore} reputation points`);
console.log(`Earned ${badges.count} badges`);
```

### Widget with Custom Theme

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'reputation',
  theme: 'dark',
  showCategories: true,
  className: 'my-custom-widget',
  onLoad: () => console.log('Widget loaded'),
  onError: (error) => console.error('Widget error:', error)
}).mount('#widget');
```

### Dynamic Widget Updates

```typescript
const widget = createWidget({
  apiKey: 'your-key',
  address: 'address-1',
  type: 'reputation'
});

widget.mount('#widget');

// Later, update to show different user
widget.update({ address: 'address-2' });

// Refresh current data
widget.refresh();

// Clean up
widget.destroy();
```

> **See More:** Check [examples/](./examples/) for complete working examples

## Error Handling

The SDK throws `DotPassportError` for all API errors with structured error information:

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

try {
  const scores = await client.getScores('invalid-address');
} catch (error) {
  if (error instanceof DotPassportError) {
    console.error('Status Code:', error.statusCode);     // 404
    console.error('Error Message:', error.message);       // "User not found"
    console.error('Full Response:', error.response);      // Complete error response
  }
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| `401` | Invalid or missing API key |
| `404` | Resource not found (user, badge, category) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

## TypeScript Support

The SDK is written in TypeScript with complete type definitions included.

### Type Imports

```typescript
import type {
  // Client types
  DotPassportConfig,
  DotPassportError,

  // Data types
  UserProfile,
  UserScores,
  UserBadges,
  CategoryScore,

  // Widget types
  WidgetConfig,
  ReputationWidgetConfig,
  BadgeWidgetConfig,
  ProfileWidgetConfig,
  CategoryWidgetConfig,

  // Definition types
  BadgeDefinition,
  CategoryDefinition
} from '@dotpassport/sdk';
```

### Type Safety

All methods are fully typed with generics for complete type safety:

```typescript
const scores: UserScores = await client.getScores(address);
const badges: UserBadges = await client.getBadges(address);

// TypeScript will catch type errors
scores.totalScore;        // ✅ number
scores.invalidProperty;   // ❌ TypeScript error
```

## Rate Limits

Rate limits are enforced based on your API key tier. The SDK automatically includes rate limit information in every response.

### Rate Limit Tiers

| Tier | Hourly | Daily | Monthly |
|------|--------|-------|---------|
| **Free** | 100 | 1,000 | 10,000 |
| **Pro** | 1,000 | 10,000 | 100,000 |
| **Enterprise** | 10,000 | 100,000 | 1,000,000 |

### Monitoring Rate Limits

Rate limit headers are automatically included in responses:

```typescript
// Rate limit information available in error responses
try {
  await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError && error.statusCode === 429) {
    console.log('Rate limit exceeded');
    console.log('Limit:', error.response.limit);
    console.log('Reset at:', new Date(error.response.resetAt));
  }
}
```

**Response Headers:**
- `X-RateLimit-Limit` - Maximum requests allowed in current window
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Unix timestamp when limit resets

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dotpassport/sdk.git
cd sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test
```

### Project Structure

```
sdk/
├── src/
│   ├── client.ts           # API client
│   ├── types.ts            # Type definitions
│   ├── widgets/            # Widget implementation
│   │   ├── base/           # Base classes and utilities
│   │   ├── templates/      # HTML templates
│   │   └── *.ts            # Widget classes
│   └── index.ts            # Main entry point
├── examples/               # Usage examples
├── docs/                   # Documentation
└── dist/                   # Compiled output
```

## License

MIT © DotPassport Team

---

<div align="center">

**[Documentation](./docs/)** • **[Examples](./examples/)** • **[Issues](https://github.com/dotpassport/sdk/issues)** • **[NPM](https://www.npmjs.com/package/@dotpassport/sdk)**

Made with ❤️ by the DotPassport team

</div>
