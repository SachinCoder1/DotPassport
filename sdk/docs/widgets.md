# Widget Guide

Complete guide to using DotPassport SDK embeddable widgets.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Widget Types](#widget-types)
  - [Reputation Widget](#reputation-widget)
  - [Badge Widget](#badge-widget)
  - [Profile Widget](#profile-widget)
  - [Category Widget](#category-widget)
- [Configuration Options](#configuration-options)
- [Lifecycle Methods](#lifecycle-methods)
- [Framework Integration](#framework-integration)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Angular](#angular)
- [Theming and Customization](#theming-and-customization)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Overview

DotPassport SDK provides framework-agnostic embeddable widgets for displaying user reputation data. Widgets are:

- **Framework-Agnostic**: Works with React, Vue, Svelte, Angular, or vanilla JS
- **Lightweight**: ~7KB gzipped per widget
- **TypeScript-First**: Complete type safety with auto-completion
- **Customizable**: Full theme support and CSS variable overrides
- **Zero Dependencies**: Self-contained with inline styles

## Installation

```bash
npm install @dotpassport/sdk
```

## Quick Start

```html
<div id="reputation-widget"></div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  createWidget({
    apiKey: 'live_your_api_key_here',
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
  }).mount('#reputation-widget');
</script>
```

This creates a reputation widget showing the user's total score and category breakdown.

## Widget Types

### Reputation Widget

Displays total reputation score with optional category breakdown.

**Default Widget** - If no `type` is specified, this widget is created.

```typescript
import { createWidget } from '@dotpassport/sdk';

createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'reputation',        // Optional, default
  showCategories: true,      // Show category scores
  maxCategories: 6,          // Limit displayed categories
  compact: false             // Compact layout
}).mount('#reputation-widget');
```

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showCategories` | `boolean` | `true` | Show category score breakdown |
| `maxCategories` | `number` | `6` | Maximum categories to display |
| `compact` | `boolean` | `false` | Use compact layout mode |

**Data Displayed:**
- Total reputation score (large number)
- Category scores with titles
- Last calculated timestamp

### Badge Widget

Shows badges earned by the user with optional progress indicators.

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'badges',
  badgeKey: 'relay_chain_initiate',  // Optional: show specific badge
  maxBadges: 3,                      // Limit displayed badges
  showProgress: true                 // Show completion percentage
}).mount('#badge-widget');
```

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `badgeKey` | `string` | - | Show only specific badge |
| `maxBadges` | `number` | `6` | Maximum badges to display |
| `showProgress` | `boolean` | `false` | Show progress indicators |

**Data Displayed:**
- Badge icons and names
- Badge descriptions
- Earned date
- Progress percentage (if enabled)

### Profile Widget

User profile card with identity and social links.

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'profile',
  showIdentities: true,      // Show on-chain identities
  showSocials: true,         // Show social media links
  showBio: true              // Show user bio
}).mount('#profile-widget');
```

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showIdentities` | `boolean` | `true` | Display on-chain identities |
| `showSocials` | `boolean` | `true` | Display social media links |
| `showBio` | `boolean` | `true` | Display user biography |

**Data Displayed:**
- Display name and avatar
- Polkadot address
- On-chain identities
- Social media links (Twitter, GitHub, Discord)
- User bio/description

### Category Widget

Detailed breakdown of a specific reputation category.

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'polkadot-address',
  type: 'category',
  categoryKey: 'longevity',      // Required
  showBreakdown: true,           // Show score breakdown
  showAdvice: true               // Show improvement tips
}).mount('#category-widget');
```

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `categoryKey` | `string` | **Required** | Category to display |
| `showBreakdown` | `boolean` | `true` | Show detailed score breakdown |
| `showAdvice` | `boolean` | `false` | Show improvement advice |

**Available Category Keys:**
- `longevity` - Account age
- `tx_count` - Transaction volume
- `governance` - Governance participation
- `identity` - On-chain identity
- `unique_interactions` - Network diversity
- `technical_contributions` - Developer activity

**Data Displayed:**
- Category score and title
- Score breakdown by reason
- Achievement thresholds
- Improvement advice (if enabled)

## Configuration Options

### Base Configuration

All widgets accept these base configuration options:

```typescript
interface BaseWidgetConfig {
  apiKey: string;              // Required: Your API key
  address: string;             // Required: Polkadot address
  baseUrl?: string;            // Optional: API base URL
  theme?: 'light' | 'dark' | 'auto';  // Theme mode
  className?: string;          // Additional CSS class
  onError?: (error: Error) => void;   // Error callback
  onLoad?: () => void;         // Load callback
}
```

### Theme Options

Widgets support three theme modes:

- **`light`**: Light theme with light backgrounds
- **`dark`**: Dark theme with dark backgrounds
- **`auto`**: Automatically matches system preference

```typescript
// Manual theme
createWidget({
  apiKey: 'your-key',
  address: 'address',
  theme: 'dark'
}).mount('#widget');

// Auto theme (matches system)
createWidget({
  apiKey: 'your-key',
  address: 'address',
  theme: 'auto'
}).mount('#widget');
```

### Callbacks

Widgets provide callbacks for monitoring state:

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'address',
  onLoad: () => {
    console.log('Widget loaded successfully');
  },
  onError: (error) => {
    console.error('Widget error:', error.message);
    // Handle error (show notification, retry, etc.)
  }
}).mount('#widget');
```

## Lifecycle Methods

All widgets provide these lifecycle methods:

### mount()

Mounts the widget to a DOM element.

```typescript
const widget = createWidget(config);

// Mount to selector
await widget.mount('#widget-container');

// Mount to element
const container = document.getElementById('widget');
await widget.mount(container);
```

### update()

Updates widget configuration and optionally re-fetches data.

```typescript
const widget = createWidget({
  apiKey: 'key',
  address: 'address-1'
});
widget.mount('#widget');

// Later, update to show different user
await widget.update({
  address: 'address-2'  // Will re-fetch data
});

// Update theme only (no re-fetch)
widget.update({
  theme: 'dark'
});
```

### refresh()

Re-fetches current data from the API.

```typescript
const widget = createWidget(config);
widget.mount('#widget');

// Later, refresh data
await widget.refresh();
```

### destroy()

Removes the widget from DOM and cleans up.

```typescript
const widget = createWidget(config);
widget.mount('#widget');

// When done, destroy
widget.destroy();
```

## Framework Integration

### React

Create a reusable React component:

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
function App() {
  return (
    <DotPassportWidget
      apiKey="your-key"
      address="polkadot-address"
      type="reputation"
      showCategories={true}
    />
  );
}
```

**With State Management:**

```tsx
import { useState } from 'react';

function UserProfile({ address }: { address: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <DotPassportWidget
        apiKey="your-key"
        address={address}
        theme={theme}
      />
    </div>
  );
}
```

### Vue

Vue 3 Composition API component:

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

**Usage:**

```vue
<template>
  <DotPassportWidget
    :apiKey="apiKey"
    :address="address"
    type="reputation"
    :showCategories="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DotPassportWidget from './DotPassportWidget.vue';

const apiKey = ref('your-key');
const address = ref('polkadot-address');
</script>
```

### Svelte

Svelte component:

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

**Usage:**

```svelte
<script lang="ts">
  import DotPassportWidget from './DotPassportWidget.svelte';

  let config = {
    apiKey: 'your-key',
    address: 'polkadot-address',
    type: 'reputation' as const
  };
</script>

<DotPassportWidget {config} />
```

### Angular

Angular component:

```typescript
import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

@Component({
  selector: 'app-dotpassport-widget',
  template: '<div #container></div>'
})
export class DotPassportWidgetComponent implements OnInit, OnDestroy {
  @Input() config!: WidgetConfig;
  @ViewChild('container', { static: true }) container!: ElementRef;

  private widget: any;

  ngOnInit() {
    this.widget = createWidget(this.config);
    this.widget.mount(this.container.nativeElement);
  }

  ngOnDestroy() {
    this.widget?.destroy();
  }

  ngOnChanges() {
    if (this.widget) {
      this.widget.update(this.config);
    }
  }
}
```

**Usage:**

```html
<app-dotpassport-widget
  [config]="{
    apiKey: 'your-key',
    address: 'polkadot-address',
    type: 'reputation'
  }">
</app-dotpassport-widget>
```

## Theming and Customization

### CSS Variables

Widgets use CSS variables that can be overridden:

```css
:root {
  /* Colors */
  --dp-primary: #8b5cf6;
  --dp-secondary: #ec4899;
  --dp-bg: #ffffff;
  --dp-text-primary: #111827;
  --dp-text-secondary: #6b7280;
  --dp-border: #e5e7eb;

  /* Spacing */
  --dp-spacing-xs: 0.25rem;
  --dp-spacing-sm: 0.5rem;
  --dp-spacing-md: 1rem;
  --dp-spacing-lg: 1.5rem;
  --dp-spacing-xl: 2rem;

  /* Border Radius */
  --dp-radius-sm: 0.375rem;
  --dp-radius-md: 0.5rem;
  --dp-radius-lg: 0.75rem;

  /* Shadows */
  --dp-shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --dp-shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Custom Styling

**Brand Colors:**

```css
.my-custom-widget {
  --dp-primary: #3b82f6;      /* Custom blue */
  --dp-secondary: #10b981;    /* Custom green */
}
```

```typescript
createWidget({
  apiKey: 'key',
  address: 'address',
  className: 'my-custom-widget'
}).mount('#widget');
```

**Dark Theme Overrides:**

```css
.dp-theme-dark {
  --dp-primary: #a78bfa;      /* Lighter purple for dark mode */
  --dp-bg: #0f172a;           /* Darker background */
  --dp-text-primary: #f1f5f9;
}
```

**Complete Custom Theme:**

```css
.custom-theme {
  --dp-primary: #ff6b6b;
  --dp-secondary: #4ecdc4;
  --dp-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --dp-text-primary: #ffffff;
  --dp-text-secondary: rgba(255,255,255,0.8);
  --dp-border: rgba(255,255,255,0.2);
  --dp-radius-lg: 1rem;
  --dp-shadow-md: 0 8px 32px rgba(0,0,0,0.3);

  backdrop-filter: blur(10px);
}
```

## Error Handling

### Error States

Widgets automatically handle errors and display error states:

```typescript
createWidget({
  apiKey: 'your-key',
  address: 'invalid-address',
  onError: (error) => {
    console.error('Widget error:', error.message);

    // Send to error tracking
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }

    // Show user notification
    showNotification('Failed to load reputation data', 'error');
  }
}).mount('#widget');
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Container not found` | Invalid selector | Check selector exists in DOM |
| `Invalid or missing API key` | Wrong/missing apiKey | Verify API key configuration |
| `User not found` | Address doesn't exist | Validate address before mounting |
| `Rate limit exceeded` | Too many requests | Implement rate limit handling |
| `Network error` | Connection failed | Add retry logic or show offline state |

### Retry Logic

```typescript
async function mountWithRetry(config: WidgetConfig, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const widget = createWidget(config);
      await widget.mount('#widget');
      return widget;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Best Practices

### Performance

**1. Lazy Loading**

Load widgets only when needed:

```typescript
// Load widget when scrolled into view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      createWidget(config).mount(entry.target);
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(document.getElementById('widget')!);
```

**2. Caching**

Cache widget instances for reuse:

```typescript
const widgetCache = new Map();

function getWidget(address: string) {
  if (!widgetCache.has(address)) {
    const widget = createWidget({ apiKey: 'key', address });
    widgetCache.set(address, widget);
  }
  return widgetCache.get(address);
}
```

**3. Cleanup**

Always destroy widgets when unmounting:

```typescript
// React
useEffect(() => {
  const widget = createWidget(config);
  widget.mount(ref.current);
  return () => widget.destroy();  // Cleanup
}, []);
```

### Security

**1. API Key Protection**

Never expose API keys in client-side code:

```typescript
// ❌ Bad: Hardcoded key
createWidget({
  apiKey: 'live_secret_key_12345',
  address: address
});

// ✅ Good: Use environment variables
createWidget({
  apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
  address: address
});
```

**2. Address Validation**

Validate addresses before mounting:

```typescript
import { isValidPolkadotAddress } from '@polkadot/util-crypto';

function mountWidget(address: string) {
  if (!isValidPolkadotAddress(address)) {
    throw new Error('Invalid Polkadot address');
  }
  createWidget({ apiKey: 'key', address }).mount('#widget');
}
```

### Accessibility

Widgets are built with accessibility in mind, but you can enhance them:

```html
<!-- Add ARIA labels -->
<div
  id="widget"
  role="region"
  aria-label="User reputation score"
  aria-live="polite"
></div>
```

## API Reference

### createWidget()

Factory function to create any widget type.

```typescript
function createWidget(config: WidgetConfig): BaseWidget
```

**Parameters:**
- `config`: Widget configuration object

**Returns:** Widget instance with lifecycle methods

### createReputationWidget()

Create reputation widget specifically (tree-shakeable).

```typescript
function createReputationWidget(
  config: Omit<ReputationWidgetConfig, 'type'>
): ReputationWidget
```

### createBadgeWidget()

Create badge widget specifically (tree-shakeable).

```typescript
function createBadgeWidget(
  config: Omit<BadgeWidgetConfig, 'type'>
): BadgeWidget
```

### createProfileWidget()

Create profile widget specifically (tree-shakeable).

```typescript
function createProfileWidget(
  config: Omit<ProfileWidgetConfig, 'type'>
): ProfileWidget
```

### createCategoryWidget()

Create category widget specifically (tree-shakeable).

```typescript
function createCategoryWidget(
  config: Omit<CategoryWidgetConfig, 'type'>
): CategoryWidget
```

### BaseWidget Methods

All widgets extend `BaseWidget` and provide these methods:

#### mount(selector)

```typescript
async mount(selector: string | HTMLElement): Promise<void>
```

Mounts widget to DOM element.

#### update(config)

```typescript
async update(config: Partial<TConfig>): Promise<void>
```

Updates configuration and optionally re-fetches data.

#### refresh()

```typescript
async refresh(): Promise<void>
```

Re-fetches current data from API.

#### destroy()

```typescript
destroy(): void
```

Removes widget from DOM and cleans up resources.

---

For more information, see:
- [Main README](../README.md)
- [API Reference](./api-reference.md)
- [Examples](../examples/)
- [NPM Package](https://www.npmjs.com/package/@dotpassport/sdk)
