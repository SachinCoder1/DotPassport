# Svelte Integration

Integrate DotPassport widgets with Svelte.

## Installation

```bash
npm install @dotpassport/sdk
```

---

## Basic Component

```svelte
<!-- DotPassportWidget.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

  export let address: string;
  export let type: WidgetConfig['type'] = 'reputation';
  export let theme: 'light' | 'dark' | 'auto' = 'light';

  let container: HTMLDivElement;
  let widget: ReturnType<typeof createWidget>;

  onMount(() => {
    widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address,
      type,
      theme
    });
    widget.mount(container);
  });

  onDestroy(() => {
    widget?.destroy();
  });

  // Reactive updates
  $: if (widget) {
    widget.update({ address, theme });
  }
</script>

<div bind:this={container}></div>
```

### Usage

```svelte
<script>
  import DotPassportWidget from './DotPassportWidget.svelte';

  let address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  let theme = 'light';
</script>

<DotPassportWidget {address} type="reputation" {theme} />

<button on:click={() => theme = theme === 'light' ? 'dark' : 'light'}>
  Toggle Theme
</button>
```

---

## Reputation Widget Component

```svelte
<!-- ReputationWidget.svelte -->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { createWidget } from '@dotpassport/sdk';

  export let address: string;
  export let theme: 'light' | 'dark' | 'auto' = 'light';
  export let showCategories: boolean = true;
  export let maxCategories: number = 6;
  export let compact: boolean = false;

  const dispatch = createEventDispatcher<{
    load: void;
    error: Error;
  }>();

  let container: HTMLDivElement;
  let widget: ReturnType<typeof createWidget>;

  onMount(() => {
    widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address,
      type: 'reputation',
      theme,
      showCategories,
      maxCategories,
      compact,
      onLoad: () => dispatch('load'),
      onError: (error) => dispatch('error', error)
    });
    widget.mount(container);
  });

  onDestroy(() => {
    widget?.destroy();
  });

  $: if (widget) {
    widget.update({ address, theme, showCategories });
  }

  export function refresh() {
    return widget?.refresh();
  }
</script>

<div bind:this={container} class="reputation-widget"></div>

<style>
  .reputation-widget {
    width: 100%;
  }
</style>
```

### Usage

```svelte
<script>
  import ReputationWidget from './ReputationWidget.svelte';

  let widgetRef;
  let address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  function handleLoad() {
    console.log('Widget loaded!');
  }

  function handleError(event) {
    console.error('Widget error:', event.detail);
  }
</script>

<ReputationWidget
  bind:this={widgetRef}
  {address}
  theme="dark"
  showCategories={true}
  on:load={handleLoad}
  on:error={handleError}
/>

<button on:click={() => widgetRef.refresh()}>Refresh</button>
```

---

## Badge Widget Component

```svelte
<!-- BadgeWidget.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createWidget } from '@dotpassport/sdk';

  export let address: string;
  export let theme: 'light' | 'dark' | 'auto' = 'light';
  export let maxBadges: number = 10;
  export let showProgress: boolean = true;
  export let badgeKey: string | undefined = undefined;

  let container: HTMLDivElement;
  let widget: ReturnType<typeof createWidget>;

  onMount(() => {
    widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address,
      type: 'badge',
      theme,
      maxBadges,
      showProgress,
      badgeKey
    });
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

---

## Svelte Store Integration

```typescript
// stores/wallet.ts
import { writable, derived } from 'svelte/store';

export const walletAddress = writable<string | null>(null);
export const isConnected = derived(walletAddress, $addr => $addr !== null);

export function connectWallet(address: string) {
  walletAddress.set(address);
}

export function disconnectWallet() {
  walletAddress.set(null);
}
```

```svelte
<!-- App.svelte -->
<script>
  import { walletAddress, isConnected, connectWallet } from './stores/wallet';
  import DotPassportWidget from './DotPassportWidget.svelte';

  async function handleConnect() {
    // Get address from wallet
    const address = await getWalletAddress();
    connectWallet(address);
  }
</script>

{#if $isConnected}
  <DotPassportWidget address={$walletAddress} type="reputation" />
{:else}
  <button on:click={handleConnect}>Connect Wallet</button>
{/if}
```

---

## Dashboard with Multiple Widgets

```svelte
<!-- Dashboard.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createWidget } from '@dotpassport/sdk';

  export let address: string;

  let reputationContainer: HTMLDivElement;
  let badgeContainer: HTMLDivElement;
  let profileContainer: HTMLDivElement;

  let widgets: ReturnType<typeof createWidget>[] = [];

  onMount(() => {
    const apiKey = import.meta.env.VITE_DOTPASSPORT_API_KEY;

    widgets = [
      createWidget({ apiKey, address, type: 'reputation' }),
      createWidget({ apiKey, address, type: 'badge', maxBadges: 4 }),
      createWidget({ apiKey, address, type: 'profile' })
    ];

    widgets[0].mount(reputationContainer);
    widgets[1].mount(badgeContainer);
    widgets[2].mount(profileContainer);
  });

  onDestroy(() => {
    widgets.forEach(w => w.destroy());
  });

  $: if (widgets.length > 0) {
    widgets.forEach(w => w.update({ address }));
  }

  function refreshAll() {
    widgets.forEach(w => w.refresh());
  }
</script>

<div class="dashboard">
  <div class="widget-grid">
    <div bind:this={reputationContainer} class="widget"></div>
    <div bind:this={badgeContainer} class="widget"></div>
    <div bind:this={profileContainer} class="widget"></div>
  </div>
  <button on:click={refreshAll}>Refresh All</button>
</div>

<style>
  .dashboard {
    padding: 1rem;
  }

  .widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .widget {
    min-height: 200px;
  }
</style>
```

---

## SvelteKit Integration

```svelte
<!-- routes/profile/[address]/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { createWidget } from '@dotpassport/sdk';
  import { PUBLIC_DOTPASSPORT_API_KEY } from '$env/static/public';

  let container: HTMLDivElement;
  let widget: ReturnType<typeof createWidget>;

  onMount(() => {
    widget = createWidget({
      apiKey: PUBLIC_DOTPASSPORT_API_KEY,
      address: $page.params.address,
      type: 'reputation'
    });
    widget.mount(container);
  });

  onDestroy(() => {
    widget?.destroy();
  });

  // Update when route changes
  $: if (widget && $page.params.address) {
    widget.update({ address: $page.params.address });
  }
</script>

<h1>Profile: {$page.params.address}</h1>
<div bind:this={container}></div>
```

```typescript
// .env
PUBLIC_DOTPASSPORT_API_KEY=your_api_key
```

---

## Theme Toggle with Svelte

```svelte
<script>
  import { writable } from 'svelte/store';
  import DotPassportWidget from './DotPassportWidget.svelte';

  const theme = writable('light');

  function toggleTheme() {
    theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  // Sync with system preference
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    theme.set(prefersDark.matches ? 'dark' : 'light');

    prefersDark.addEventListener('change', (e) => {
      theme.set(e.matches ? 'dark' : 'light');
    });
  }
</script>

<button on:click={toggleTheme}>
  {$theme === 'light' ? '🌙' : '☀️'} Toggle Theme
</button>

<DotPassportWidget
  address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
  theme={$theme}
/>
```

---

## Related

- [React Integration](./react.md)
- [Vue Integration](./vue.md)
- [Vanilla JavaScript](./vanilla-js.md)
- [Widget Lifecycle](../widgets/lifecycle.md)
