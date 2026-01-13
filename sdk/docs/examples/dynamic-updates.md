# Dynamic Update Examples

Update widgets dynamically without remounting.

## Address Switching

Update the widget when the user changes address:

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

widget.mount('#container');

// Update to a new address
function switchAddress(newAddress: string) {
  widget.update({ address: newAddress });
}

// Usage
document.getElementById('address-input').addEventListener('change', (e) => {
  switchAddress(e.target.value);
});
```

---

## Theme Toggling

Switch between light and dark themes:

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  theme: 'light'
});

widget.mount('#container');

let currentTheme = 'light';

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  widget.update({ theme: currentTheme });

  // Also update page theme
  document.body.classList.toggle('dark', currentTheme === 'dark');
}
```

---

## React Dynamic Updates

```tsx
import { useState, useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

function DynamicWidget() {
  const [address, setAddress] = useState('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showCategories, setShowCategories] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  // Create widget once
  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address,
      type: 'reputation',
      theme,
      showCategories
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, []); // Empty deps - only create once

  // Update when props change
  useEffect(() => {
    widgetRef.current?.update({ address, theme, showCategories });
  }, [address, theme, showCategories]);

  return (
    <div>
      <div className="controls">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
        />
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          Toggle Theme
        </button>
        <label>
          <input
            type="checkbox"
            checked={showCategories}
            onChange={(e) => setShowCategories(e.target.checked)}
          />
          Show Categories
        </label>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
```

---

## Vue Dynamic Updates

```vue
<template>
  <div>
    <div class="controls">
      <input v-model="address" placeholder="Enter address" />
      <button @click="toggleTheme">Toggle Theme</button>
      <label>
        <input type="checkbox" v-model="showCategories" />
        Show Categories
      </label>
    </div>
    <div ref="container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget } from '@dotpassport/sdk';

const address = ref('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
const theme = ref('light');
const showCategories = ref(true);
const container = ref(null);

let widget = null;

onMounted(() => {
  widget = createWidget({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
    address: address.value,
    type: 'reputation',
    theme: theme.value,
    showCategories: showCategories.value
  });
  widget.mount(container.value);
});

onUnmounted(() => {
  widget?.destroy();
});

// Watch for changes
watch([address, theme, showCategories], () => {
  widget?.update({
    address: address.value,
    theme: theme.value,
    showCategories: showCategories.value
  });
});

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
</script>
```

---

## Wallet Connection Flow

Update widget when user connects wallet:

```typescript
import { createWidget } from '@dotpassport/sdk';

let widget: ReturnType<typeof createWidget> | null = null;

// Initialize with placeholder
function initWidget() {
  widget = createWidget({
    apiKey: 'your_api_key',
    address: '', // Empty initially
    type: 'reputation'
  });
  widget.mount('#container');
}

// Update when wallet connects
async function onWalletConnect(walletAddress: string) {
  if (widget) {
    widget.update({ address: walletAddress });
  }
}

// Handle disconnect
function onWalletDisconnect() {
  if (widget) {
    widget.destroy();
    widget = null;
    document.getElementById('container').innerHTML = '<p>Connect wallet to view reputation</p>';
  }
}

// Usage with wallet library
wallet.on('connect', (address) => onWalletConnect(address));
wallet.on('disconnect', () => onWalletDisconnect());
```

---

## Refresh Data

Force a data refresh without updating config:

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation'
});

widget.mount('#container');

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', async () => {
  const button = document.getElementById('refresh-btn');
  button.disabled = true;
  button.textContent = 'Refreshing...';

  try {
    await widget.refresh();
  } catch (error) {
    console.error('Refresh failed:', error);
  } finally {
    button.disabled = false;
    button.textContent = 'Refresh';
  }
});

// Auto-refresh every 5 minutes
setInterval(() => {
  widget.refresh();
}, 5 * 60 * 1000);
```

---

## Debounced Updates

Avoid excessive updates with debouncing:

```typescript
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

// Create debounced update function
const debouncedUpdate = debounce((newAddress: string) => {
  widget.update({ address: newAddress });
}, 500);

// Use with input
document.getElementById('address-input').addEventListener('input', (e) => {
  debouncedUpdate(e.target.value);
});
```

---

## Category Selector

Switch between different category views:

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'category',
  categoryKey: 'governance'
});

widget.mount('#container');

// Category buttons
const categories = ['longevity', 'governance', 'identity', 'staking', 'activity', 'democracy'];

categories.forEach(cat => {
  document.getElementById(`btn-${cat}`).addEventListener('click', () => {
    widget.update({ categoryKey: cat });

    // Update active state
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`btn-${cat}`).classList.add('active');
  });
});
```

---

## Multiple Synchronized Updates

Update multiple widgets at once:

```typescript
const widgets = [
  createWidget({ apiKey, address, type: 'reputation' }),
  createWidget({ apiKey, address, type: 'badge' }),
  createWidget({ apiKey, address, type: 'profile' })
];

widgets[0].mount('#reputation-container');
widgets[1].mount('#badge-container');
widgets[2].mount('#profile-container');

// Update all widgets
function updateAll(newAddress: string, newTheme: 'light' | 'dark') {
  widgets.forEach(widget => {
    widget.update({ address: newAddress, theme: newTheme });
  });
}

// Refresh all widgets
async function refreshAll() {
  await Promise.all(widgets.map(w => w.refresh()));
}
```

---

## Responsive Updates

Update widget options based on screen size:

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  showCategories: true,
  compact: false
});

widget.mount('#container');

// Media query listener
const mediaQuery = window.matchMedia('(max-width: 640px)');

function handleResize(e: MediaQueryListEvent | MediaQueryList) {
  widget.update({
    compact: e.matches,
    maxCategories: e.matches ? 3 : 6
  });
}

// Initial check
handleResize(mediaQuery);

// Listen for changes
mediaQuery.addEventListener('change', handleResize);
```

---

## Related

- [Widget Lifecycle](../widgets/lifecycle.md)
- [Basic Usage](./basic-usage.md)
- [Multiple Widgets](./multiple-widgets.md)
