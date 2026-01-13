# React Integration

Integrate DotPassport widgets into React applications.

## Installation

```bash
npm install @dotpassport/sdk
```

## Basic Component

Create a reusable widget component:

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
```

## Usage

```tsx
import { DotPassportWidget } from './components/DotPassportWidget';

function App() {
  return (
    <DotPassportWidget
      apiKey={process.env.REACT_APP_DOTPASSPORT_API_KEY!}
      address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      type="reputation"
    />
  );
}
```

## Dynamic Updates

```tsx
import { useState } from 'react';
import { DotPassportWidget } from './components/DotPassportWidget';

function UserProfile({ address }: { address: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>

      <DotPassportWidget
        apiKey={process.env.REACT_APP_DOTPASSPORT_API_KEY!}
        address={address}
        type="reputation"
        theme={theme}
      />
    </div>
  );
}
```

## Multiple Widgets

```tsx
function Dashboard({ address }: { address: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DotPassportWidget
        apiKey={apiKey}
        address={address}
        type="reputation"
      />

      <DotPassportWidget
        apiKey={apiKey}
        address={address}
        type="badges"
      />

      <DotPassportWidget
        apiKey={apiKey}
        address={address}
        type="profile"
      />
    </div>
  );
}
```

## Next Steps

- [Vue Integration](./vue.md)
- [Widget Configuration](../widgets/overview.md)
- [Error Handling](../api-client/error-handling.md)
