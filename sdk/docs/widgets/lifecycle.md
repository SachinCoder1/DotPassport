# Widget Lifecycle Methods

Control widget behavior with lifecycle methods.

## Overview

All DotPassport widgets share the same lifecycle methods:

| Method | Description |
|--------|-------------|
| `mount()` | Attach widget to DOM |
| `update()` | Update widget configuration |
| `refresh()` | Reload widget data |
| `destroy()` | Remove widget and cleanup |

---

## mount()

Attaches the widget to a DOM element.

### Signature

```typescript
mount(target: string | HTMLElement): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `string \| HTMLElement` | CSS selector or DOM element |

### Examples

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

// Mount using CSS selector
widget.mount('#container');

// Mount using DOM element
const element = document.getElementById('container');
widget.mount(element);

// Mount using query selector
widget.mount('.widget-container');
```

### Error Handling

```typescript
try {
  widget.mount('#non-existent');
} catch (error) {
  console.error('Mount failed:', error.message);
  // "Target element not found: #non-existent"
}
```

---

## update()

Updates widget configuration without full remount.

### Signature

```typescript
update(config: Partial<WidgetConfig>): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `Partial<WidgetConfig>` | Configuration properties to update |

### Examples

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: initialAddress,
  type: 'reputation',
  theme: 'light'
});

widget.mount('#container');

// Update address
widget.update({ address: newAddress });

// Update theme
widget.update({ theme: 'dark' });

// Update multiple properties
widget.update({
  address: newAddress,
  theme: 'dark',
  showCategories: false
});
```

### Use Cases

#### Address Change (Wallet Switch)

```typescript
walletProvider.on('accountChanged', (newAddress) => {
  widget.update({ address: newAddress });
});
```

#### Theme Toggle

```typescript
themeToggle.addEventListener('click', () => {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  widget.update({ theme: newTheme });
  currentTheme = newTheme;
});
```

#### System Theme Change

```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  widget.update({ theme: e.matches ? 'dark' : 'light' });
});
```

---

## refresh()

Reloads widget data from the API.

### Signature

```typescript
refresh(): Promise<void>
```

### Examples

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

widget.mount('#container');

// Manual refresh button
refreshButton.addEventListener('click', async () => {
  await widget.refresh();
  console.log('Data refreshed');
});

// Auto-refresh every 5 minutes
setInterval(() => {
  widget.refresh();
}, 5 * 60 * 1000);
```

### Use Cases

#### After User Action

```typescript
async function handleUserAction() {
  // User performed an action that might change their score
  await performAction();

  // Refresh widget to show updated data
  await widget.refresh();
}
```

#### Pull-to-Refresh

```typescript
import { usePullToRefresh } from './hooks';

usePullToRefresh({
  onRefresh: async () => {
    await widget.refresh();
  }
});
```

---

## destroy()

Removes the widget from DOM and cleans up resources.

### Signature

```typescript
destroy(): void
```

### Examples

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

widget.mount('#container');

// Later, cleanup
widget.destroy();
```

### Use Cases

#### React useEffect Cleanup

```tsx
useEffect(() => {
  const widget = createWidget({ ... });
  widget.mount(containerRef.current);

  return () => {
    widget.destroy();
  };
}, []);
```

#### Vue onUnmounted

```vue
<script setup>
onUnmounted(() => {
  widget?.destroy();
});
</script>
```

#### Page Navigation

```typescript
// Before navigating away
window.addEventListener('beforeunload', () => {
  widget.destroy();
});

// SPA route change
router.beforeEach(() => {
  widget.destroy();
});
```

---

## Complete Lifecycle Example

```typescript
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

class WidgetManager {
  private widget: ReturnType<typeof createWidget> | null = null;
  private config: WidgetConfig;

  constructor(config: WidgetConfig) {
    this.config = config;
  }

  // Mount widget to container
  mount(container: string | HTMLElement): void {
    if (this.widget) {
      console.warn('Widget already mounted. Call destroy() first.');
      return;
    }

    this.widget = createWidget(this.config);
    this.widget.mount(container);
  }

  // Update widget config
  update(config: Partial<WidgetConfig>): void {
    if (!this.widget) {
      console.warn('Widget not mounted. Call mount() first.');
      return;
    }

    this.widget.update(config);
    this.config = { ...this.config, ...config };
  }

  // Refresh widget data
  async refresh(): Promise<void> {
    if (!this.widget) {
      console.warn('Widget not mounted.');
      return;
    }

    await this.widget.refresh();
  }

  // Destroy and cleanup
  destroy(): void {
    if (!this.widget) {
      return;
    }

    this.widget.destroy();
    this.widget = null;
  }

  // Check if mounted
  get isMounted(): boolean {
    return this.widget !== null;
  }
}

// Usage
const manager = new WidgetManager({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

manager.mount('#container');
manager.update({ theme: 'dark' });
await manager.refresh();
manager.destroy();
```

---

## React Hook Example

```tsx
import { useRef, useEffect, useCallback } from 'react';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

function useDotPassportWidget(config: WidgetConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget(config);
    widgetRef.current.mount(containerRef.current);

    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  const update = useCallback((newConfig: Partial<WidgetConfig>) => {
    widgetRef.current?.update(newConfig);
  }, []);

  const refresh = useCallback(async () => {
    await widgetRef.current?.refresh();
  }, []);

  return { containerRef, update, refresh };
}

// Usage
function MyComponent() {
  const { containerRef, update, refresh } = useDotPassportWidget({
    apiKey: 'your_api_key',
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    type: 'reputation'
  });

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={() => update({ theme: 'dark' })}>Dark Theme</button>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

---

## Related

- [Reputation Widget](./reputation.md)
- [Badge Widget](./badge.md)
- [Profile Widget](./profile.md)
- [Category Widget](./category.md)
- [Theming & Customization](./theming.md)
