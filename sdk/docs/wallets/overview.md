# Wallet Integration Overview

This guide explains how to integrate DotPassport SDK with Polkadot wallet libraries to display reputation data for connected users.

## How It Works

DotPassport SDK needs a **Polkadot address** to fetch and display reputation data. Wallet libraries provide this address when users connect their wallets to your application.

```
User connects wallet → Get address from wallet → Pass address to DotPassport SDK
```

## Supported Wallets

| Wallet | Library | Guide |
|--------|---------|-------|
| Talisman | `@talismn/connect-wallets` | [Talisman Guide](./talisman.md) |
| SubWallet | `@subwallet/wallet-connect` | [SubWallet Guide](./subwallet.md) |
| Polkadot.js | `@polkadot/extension-dapp` | Compatible (similar pattern) |
| Nova Wallet | `@polkadot/extension-dapp` | Compatible (similar pattern) |

## Quick Start Pattern

All wallet integrations follow this basic pattern:

```typescript
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

// 1. Connect wallet and get address (wallet-specific code)
const address = await connectWalletAndGetAddress();

// 2. Use with DotPassport API Client
const client = new DotPassportClient({ apiKey: 'your_key' });
const scores = await client.getScores(address);
console.log(`Reputation Score: ${scores.totalScore}`);

// 3. Or use with DotPassport Widgets
const widget = createWidget({
  apiKey: 'your_key',
  address: address,
  type: 'reputation'
});
widget.mount('#reputation-widget');

// 4. Handle address changes (when user switches accounts)
function onAddressChange(newAddress: string) {
  widget.update({ address: newAddress });
}
```

## Address Format

DotPassport accepts standard Polkadot/Substrate addresses:

```typescript
// SS58 format (most common)
const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// All these formats work
'5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'  // Polkadot
'5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'  // Generic
```

## Common Integration Patterns

### React Hook Pattern

```typescript
import { useState, useEffect } from 'react';
import { createWidget } from '@dotpassport/sdk';

function useDotPassportWidget(address: string | null) {
  const [widget, setWidget] = useState<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!address) return;

    const w = createWidget({
      apiKey: 'your_key',
      address: address,
      type: 'reputation'
    });

    setWidget(w);
    return () => w.destroy();
  }, []);

  // Update widget when address changes
  useEffect(() => {
    if (widget && address) {
      widget.update({ address });
    }
  }, [address, widget]);

  return widget;
}
```

### Event-Driven Pattern

```typescript
// Listen for wallet events
wallet.on('accountsChanged', (accounts) => {
  const newAddress = accounts[0]?.address;
  if (newAddress) {
    widget.update({ address: newAddress });
  }
});

wallet.on('disconnect', () => {
  widget.destroy();
});
```

## Error Handling

Always handle these common scenarios:

```typescript
try {
  // Connect wallet
  const accounts = await wallet.getAccounts();

  if (accounts.length === 0) {
    console.log('No accounts available');
    return;
  }

  const address = accounts[0].address;

  // Use with DotPassport
  const widget = createWidget({
    apiKey: 'your_key',
    address: address,
    type: 'reputation',
    onError: (error) => {
      console.error('Widget error:', error);
      // Show fallback UI
    }
  });

  widget.mount('#widget');

} catch (error) {
  if (error.message.includes('User rejected')) {
    console.log('User rejected wallet connection');
  } else if (error.message.includes('not installed')) {
    console.log('Wallet extension not installed');
  } else {
    console.error('Connection error:', error);
  }
}
```

## Best Practices

### 1. Validate Addresses

```typescript
function isValidSubstrateAddress(address: string): boolean {
  // Basic validation - starts with valid prefix and correct length
  return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
}
```

### 2. Cache Wisely

DotPassport SDK has built-in caching. When the address changes, the widget automatically fetches new data.

```typescript
// Widget handles caching automatically
widget.update({ address: newAddress }); // Fetches new data

// Force refresh if needed
widget.refresh({ forceRefresh: true });
```

### 3. Clean Up on Disconnect

```typescript
function handleDisconnect() {
  widget?.destroy();
  client?.clearCacheForAddress(address);
}
```

### 4. Show Loading States

```typescript
const widget = createWidget({
  apiKey: 'your_key',
  address: address,
  type: 'reputation',
  onLoad: () => {
    document.getElementById('loading')?.remove();
  },
  onError: (error) => {
    document.getElementById('widget-container').innerHTML =
      '<p>Unable to load reputation data</p>';
  }
});
```

## Next Steps

- [Talisman Integration Guide](./talisman.md) - Complete Talisman wallet integration
- [SubWallet Integration Guide](./subwallet.md) - Complete SubWallet integration
- [API Reference](../api-reference.md) - Full API documentation
- [Widget Guide](../widgets.md) - Widget customization options
