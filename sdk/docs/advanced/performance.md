# Performance Optimization

Optimize DotPassport widgets for the best user experience.

## Bundle Size

The SDK is designed to be lightweight:

| Package | Size (gzipped) |
|---------|----------------|
| Full SDK | ~8KB |
| Widget only | ~6KB |
| API client only | ~3KB |

---

## Tree Shaking

Import only what you need:

```typescript
// ✅ Good - only imports what's needed
import { createWidget } from '@dotpassport/sdk';
import { DotPassportClient } from '@dotpassport/sdk';

// ❌ Avoid - imports everything
import * as DotPassport from '@dotpassport/sdk';
```

---

## Lazy Loading

### Dynamic Imports

Load widgets only when needed:

```typescript
// Load SDK only when widget is needed
async function loadWidget(address: string) {
  const { createWidget } = await import('@dotpassport/sdk');

  const widget = createWidget({
    apiKey: 'your_api_key',
    address,
    type: 'reputation'
  });

  widget.mount('#container');
  return widget;
}

// Trigger on user action or scroll
button.addEventListener('click', () => loadWidget(address));
```

### React Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

// Lazy load the widget component
const DotPassportWidget = lazy(() => import('./DotPassportWidget'));

function App() {
  return (
    <Suspense fallback={<div>Loading widget...</div>}>
      <DotPassportWidget address={address} />
    </Suspense>
  );
}
```

### Intersection Observer (Load on Scroll)

```typescript
function lazyLoadWidget(containerSelector: string, address: string) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const observer = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();

        const { createWidget } = await import('@dotpassport/sdk');
        const widget = createWidget({
          apiKey: 'your_api_key',
          address,
          type: 'reputation'
        });
        widget.mount(container);
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(container);
}

// Usage
lazyLoadWidget('#widget-container', '5Grwva...');
```

---

## Caching Strategies

### API Response Caching

Implement caching at the application level for best results:

```typescript
const cache = new Map();

async function getCachedScores(address: string) {
  const cached = cache.get(address);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }

  const data = await client.getScores(address);
  cache.set(address, { data, timestamp: Date.now() });
  return data;
}
```

---

## Minimize Re-renders

### React Optimization

```tsx
import { memo, useMemo, useCallback } from 'react';

// Memoize the widget component
const DotPassportWidget = memo(function DotPassportWidget({
  address,
  theme
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  // Memoize config to prevent unnecessary updates
  const config = useMemo(() => ({
    apiKey: 'your_api_key',
    address,
    type: 'reputation' as const,
    theme
  }), [address, theme]);

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget(config);
    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [config]);

  return <div ref={containerRef} />;
});
```

### Debounce Address Changes

```typescript
import { useDebouncedValue } from './hooks';

function AddressLookup() {
  const [inputAddress, setInputAddress] = useState('');
  const debouncedAddress = useDebouncedValue(inputAddress, 500);

  return (
    <>
      <input
        value={inputAddress}
        onChange={(e) => setInputAddress(e.target.value)}
      />
      {debouncedAddress && (
        <DotPassportWidget address={debouncedAddress} />
      )}
    </>
  );
}

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Batch API Requests

Fetch multiple data points in parallel:

```typescript
// ✅ Good - parallel requests
const [scores, badges, profile] = await Promise.all([
  client.getScores(address),
  client.getBadges(address),
  client.getProfile(address)
]);

// ❌ Bad - sequential requests
const scores = await client.getScores(address);
const badges = await client.getBadges(address);
const profile = await client.getProfile(address);
```

---

## Preloading

Preload data before it's needed:

```typescript
// Preload on hover
element.addEventListener('mouseenter', () => {
  // Start loading in background
  client.getScores(address).catch(() => {});
});

// React prefetch hook
function usePrefetch(address: string) {
  useEffect(() => {
    // Prefetch data when component mounts
    Promise.all([
      client.getScores(address),
      client.getBadges(address)
    ]).catch(() => {});
  }, [address]);
}
```

---

## Resource Hints

Add preconnect hints for faster initial loads:

```html
<head>
  <!-- Preconnect to API server -->
  <link rel="preconnect" href="https://api.dotpassport.xyz" />
  <link rel="dns-prefetch" href="https://api.dotpassport.xyz" />
</head>
```

---

## Multiple Widgets

### Efficient Multi-Widget Setup

```typescript
// Share API key and batch initialization
const API_KEY = 'your_api_key';
const addresses = ['5Grwva...', '5FHne...', '5DAn...'];

// Create widgets efficiently
const widgets = addresses.map(address =>
  createWidget({
    apiKey: API_KEY,
    address,
    type: 'reputation'
  })
);

// Mount all
widgets.forEach((widget, i) => {
  widget.mount(`#widget-${i}`);
});

// Cleanup all
function cleanup() {
  widgets.forEach(w => w.destroy());
}
```

### Virtual Scrolling for Many Widgets

For displaying many widgets, use virtualization:

```tsx
import { FixedSizeList } from 'react-window';

function VirtualizedWidgetList({ addresses }: { addresses: string[] }) {
  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={addresses.length}
      itemSize={200}
    >
      {({ index, style }) => (
        <div style={style}>
          <DotPassportWidget address={addresses[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## Performance Monitoring

### Measure Load Time

```typescript
const startTime = performance.now();

const widget = createWidget({
  apiKey: 'your_api_key',
  address,
  type: 'reputation',
  onLoad: () => {
    const loadTime = performance.now() - startTime;
    console.log(`Widget loaded in ${loadTime.toFixed(2)}ms`);

    // Send to analytics
    analytics.track('widget_load_time', { loadTime });
  }
});
```

### Web Vitals Integration

```typescript
import { onLCP, onFID, onCLS } from 'web-vitals';

onLCP(console.log);
onFID(console.log);
onCLS(console.log);
```

---

## Best Practices Summary

| Practice | Impact | Effort |
|----------|--------|--------|
| Tree shaking | Medium | Low |
| Lazy loading | High | Medium |
| Response caching | High | Low |
| Parallel requests | Medium | Low |
| Debouncing | Medium | Low |
| Memoization | Medium | Medium |
| Preconnect hints | Low | Low |

---

## Related

- [Caching Strategies](./caching.md)
- [Widget Lifecycle](../widgets/lifecycle.md)
- [React Integration](../frameworks/react.md)
