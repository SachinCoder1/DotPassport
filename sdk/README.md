<div align="center">

# DotPassport SDK

<img src="https://i.ibb.co/sdxrkW6F/dotpassport-logo.png" alt="DotPassport Logo" width="120" />

**The Official JavaScript/TypeScript SDK for DotPassport - Web3 Reputation & Identity**

[![npm version](https://img.shields.io/npm/v/@dotpassport/sdk.svg?style=flat-square&color=CB3837)](https://www.npmjs.com/package/@dotpassport/sdk)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dotpassport/sdk?style=flat-square&color=success)](https://bundlephobia.com/package/@dotpassport/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-236%20passed-success?style=flat-square)](./src/__tests__)
[![Coverage](https://img.shields.io/badge/Coverage-86%25-success?style=flat-square)](./)

[Getting Started](#quick-start) • [API Reference](#api-client) • [Widgets](#embeddable-widgets) • [Examples](#examples) • [Contributing](#contributing)

</div>

---

## What is DotPassport?

**DotPassport** is a comprehensive reputation and identity system for the Polkadot ecosystem. It aggregates on-chain activity across parachains to provide a unified reputation score, verifiable badges, and identity management for Web3 users.

This SDK provides:
- **API Client** - Programmatic access to all DotPassport APIs
- **Embeddable Widgets** - Ready-to-use UI components for displaying reputation data
- **Full TypeScript Support** - Complete type definitions for type-safe development

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Features](#features)
- [API Client](#api-client)
- [Embeddable Widgets](#embeddable-widgets)
- [Widget Gallery](#widget-gallery)
- [Configuration Reference](#configuration-reference)
- [Framework Integration](#framework-integration)
- [Wallet Integration](#wallet-integration)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
- [Testing](#testing)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Quick Start

### Install the SDK

```bash
npm install @dotpassport/sdk
```

### Use the API Client

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'your_api_key_here'
});

// Get user's reputation score
const scores = await client.getScores('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
console.log(`Total Score: ${scores.totalScore}`);
```

### Embed a Widget

```html
<div id="reputation-widget"></div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  createWidget({
    apiKey: 'your_api_key',
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    type: 'reputation'
  }).mount('#reputation-widget');
</script>
```

**That's it!** You now have a fully functional reputation widget on your page.

---

## Installation

### NPM / Yarn / PNPM

```bash
# npm
npm install @dotpassport/sdk

# yarn
yarn add @dotpassport/sdk

# pnpm
pnpm add @dotpassport/sdk
```

### CDN (Browser)

```html
<script type="module">
  import { DotPassportClient, createWidget } from 'https://unpkg.com/@dotpassport/sdk/dist/index.js';
</script>
```

### Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 16.0+ |
| TypeScript | 5.0+ (optional) |
| Browser | ES2020 compatible |

---

## Environment Configuration

By default, the SDK connects to the **production API** (`https://api.dotpassport.io`). For local development, you have several options:

### Option 1: Global Configuration (Recommended for Development)

```typescript
import { setDefaultBaseUrl, LOCAL_URL } from '@dotpassport/sdk';

// Set at app startup - affects all subsequent client instances
setDefaultBaseUrl(LOCAL_URL); // 'http://localhost:4000'

// Or use a custom URL
setDefaultBaseUrl('https://staging.dotpassport.io');
```

### Option 2: Per-Client Configuration

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

// Pass baseUrl when creating the client
const client = new DotPassportClient({
  apiKey: 'your_api_key',
  baseUrl: 'http://localhost:4000'  // Override default
});
```

### Option 3: Environment Variable (Node.js only)

```bash
# Set before running your app
export DOTPASSPORT_API_URL=http://localhost:4000
```

### Helper Functions

```typescript
import {
  setDefaultBaseUrl,
  getDefaultBaseUrl,
  resetToProductionUrl,
  isLocalMode,
  LOCAL_URL,        // 'http://localhost:4000'
  PRODUCTION_URL    // 'https://api.dotpassport.io'
} from '@dotpassport/sdk';

// Check current mode
console.log(isLocalMode()); // true if using localhost

// Reset to production
resetToProductionUrl();
```

---

## Features

### 🔌 Complete API Coverage
Access all DotPassport endpoints including profiles, scores, badges, and metadata.

```typescript
const profile = await client.getProfile(address);
const scores = await client.getScores(address);
const badges = await client.getBadges(address);
```

### 🎨 Beautiful Embeddable Widgets
Drop-in widgets with zero configuration. Supports light/dark themes and full customization.

### 🛡️ Type-Safe Development
Written in TypeScript with complete type definitions. Catch errors at compile time.

### 🌳 Tree-Shakeable
Import only what you need. Unused code is automatically eliminated.

### ⚡ Lightweight & Fast
- Core client: ~3KB gzipped
- Each widget: ~5KB gzipped
- Zero external dependencies (widgets)

### 🔄 Built-in Caching
Smart caching for widget data with configurable TTL to minimize API calls.

---

## API Client

The `DotPassportClient` provides programmatic access to all DotPassport API endpoints.

### Initialization

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here',    // Required
  baseUrl: 'https://api.dotpassport.xyz', // Optional (default)
  headers: {                            // Optional custom headers
    'X-Custom-Header': 'value'
  }
});
```

### Profile Methods

```typescript
// Get complete user profile
const profile = await client.getProfile(address);

// Response shape
{
  address: '5Grwva...',
  displayName: 'Alice',
  bio: 'Polkadot enthusiast',
  avatar: 'https://...',
  socials: {
    twitter: '@alice',
    github: 'alice-dev'
  },
  identities: [
    { chain: 'polkadot', verified: true }
  ]
}
```

### Score Methods

```typescript
// Get all scores for a user
const scores = await client.getScores(address);

// Response shape
{
  address: '5Grwva...',
  totalScore: 850,
  categories: [
    { key: 'longevity', title: 'Account Longevity', score: 100, maxScore: 100 },
    { key: 'governance', title: 'Governance', score: 75, maxScore: 100 },
    // ... more categories
  ]
}

// Get specific category score
const category = await client.getCategoryScore(address, 'governance');
```

### Badge Methods

```typescript
// Get all badges for a user
const badges = await client.getBadges(address);

// Response shape
{
  address: '5Grwva...',
  badges: [
    {
      badgeKey: 'early_adopter',
      achievedLevel: 3,
      achievedLevelKey: 'gold',
      achievedLevelTitle: 'Gold Early Adopter',
      earnedAt: '2024-01-15T10:30:00Z'
    }
  ],
  count: 5
}

// Get specific badge
const badge = await client.getBadge(address, 'early_adopter');
```

### Metadata Methods

```typescript
// Get all badge definitions
const badgeDefs = await client.getBadgeDefinitions();

// Get all category definitions
const categoryDefs = await client.getCategoryDefinitions();
```

### AbortSignal Support

All methods support `AbortSignal` for request cancellation:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

const scores = await client.getScores(address, { signal: controller.signal });
```

---

## Embeddable Widgets

DotPassport SDK includes four beautiful, customizable widgets that work with any framework.

### Widget Types

| Widget | Description | Use Case |
|--------|-------------|----------|
| **Reputation** | Total score with category breakdown | User dashboards, profiles |
| **Badge** | Earned badges display | Achievement showcases |
| **Profile** | User profile card | Social features, identity |
| **Category** | Single category deep-dive | Detailed score analysis |

---

## Widget Gallery

### Reputation Widget
*Displays total reputation score with category breakdown*

<div align="center">
  <img src="https://i.ibb.co/fVxDyQFJ/dotpassport-reputation-widget-light.png" alt="Reputation Widget Light" width="320" />
  <img src="https://i.ibb.co/chgG04Ws/dotpassport-reputation-widget-dark.png" alt="Reputation Widget Dark" width="320" />
</div>

<div align="center">
  <img src="https://i.ibb.co/nsYfjx3g/dotpassport-reputation-widget-6-category-light.png" alt="Reputation Widget with Categories" width="320" />
  <img src="https://i.ibb.co/bMZ6FBHH/dotpassport-reputation-widget-only-reputation-score-light.png" alt="Reputation Widget Score Only" width="320" />
</div>

```typescript
import { createWidget } from '@dotpassport/sdk';

createWidget({
  apiKey: 'your_api_key',
  address: 'polkadot_address',
  type: 'reputation',
  theme: 'light',           // 'light' | 'dark' | 'auto'
  showCategories: true,     // Show category breakdown
  maxCategories: 6,         // Limit visible categories
  compact: false,           // Compact mode
  onLoad: () => console.log('Loaded!'),
  onError: (err) => console.error(err)
}).mount('#reputation-widget');
```

---

### Badge Widget
*Shows badges earned by the user*

<div align="center">
  <img src="https://i.ibb.co/Wp7Q7408/dotpassport-badge-widget-light.png" alt="Badge Widget Light" width="320" />
  <img src="https://i.ibb.co/Pvwj1qQR/dotpassport-badge-widget-dark.png" alt="Badge Widget Dark" width="320" />
</div>

<div align="center">
  <img src="https://i.ibb.co/pjtrCbtR/dotpassport-badge-widget-light-with-date.png" alt="Badge Widget with Dates" width="400" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: 'polkadot_address',
  type: 'badge',
  theme: 'dark',
  maxBadges: 6,            // Maximum badges to show
  showProgress: true,       // Show earned date
  badgeKey: 'early_adopter' // Optional: show single badge
}).mount('#badge-widget');
```

---

### Profile Widget
*User profile card with social links and identities*

<div align="center">
  <img src="https://i.ibb.co/bMmjMXp2/dotpassport-profile-widget.png" alt="Profile Widget" width="400" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: 'polkadot_address',
  type: 'profile',
  theme: 'light',
  showAvatar: true,        // Display avatar
  showBio: true,           // Display bio
  showSocials: true,       // Display social links
  showIdentities: true     // Display chain identities
}).mount('#profile-widget');
```

---

### Category Widget
*Detailed breakdown of a specific reputation category*

<div align="center">
  <img src="https://i.ibb.co/B5s14M5X/dotpassport-category-widget-score-account-longitivity.png" alt="Category Widget Light" width="320" />
  <img src="https://i.ibb.co/MxdcNdzS/dotpassport-category-widget-score-account-longitivity-with-breakdown-dark.png" alt="Category Widget Dark" width="320" />
</div>

<div align="center">
  <img src="https://i.ibb.co/GQqdTywL/dotpassport-category-widget-score-account-longitivity-with-breakdown.png" alt="Category Widget with Breakdown" width="320" />
  <img src="https://i.ibb.co/m5CSjzSb/dotpassport-category-widget-only-score-account-longitivity.png" alt="Category Widget Score Only" width="320" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: 'polkadot_address',
  type: 'category',
  categoryKey: 'governance', // Required: category to display
  theme: 'light',
  showTitle: true,          // Show category title
  showDescription: true,    // Show category description
  showBreakdown: true,      // Show score breakdown
  showAdvice: true,         // Show improvement tips
  showScoreOnly: false      // Minimal score-only view
}).mount('#category-widget');
```

---

## Configuration Reference

### Common Widget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your DotPassport API key |
| `address` | `string` | *required* | Polkadot address to display |
| `type` | `string` | `'reputation'` | Widget type |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `compact` | `boolean` | `false` | Compact display mode |
| `className` | `string` | `''` | Custom CSS class |
| `onLoad` | `() => void` | - | Callback when loaded |
| `onError` | `(error: Error) => void` | - | Error callback |

### Reputation Widget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showCategories` | `boolean` | `true` | Show category breakdown |
| `maxCategories` | `number` | `6` | Max categories to display |

### Badge Widget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `badgeKey` | `string` | - | Show single specific badge |
| `maxBadges` | `number` | `10` | Max badges to display |
| `showProgress` | `boolean` | `true` | Show earned dates |

### Profile Widget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showAvatar` | `boolean` | `true` | Display user avatar |
| `showBio` | `boolean` | `true` | Display user bio |
| `showSocials` | `boolean` | `true` | Display social links |
| `showIdentities` | `boolean` | `true` | Display chain identities |

### Category Widget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `categoryKey` | `string` | *required* | Category key to display |
| `showTitle` | `boolean` | `true` | Show category title |
| `showDescription` | `boolean` | `true` | Show description |
| `showBreakdown` | `boolean` | `true` | Show score breakdown |
| `showAdvice` | `boolean` | `true` | Show improvement tips |
| `showScoreOnly` | `boolean` | `false` | Minimal view |

---

## Framework Integration

### React

```tsx
import { useEffect, useRef } from 'react';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

interface DotPassportWidgetProps extends WidgetConfig {
  className?: string;
}

export function DotPassportWidget({ className, ...config }: DotPassportWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Create and mount widget
    widgetRef.current = createWidget(config);
    widgetRef.current.mount(containerRef.current);

    // Cleanup on unmount
    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  // Handle config updates
  useEffect(() => {
    widgetRef.current?.update(config);
  }, [config.address, config.theme]);

  return <div ref={containerRef} className={className} />;
}

// Usage
function App() {
  return (
    <DotPassportWidget
      apiKey="your_api_key"
      address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      type="reputation"
      theme="dark"
      showCategories={true}
    />
  );
}
```

### Vue 3

```vue
<template>
  <div ref="container" :class="className"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

interface Props extends WidgetConfig {
  className?: string;
}

const props = defineProps<Props>();
const container = ref<HTMLElement>();
let widget: ReturnType<typeof createWidget>;

onMounted(() => {
  if (container.value) {
    widget = createWidget(props);
    widget.mount(container.value);
  }
});

onUnmounted(() => {
  widget?.destroy();
});

watch(
  () => [props.address, props.theme],
  () => {
    widget?.update(props);
  }
);
</script>
```

### Svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

  export let apiKey: string;
  export let address: string;
  export let type: WidgetConfig['type'] = 'reputation';
  export let theme: WidgetConfig['theme'] = 'light';

  let container: HTMLElement;
  let widget: ReturnType<typeof createWidget>;

  onMount(() => {
    widget = createWidget({ apiKey, address, type, theme });
    widget.mount(container);
  });

  onDestroy(() => {
    widget?.destroy();
  });

  $: if (widget) {
    widget.update({ address, theme });
  }
</script>

<div bind:this={container}></div>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>DotPassport Widget Demo</title>
</head>
<body>
  <div id="reputation-widget"></div>
  <button id="toggle-theme">Toggle Theme</button>

  <script type="module">
    import { createWidget } from '@dotpassport/sdk';

    let currentTheme = 'light';

    const widget = createWidget({
      apiKey: 'your_api_key',
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      type: 'reputation',
      theme: currentTheme,
      onLoad: () => console.log('Widget loaded successfully!'),
      onError: (error) => console.error('Widget error:', error)
    });

    widget.mount('#reputation-widget');

    // Theme toggle
    document.getElementById('toggle-theme').addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      widget.update({ theme: currentTheme });
    });
  </script>
</body>
</html>
```

---

## Wallet Integration

Connect DotPassport SDK with popular Polkadot wallets to display reputation data for connected users.

### Talisman Wallet

```typescript
import { getWallets } from '@talismn/connect-wallets';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

// 1. Connect to Talisman
const wallets = getWallets();
const talisman = wallets.find(w => w.extensionName === 'talisman');
await talisman.enable('My App');
const accounts = await talisman.getAccounts();
const address = accounts[0].address;

// 2. Use with DotPassport API
const client = new DotPassportClient({ apiKey: 'your_key' });
const scores = await client.getScores(address);
console.log(`Reputation: ${scores.totalScore}`);

// 3. Or use with Widgets
const widget = createWidget({
  apiKey: 'your_key',
  address: address,
  type: 'reputation'
});
widget.mount('#widget');

// 4. Update widget when account changes
talisman.subscribeAccounts((accounts) => {
  widget.update({ address: accounts[0].address });
});
```

### SubWallet

```typescript
import { getWalletBySource, isWalletInstalled } from '@subwallet/wallet-connect';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

// 1. Check and connect to SubWallet
const installed = await isWalletInstalled('subwallet-js');
if (!installed) {
  window.open('https://subwallet.app', '_blank');
}

const wallet = await getWalletBySource('subwallet-js');
await wallet.enable();
const accounts = await wallet.getAccounts();
const address = accounts[0].address;

// 2. Use with DotPassport API
const client = new DotPassportClient({ apiKey: 'your_key' });
const scores = await client.getScores(address);

// 3. Or use with Widgets
const widget = createWidget({
  apiKey: 'your_key',
  address: address,
  type: 'reputation',
  theme: 'dark'
});
widget.mount('#widget');

// 4. Subscribe to account changes
await wallet.subscribeAccounts((accounts) => {
  if (accounts.length > 0) {
    widget.update({ address: accounts[0].address });
  }
});
```

### React Hook Example

```tsx
import { useState, useEffect, useRef } from 'react';
import { getWallets } from '@talismn/connect-wallets';
import { createWidget } from '@dotpassport/sdk';

function useDotPassportWallet(apiKey: string) {
  const [address, setAddress] = useState<string | null>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const connect = async () => {
    const wallets = getWallets();
    const talisman = wallets.find(w => w.extensionName === 'talisman');
    await talisman?.enable('My App');
    const accounts = await talisman?.getAccounts();
    if (accounts?.[0]) {
      setAddress(accounts[0].address);
    }
  };

  useEffect(() => {
    if (!address || !containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey,
      address,
      type: 'reputation'
    });
    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address, apiKey]);

  return { connect, address, containerRef };
}

// Usage
function App() {
  const { connect, address, containerRef } = useDotPassportWallet('your_key');

  return (
    <div>
      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div ref={containerRef} />
      )}
    </div>
  );
}
```

> **📖 Detailed Wallet Guides:**
> - [Wallet Integration Overview](./docs/wallets/overview.md)
> - [Talisman Integration](./docs/wallets/talisman.md) - Complete guide with React & Vanilla JS examples
> - [SubWallet Integration](./docs/wallets/subwallet.md) - Complete guide with error handling

---

## Custom Styling

Widgets support CSS variable overrides for custom styling:

```css
/* Override widget theme colors */
.my-custom-widget {
  --dp-primary: #8b5cf6;
  --dp-secondary: #ec4899;
  --dp-bg: #ffffff;
  --dp-bg-secondary: #f9fafb;
  --dp-text-primary: #111827;
  --dp-text-secondary: #6b7280;
  --dp-border: #e5e7eb;
  --dp-border-radius: 12px;
  --dp-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Dark theme overrides */
.my-custom-widget.dp-theme-dark {
  --dp-bg: #1f2937;
  --dp-bg-secondary: #374151;
  --dp-text-primary: #f9fafb;
  --dp-text-secondary: #9ca3af;
  --dp-border: #4b5563;
}
```

---

## Error Handling

The SDK provides structured error handling through `DotPassportError`:

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_key' });

try {
  const scores = await client.getScores('invalid-address');
} catch (error) {
  if (error instanceof DotPassportError) {
    console.error('Status:', error.statusCode);    // 404
    console.error('Message:', error.message);       // "User not found"
    console.error('Response:', error.response);     // Full error response

    // Handle specific errors
    switch (error.statusCode) {
      case 401:
        console.error('Invalid API key');
        break;
      case 404:
        console.error('User not found');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      default:
        console.error('Unknown error');
    }
  }
}
```

### Error Codes Reference

| Code | Name | Description |
|------|------|-------------|
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Invalid or missing API key |
| `403` | Forbidden | Access denied to resource |
| `404` | Not Found | User, badge, or category not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Internal server error |

---

## TypeScript Support

The SDK is written in TypeScript with complete type definitions.

### Importing Types

```typescript
import type {
  // Client configuration
  DotPassportConfig,

  // API response types
  UserProfile,
  UserScores,
  UserBadges,
  CategoryScore,
  BadgeDefinition,
  CategoryDefinition,

  // Widget configuration
  WidgetConfig,
  ReputationWidgetConfig,
  BadgeWidgetConfig,
  ProfileWidgetConfig,
  CategoryWidgetConfig,

  // Error type
  DotPassportError
} from '@dotpassport/sdk';
```

### Type-Safe Usage

```typescript
import { DotPassportClient, type UserScores, type UserBadges } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_key' });

// Fully typed responses
const scores: UserScores = await client.getScores(address);
scores.totalScore;      // ✅ number
scores.categories;      // ✅ CategoryScore[]
scores.invalid;         // ❌ TypeScript error

const badges: UserBadges = await client.getBadges(address);
badges.count;           // ✅ number
badges.badges[0].badgeKey; // ✅ string
```

---

## Examples

### Complete Dashboard Example

```typescript
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

const API_KEY = 'your_api_key';
const ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// Initialize client for API calls
const client = new DotPassportClient({ apiKey: API_KEY });

// Fetch and display data programmatically
async function loadDashboard() {
  const [profile, scores, badges] = await Promise.all([
    client.getProfile(ADDRESS),
    client.getScores(ADDRESS),
    client.getBadges(ADDRESS)
  ]);

  console.log(`Welcome, ${profile.displayName}!`);
  console.log(`Your reputation score: ${scores.totalScore}`);
  console.log(`Badges earned: ${badges.count}`);
}

// Create widgets for visual display
const reputationWidget = createWidget({
  apiKey: API_KEY,
  address: ADDRESS,
  type: 'reputation',
  theme: 'auto',
  showCategories: true
});

const badgeWidget = createWidget({
  apiKey: API_KEY,
  address: ADDRESS,
  type: 'badge',
  maxBadges: 4
});

const profileWidget = createWidget({
  apiKey: API_KEY,
  address: ADDRESS,
  type: 'profile'
});

// Mount widgets
reputationWidget.mount('#reputation-section');
badgeWidget.mount('#badges-section');
profileWidget.mount('#profile-section');

// Handle address changes
function updateAddress(newAddress: string) {
  reputationWidget.update({ address: newAddress });
  badgeWidget.update({ address: newAddress });
  profileWidget.update({ address: newAddress });
}
```

### Widget with Event Handling

```typescript
const widget = createWidget({
  apiKey: 'your_key',
  address: 'polkadot_address',
  type: 'reputation',
  onLoad: () => {
    console.log('Widget loaded successfully');
    document.getElementById('loading')?.remove();
  },
  onError: (error) => {
    console.error('Widget failed to load:', error);
    document.getElementById('widget-container')!.innerHTML = `
      <div class="error">Failed to load reputation data</div>
    `;
  }
});

widget.mount('#widget-container');

// Later: refresh data
document.getElementById('refresh-btn')?.addEventListener('click', () => {
  widget.refresh();
});

// Later: cleanup
window.addEventListener('beforeunload', () => {
  widget.destroy();
});
```

---

## Testing

The SDK includes comprehensive test coverage with 236+ tests.

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Coverage

| Metric | Coverage |
|--------|----------|
| Statements | 86%+ |
| Branches | 86%+ |
| Functions | 86%+ |
| Lines | 86%+ |

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Open an issue with a clear description
- 💡 **Suggest Features** - Share your ideas for improvements
- 📝 **Improve Docs** - Help make our documentation better
- 🔧 **Submit PRs** - Fix bugs or add new features

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/sdk.git
cd sdk

# 2. Install dependencies
npm install

# 3. Run tests to ensure everything works
npm test

# 4. Start development
npm run build
```

### Code Style

- We use **ESLint** and **Prettier** for code formatting
- Write **TypeScript** with strict type checking
- Add **tests** for new features
- Update **documentation** for API changes

### Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and commit: `git commit -m 'Add amazing feature'`
3. Push to your fork: `git push origin feature/amazing-feature`
4. Open a Pull Request with a clear description

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new badge widget animation
fix: resolve theme switching bug
docs: update API reference
test: add integration tests for profile widget
refactor: improve widget rendering performance
```

---

## Author

<div align="center">
  <img src="https://github.com/SachinCoder1.png" width="100" style="border-radius: 50%;" alt="Sachin" />

  **Sachin**

  [![GitHub](https://img.shields.io/badge/GitHub-SachinCoder1-181717?style=flat-square&logo=github)](https://github.com/SachinCoder1)
  [![Twitter](https://img.shields.io/badge/Twitter-@SachinCoder1-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/AgarwalSacwordi)

  *Building the future of Web3 identity and reputation*
</div>

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2024 DotPassport

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## Links

<div align="center">

| Resource | Link |
|----------|------|
| 📦 NPM Package | [npmjs.com/@dotpassport/sdk](https://www.npmjs.com/package/@dotpassport/sdk) |
| 📖 Documentation | [docs.dotpassport.xyz](https://docs.dotpassport.xyz) |
| 🌐 Website | [dotpassport.xyz](https://dotpassport.xyz) |
| 🐛 Issues | [GitHub Issues](https://github.com/SachinCoder1/dotpassport-sdk/issues) |
| 💬 Discord | [Join our community](https://discord.gg/dotpassport) |

</div>

---

<div align="center">

**[⬆ Back to Top](#dotpassport-sdk)**

---

Made with ❤️ by the DotPassport Team

*Empowering Web3 identity and reputation*

</div>
