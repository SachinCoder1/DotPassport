# Multiple Widgets Examples

Display multiple DotPassport widgets together.

## Dashboard Layout

Create a complete reputation dashboard:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .widget-card {
      border-radius: 12px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="widget-card" id="reputation"></div>
    <div class="widget-card" id="badges"></div>
    <div class="widget-card" id="profile"></div>
  </div>

  <script type="module">
    import { createWidget } from '@dotpassport/sdk';

    const API_KEY = 'your_api_key';
    const ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

    const widgets = [];

    // Reputation widget
    const reputation = createWidget({
      apiKey: API_KEY,
      address: ADDRESS,
      type: 'reputation',
      showCategories: true
    });
    reputation.mount('#reputation');
    widgets.push(reputation);

    // Badge widget
    const badge = createWidget({
      apiKey: API_KEY,
      address: ADDRESS,
      type: 'badge',
      maxBadges: 6
    });
    badge.mount('#badges');
    widgets.push(badge);

    // Profile widget
    const profile = createWidget({
      apiKey: API_KEY,
      address: ADDRESS,
      type: 'profile'
    });
    profile.mount('#profile');
    widgets.push(profile);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      widgets.forEach(w => w.destroy());
    });
  </script>
</body>
</html>
```

---

## React Dashboard

```tsx
import { useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

interface DashboardProps {
  address: string;
  theme?: 'light' | 'dark';
}

function ReputationDashboard({ address, theme = 'light' }: DashboardProps) {
  const reputationRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef<ReturnType<typeof createWidget>[]>([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_DOTPASSPORT_API_KEY;

    // Create all widgets
    if (reputationRef.current) {
      const w = createWidget({ apiKey, address, type: 'reputation', theme, showCategories: true });
      w.mount(reputationRef.current);
      widgetsRef.current.push(w);
    }

    if (badgeRef.current) {
      const w = createWidget({ apiKey, address, type: 'badge', theme, maxBadges: 8 });
      w.mount(badgeRef.current);
      widgetsRef.current.push(w);
    }

    if (profileRef.current) {
      const w = createWidget({ apiKey, address, type: 'profile', theme });
      w.mount(profileRef.current);
      widgetsRef.current.push(w);
    }

    return () => {
      widgetsRef.current.forEach(w => w.destroy());
      widgetsRef.current = [];
    };
  }, []);

  // Update all widgets when props change
  useEffect(() => {
    widgetsRef.current.forEach(w => w.update({ address, theme }));
  }, [address, theme]);

  const refreshAll = () => {
    widgetsRef.current.forEach(w => w.refresh());
  };

  return (
    <div className="dashboard">
      <button onClick={refreshAll}>Refresh All</button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div ref={reputationRef} className="widget-card" />
        <div ref={badgeRef} className="widget-card" />
        <div ref={profileRef} className="widget-card" />
      </div>
    </div>
  );
}
```

---

## Category Grid

Display all reputation categories:

```typescript
import { createWidget } from '@dotpassport/sdk';

const API_KEY = 'your_api_key';
const ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

const categories = [
  'longevity',
  'governance',
  'identity',
  'staking',
  'activity',
  'democracy'
];

const widgets: ReturnType<typeof createWidget>[] = [];

// Create a widget for each category
categories.forEach((categoryKey, index) => {
  const container = document.getElementById(`category-${index}`);
  if (!container) return;

  const widget = createWidget({
    apiKey: API_KEY,
    address: ADDRESS,
    type: 'category',
    categoryKey
  });

  widget.mount(container);
  widgets.push(widget);
});

// Update all when address changes
function updateAddress(newAddress: string) {
  widgets.forEach(w => w.update({ address: newAddress }));
}

// Cleanup
function cleanup() {
  widgets.forEach(w => w.destroy());
}
```

---

## Vue Multi-Widget Component

```vue
<template>
  <div class="dashboard">
    <div class="controls">
      <input v-model="address" placeholder="Enter address" />
      <button @click="refreshAll">Refresh All</button>
    </div>

    <div class="widget-grid">
      <div ref="reputationContainer" class="widget"></div>
      <div ref="badgeContainer" class="widget"></div>
      <div ref="profileContainer" class="widget"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget } from '@dotpassport/sdk';

