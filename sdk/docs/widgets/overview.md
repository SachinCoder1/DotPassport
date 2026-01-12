# Widgets Overview

Framework-agnostic embeddable widgets for displaying reputation data.

## Features

- **Framework-Agnostic** - Works with any framework or vanilla JS
- **Lightweight** - ~7KB gzipped per widget
- **Customizable** - Full theme and style support
- **Zero Dependencies** - Self-contained with inline styles

## Available Widgets

### Reputation Widget (Default)

Displays total reputation score with category breakdown.

[Learn more →](./reputation.md)

### Badge Widget

Shows badges earned by the user.

[Learn more →](./badge.md)

### Profile Widget

User profile card with social links.

[Learn more →](./profile.md)

### Category Widget

Detailed breakdown of a specific category.

[Learn more →](./category.md)

## Quick Start

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

## Common Configuration

All widgets accept these options:

```typescript
{
  apiKey: string;              // Required
  address: string;             // Required
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}
```

## Next Steps

- [Reputation Widget](./reputation.md)
- [Badge Widget](./badge.md)
- [Lifecycle Methods](./lifecycle.md)
- [Theming](./theming.md)
