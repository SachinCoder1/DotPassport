# Category Widget

Display a detailed breakdown of a specific reputation category.

<div align="center">
  <img src="https://i.ibb.co/B5s14M5X/dotpassport-category-widget-score-account-longitivity.png" alt="Category Widget Light" width="300" />
  <img src="https://i.ibb.co/MxdcNdzS/dotpassport-category-widget-score-account-longitivity-with-breakdown-dark.png" alt="Category Widget Dark" width="300" />
</div>

## Quick Start

```typescript
import { createWidget } from '@dotpassport/sdk';

const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'category',
  categoryKey: 'longevity'
});

widget.mount('#container');
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your DotPassport API key |
| `address` | `string` | *required* | Polkadot address to display |
| `type` | `'category'` | *required* | Widget type |
| `categoryKey` | `string` | *required* | Category to display |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `showTitle` | `boolean` | `true` | Show category title |
| `showDescription` | `boolean` | `true` | Show category description |
| `showBreakdown` | `boolean` | `true` | Show score breakdown |
| `showAdvice` | `boolean` | `true` | Show improvement tips |
| `showScoreOnly` | `boolean` | `false` | Minimal score-only view |
| `className` | `string` | `''` | Custom CSS class |
| `onLoad` | `() => void` | - | Callback when loaded |
| `onError` | `(error: Error) => void` | - | Error callback |

---

## Available Categories

| Key | Title | Description |
|-----|-------|-------------|
| `longevity` | Account Longevity | Account age and history |
| `tx_count` | Transaction Count | On-chain transaction volume |
| `governance` | Governance | Governance participation |
| `identity` | Identity | On-chain identity verification |
| `unique_interactions` | Unique Interactions | Network diversity |
| `technical_contributions` | Technical Contributions | Developer activity |

---

## Examples

### Full Breakdown

<div align="center">
  <img src="https://i.ibb.co/GQqdTywL/dotpassport-category-widget-score-account-longitivity-with-breakdown.png" alt="Category with Breakdown" width="400" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'category',
  categoryKey: 'governance',
  showTitle: true,
  showDescription: true,
  showBreakdown: true,
  showAdvice: true
}).mount('#container');
```

### Score Only

<div align="center">
  <img src="https://i.ibb.co/m5CSjzSb/dotpassport-category-widget-only-score-account-longitivity.png" alt="Score Only" width="300" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'category',
  categoryKey: 'longevity',
  showScoreOnly: true
}).mount('#container');
```

### Without Advice

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'category',
  categoryKey: 'identity',
  showBreakdown: true,
  showAdvice: false
}).mount('#container');
```

### Dark Theme

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'category',
  categoryKey: 'governance',
  theme: 'dark'
}).mount('#container');
```

---

## Multiple Category Display

Display all categories in a grid:

```typescript
const categories = [
  'longevity',
  'tx_count',
  'governance',
  'identity',
  'unique_interactions',
  'technical_contributions'
];

const widgets = categories.map((categoryKey, index) => {
  const widget = createWidget({
    apiKey: 'your_api_key',
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    type: 'category',
    categoryKey,
    showScoreOnly: true,
    compact: true
  });

  widget.mount(`#category-${index}`);
  return widget;
});

// Cleanup all widgets
function destroyAll() {
  widgets.forEach(w => w.destroy());
}
```

---

## React Integration

```tsx
import { useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

interface CategoryWidgetProps {
  address: string;
  categoryKey: string;
  showBreakdown?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

function CategoryWidget({
  address,
  categoryKey,
  showBreakdown = true,
  theme = 'light'
}: CategoryWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: process.env.REACT_APP_DOTPASSPORT_API_KEY!,
      address,
      type: 'category',
      categoryKey,
      theme,
      showBreakdown,
      showAdvice: showBreakdown
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address, categoryKey, showBreakdown, theme]);

  return <div ref={containerRef} />;
}
```

---

## Vue Integration

```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget } from '@dotpassport/sdk';

const props = defineProps({
  address: { type: String, required: true },
  categoryKey: { type: String, required: true },
  showBreakdown: { type: Boolean, default: true }
});

const container = ref(null);
let widget = null;

onMounted(() => {
  widget = createWidget({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
    address: props.address,
    type: 'category',
    categoryKey: props.categoryKey,
    showBreakdown: props.showBreakdown
  });
  widget.mount(container.value);
});

onUnmounted(() => widget?.destroy());

watch(() => [props.address, props.categoryKey], () => {
  widget?.update({
    address: props.address,
    categoryKey: props.categoryKey
  });
});
</script>
```

---

## Category Selector Example

```typescript
const categorySelect = document.getElementById('category-select');
let widget: ReturnType<typeof createWidget>;

function createCategoryWidget(categoryKey: string) {
  widget?.destroy();

  widget = createWidget({
    apiKey: 'your_api_key',
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    type: 'category',
    categoryKey,
    showBreakdown: true
  });

  widget.mount('#category-container');
}

categorySelect.addEventListener('change', (e) => {
  createCategoryWidget((e.target as HTMLSelectElement).value);
});

// Initialize with first category
createCategoryWidget('longevity');
```

---

## Related

- [Reputation Widget](./reputation.md)
- [Scores API Methods](../api-client/scores.md)
- [Lifecycle Methods](./lifecycle.md)
- [Theming & Customization](./theming.md)