const address = ref('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

const reputationContainer = ref<HTMLElement | null>(null);
const badgeContainer = ref<HTMLElement | null>(null);
const profileContainer = ref<HTMLElement | null>(null);

const widgets: ReturnType<typeof createWidget>[] = [];

onMounted(() => {
  const apiKey = import.meta.env.VITE_DOTPASSPORT_API_KEY;

  if (reputationContainer.value) {
    const w = createWidget({ apiKey, address: address.value, type: 'reputation' });
    w.mount(reputationContainer.value);
    widgets.push(w);
  }

  if (badgeContainer.value) {
    const w = createWidget({ apiKey, address: address.value, type: 'badge' });
    w.mount(badgeContainer.value);
    widgets.push(w);
  }

  if (profileContainer.value) {
    const w = createWidget({ apiKey, address: address.value, type: 'profile' });
    w.mount(profileContainer.value);
    widgets.push(w);
  }
});

onUnmounted(() => {
  widgets.forEach(w => w.destroy());
});

watch(address, (newAddress) => {
  widgets.forEach(w => w.update({ address: newAddress }));
});

function refreshAll() {
  widgets.forEach(w => w.refresh());
}
</script>

<style scoped>
.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
</style>
```

---

## Widget Manager Pattern

Centralize widget management:

```typescript
import { createWidget } from '@dotpassport/sdk';

type WidgetType = 'reputation' | 'badge' | 'profile' | 'category';

interface WidgetInstance {
  id: string;
  type: WidgetType;
  widget: ReturnType<typeof createWidget>;
}

class WidgetManager {
  private apiKey: string;
  private widgets: Map<string, WidgetInstance> = new Map();
  private address: string = '';
  private theme: 'light' | 'dark' = 'light';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setAddress(address: string) {
    this.address = address;
    this.updateAll({ address });
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    this.updateAll({ theme });
  }

  create(id: string, type: WidgetType, container: string | HTMLElement, options: any = {}) {
    // Destroy existing widget with same ID
    if (this.widgets.has(id)) {
      this.destroy(id);
    }

    const widget = createWidget({
      apiKey: this.apiKey,
      address: this.address,
      type,
      theme: this.theme,
      ...options
    });

    widget.mount(container);

    this.widgets.set(id, { id, type, widget });

    return widget;
  }

  get(id: string) {
    return this.widgets.get(id)?.widget;
  }

  update(id: string, config: any) {
    this.widgets.get(id)?.widget.update(config);
  }

  updateAll(config: any) {
    this.widgets.forEach(({ widget }) => widget.update(config));
  }

  refresh(id: string) {
    return this.widgets.get(id)?.widget.refresh();
  }

  refreshAll() {
    return Promise.all(
      Array.from(this.widgets.values()).map(({ widget }) => widget.refresh())
    );
  }

  destroy(id: string) {
    const instance = this.widgets.get(id);
    if (instance) {
      instance.widget.destroy();
      this.widgets.delete(id);
    }
  }

  destroyAll() {
    this.widgets.forEach(({ widget }) => widget.destroy());
    this.widgets.clear();
  }

  getIds() {
    return Array.from(this.widgets.keys());
  }
}

// Usage
const manager = new WidgetManager('your_api_key');

// Set address for all widgets
manager.setAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

// Create widgets
manager.create('main-reputation', 'reputation', '#reputation-container', { showCategories: true });
manager.create('main-badges', 'badge', '#badge-container', { maxBadges: 8 });
manager.create('main-profile', 'profile', '#profile-container');

// Update all themes at once
document.getElementById('theme-toggle').addEventListener('click', () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  manager.setTheme(newTheme);
});

// Refresh all widgets
document.getElementById('refresh-all').addEventListener('click', () => {
  manager.refreshAll();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  manager.destroyAll();
});
```

---

## Comparison View

Compare two addresses side by side:

```typescript
import { createWidget } from '@dotpassport/sdk';

const API_KEY = 'your_api_key';

function createComparisonView(address1: string, address2: string) {
  const widgets: ReturnType<typeof createWidget>[] = [];

  // Left side - Address 1
  const left1 = createWidget({ apiKey: API_KEY, address: address1, type: 'reputation' });
  left1.mount('#left-reputation');
  widgets.push(left1);

  const left2 = createWidget({ apiKey: API_KEY, address: address1, type: 'badge' });
  left2.mount('#left-badges');
  widgets.push(left2);

  // Right side - Address 2
  const right1 = createWidget({ apiKey: API_KEY, address: address2, type: 'reputation' });
  right1.mount('#right-reputation');
  widgets.push(right1);

  const right2 = createWidget({ apiKey: API_KEY, address: address2, type: 'badge' });
  right2.mount('#right-badges');
  widgets.push(right2);

  return {
    updateLeft(address: string) {
      widgets[0].update({ address });
      widgets[1].update({ address });
    },
    updateRight(address: string) {
      widgets[2].update({ address });
      widgets[3].update({ address });
    },
    destroy() {
      widgets.forEach(w => w.destroy());
    }
  };
}

// Usage
const comparison = createComparisonView(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
);
```

---

## Related

- [Basic Usage](./basic-usage.md)
- [Dynamic Updates](./dynamic-updates.md)
- [Real World Examples](./real-world.md)
