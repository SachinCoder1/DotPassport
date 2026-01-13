# Vue Integration

Integrate DotPassport widgets with Vue 3 using the Composition API.

## Installation

```bash
npm install @dotpassport/sdk
```

---

## Basic Component

```vue
<template>
  <div ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

interface Props {
  address: string;
  type?: 'reputation' | 'badge' | 'profile' | 'category';
  theme?: 'light' | 'dark' | 'auto';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'reputation',
  theme: 'light'
});

const container = ref<HTMLElement | null>(null);
let widget: ReturnType<typeof createWidget> | null = null;

onMounted(() => {
  if (container.value) {
    widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address: props.address,
      type: props.type,
      theme: props.theme
    });
    widget.mount(container.value);
  }
});

onUnmounted(() => {
  widget?.destroy();
});

watch(() => props.address, (newAddress) => {
  widget?.update({ address: newAddress });
});

watch(() => props.theme, (newTheme) => {
  widget?.update({ theme: newTheme });
});
</script>
```

---

## Reputation Widget Component

```vue
<!-- components/DotPassportReputation.vue -->
<template>
  <div ref="container" :class="className"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget } from '@dotpassport/sdk';

interface Props {
  address: string;
  theme?: 'light' | 'dark' | 'auto';
  showCategories?: boolean;
  maxCategories?: number;
  compact?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  showCategories: true,
  maxCategories: 6,
  compact: false,
  className: ''
});

const emit = defineEmits<{
  load: [];
  error: [error: Error];
}>();

const container = ref<HTMLElement | null>(null);
let widget: ReturnType<typeof createWidget> | null = null;

onMounted(() => {
  if (container.value) {
    widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address: props.address,
      type: 'reputation',
      theme: props.theme,
      showCategories: props.showCategories,
      maxCategories: props.maxCategories,
      compact: props.compact,
      onLoad: () => emit('load'),
      onError: (error) => emit('error', error)
    });
    widget.mount(container.value);
  }
});

onUnmounted(() => {
  widget?.destroy();
});

watch(
  () => [props.address, props.theme, props.showCategories],
  () => {
    widget?.update({
      address: props.address,
      theme: props.theme,
      showCategories: props.showCategories
    });
  }
);
</script>
```

### Usage

```vue
<template>
  <DotPassportReputation
    :address="walletAddress"
    :theme="isDark ? 'dark' : 'light'"
    :show-categories="true"
    @load="onWidgetLoad"
    @error="onWidgetError"
  />
</template>

<script setup>
import DotPassportReputation from './components/DotPassportReputation.vue';
import { ref } from 'vue';

const walletAddress = ref('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
const isDark = ref(false);

function onWidgetLoad() {
  console.log('Widget loaded');
}

function onWidgetError(error) {
  console.error('Widget error:', error);
}
</script>
```

---

## Composable Hook

```typescript
// composables/useDotPassport.ts
import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

export function useDotPassport(config: Ref<WidgetConfig>) {
  const container = ref<HTMLElement | null>(null);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  let widget: ReturnType<typeof createWidget> | null = null;

  onMounted(() => {
    if (container.value) {
      widget = createWidget({
        ...config.value,
        onLoad: () => {
          isLoading.value = false;
        },
        onError: (err) => {
          error.value = err;
          isLoading.value = false;
        }
      });
      widget.mount(container.value);
    }
  });

  onUnmounted(() => {
    widget?.destroy();
  });

  watch(config, (newConfig) => {
    widget?.update(newConfig);
  }, { deep: true });

  const refresh = async () => {
    isLoading.value = true;
    await widget?.refresh();
    isLoading.value = false;
  };

  return {
    container,
    isLoading,
    error,
    refresh
  };
}
```

### Usage

```vue
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div ref="container"></div>
    <button @click="refresh">Refresh</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDotPassport } from './composables/useDotPassport';

const props = defineProps(['address', 'theme']);

const config = computed(() => ({
  apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
  address: props.address,
  type: 'reputation',
  theme: props.theme
}));

const { container, isLoading, error, refresh } = useDotPassport(config);
</script>
```

---

## Multiple Widgets

```vue
<template>
  <div class="dashboard">
    <div ref="reputationContainer" class="widget"></div>
    <div ref="badgeContainer" class="widget"></div>
    <div ref="profileContainer" class="widget"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget } from '@dotpassport/sdk';

const props = defineProps<{ address: string }>();

const reputationContainer = ref<HTMLElement | null>(null);
const badgeContainer = ref<HTMLElement | null>(null);
const profileContainer = ref<HTMLElement | null>(null);

const widgets: ReturnType<typeof createWidget>[] = [];

onMounted(() => {
  const apiKey = import.meta.env.VITE_DOTPASSPORT_API_KEY;

  if (reputationContainer.value) {
    const w = createWidget({ apiKey, address: props.address, type: 'reputation' });
    w.mount(reputationContainer.value);
    widgets.push(w);
  }

  if (badgeContainer.value) {
    const w = createWidget({ apiKey, address: props.address, type: 'badge' });
    w.mount(badgeContainer.value);
    widgets.push(w);
  }

  if (profileContainer.value) {
    const w = createWidget({ apiKey, address: props.address, type: 'profile' });
    w.mount(profileContainer.value);
    widgets.push(w);
  }
});

onUnmounted(() => {
  widgets.forEach(w => w.destroy());
});

watch(() => props.address, (newAddress) => {
  widgets.forEach(w => w.update({ address: newAddress }));
});
</script>
```

---

## With Pinia Store

```typescript
// stores/wallet.ts
import { defineStore } from 'pinia';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    address: null as string | null,
    isConnected: false
  }),
  actions: {
    connect(address: string) {
      this.address = address;
      this.isConnected = true;
    },
    disconnect() {
      this.address = null;
      this.isConnected = false;
    }
  }
});
```

```vue
<template>
  <div v-if="walletStore.isConnected">
    <div ref="container"></div>
  </div>
  <button v-else @click="connectWallet">Connect Wallet</button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useWalletStore } from './stores/wallet';
import { createWidget } from '@dotpassport/sdk';

const walletStore = useWalletStore();
const container = ref(null);
let widget = null;

watch(() => walletStore.address, (newAddress) => {
  if (newAddress && container.value) {
    if (widget) {
      widget.update({ address: newAddress });
    } else {
      widget = createWidget({
        apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
        address: newAddress,
        type: 'reputation'
      });
      widget.mount(container.value);
    }
  }
}, { immediate: true });

onUnmounted(() => {
  widget?.destroy();
});

async function connectWallet() {
  // Wallet connection logic
  const address = await getWalletAddress();
  walletStore.connect(address);
}
</script>
```

---

## Nuxt 3 Integration

```vue
<!-- components/DotPassportWidget.client.vue -->
<template>
  <div ref="container"></div>
</template>

<script setup>
const props = defineProps(['address', 'type', 'theme']);
const container = ref(null);
let widget = null;

onMounted(async () => {
  const { createWidget } = await import('@dotpassport/sdk');
  const config = useRuntimeConfig();

  widget = createWidget({
    apiKey: config.public.dotpassportApiKey,
    address: props.address,
    type: props.type || 'reputation',
    theme: props.theme || 'light'
  });

  widget.mount(container.value);
});

onUnmounted(() => {
  widget?.destroy();
});
</script>
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      dotpassportApiKey: process.env.DOTPASSPORT_API_KEY
    }
  }
});
```

---

## Related

- [React Integration](./react.md)
- [Svelte Integration](./svelte.md)
- [Vanilla JavaScript](./vanilla-js.md)
- [Widget Lifecycle](../widgets/lifecycle.md)
