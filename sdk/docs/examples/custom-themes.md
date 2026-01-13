# Custom Theme Examples

Create custom themes to match your application's design.

## Using CSS Variables

Override the default theme with CSS custom properties:

```css
/* Custom purple theme */
.my-custom-theme {
  --dp-primary: #8b5cf6;
  --dp-primary-hover: #7c3aed;
  --dp-secondary: #ec4899;
  --dp-bg: #ffffff;
  --dp-bg-secondary: #f9fafb;
  --dp-text-primary: #111827;
  --dp-text-secondary: #6b7280;
  --dp-border: #e5e7eb;
  --dp-border-radius: 12px;
}
```

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  className: 'my-custom-theme'
});
```

---

## Complete Theme Examples

### Ocean Theme

```css
.dotpassport-ocean {
  --dp-primary: #0ea5e9;
  --dp-primary-hover: #0284c7;
  --dp-secondary: #06b6d4;
  --dp-bg: #f0f9ff;
  --dp-bg-secondary: #e0f2fe;
  --dp-bg-tertiary: #bae6fd;
  --dp-text-primary: #0c4a6e;
  --dp-text-secondary: #0369a1;
  --dp-text-muted: #7dd3fc;
  --dp-border: #7dd3fc;
  --dp-border-radius: 16px;
  --dp-shadow: 0 4px 14px -2px rgb(14 165 233 / 0.2);
}

.dotpassport-ocean.dp-theme-dark {
  --dp-bg: #0c4a6e;
  --dp-bg-secondary: #075985;
  --dp-bg-tertiary: #0369a1;
  --dp-text-primary: #f0f9ff;
  --dp-text-secondary: #bae6fd;
  --dp-border: #0369a1;
}
```

### Forest Theme

```css
.dotpassport-forest {
  --dp-primary: #22c55e;
  --dp-primary-hover: #16a34a;
  --dp-secondary: #10b981;
  --dp-bg: #f0fdf4;
  --dp-bg-secondary: #dcfce7;
  --dp-text-primary: #14532d;
  --dp-text-secondary: #166534;
  --dp-border: #86efac;
  --dp-border-radius: 8px;
}

.dotpassport-forest.dp-theme-dark {
  --dp-bg: #14532d;
  --dp-bg-secondary: #166534;
  --dp-text-primary: #f0fdf4;
  --dp-text-secondary: #bbf7d0;
  --dp-border: #166534;
}
```

### Sunset Theme

```css
.dotpassport-sunset {
  --dp-primary: #f97316;
  --dp-primary-hover: #ea580c;
  --dp-secondary: #fb923c;
  --dp-bg: #fffbeb;
  --dp-bg-secondary: #fef3c7;
  --dp-text-primary: #78350f;
  --dp-text-secondary: #92400e;
  --dp-border: #fcd34d;
  --dp-border-radius: 20px;
  --dp-shadow: 0 4px 14px -2px rgb(249 115 22 / 0.25);
}

.dotpassport-sunset.dp-theme-dark {
  --dp-bg: #78350f;
  --dp-bg-secondary: #92400e;
  --dp-text-primary: #fffbeb;
  --dp-text-secondary: #fde68a;
  --dp-border: #b45309;
}
```

---

## Brand-Matched Themes

### Polkadot Theme

```css
.dotpassport-polkadot {
  --dp-primary: #e6007a;
  --dp-primary-hover: #cc006d;
  --dp-secondary: #552bbf;
  --dp-bg: #ffffff;
  --dp-bg-secondary: #fdf2f8;
  --dp-text-primary: #1e1e1e;
  --dp-text-secondary: #4a4a4a;
  --dp-border: #fce7f3;
  --dp-border-radius: 12px;
}

.dotpassport-polkadot.dp-theme-dark {
  --dp-bg: #1a1a2e;
  --dp-bg-secondary: #16213e;
  --dp-text-primary: #ffffff;
  --dp-text-secondary: #e5e5e5;
  --dp-border: #e6007a33;
}
```

### Kusama Theme

```css
.dotpassport-kusama {
  --dp-primary: #000000;
  --dp-primary-hover: #333333;
  --dp-secondary: #e6007a;
  --dp-bg: #ffffff;
  --dp-bg-secondary: #f5f5f5;
  --dp-text-primary: #000000;
  --dp-text-secondary: #666666;
  --dp-border: #e5e5e5;
}

.dotpassport-kusama.dp-theme-dark {
  --dp-primary: #ffffff;
  --dp-primary-hover: #cccccc;
  --dp-bg: #000000;
  --dp-bg-secondary: #1a1a1a;
  --dp-text-primary: #ffffff;
  --dp-text-secondary: #999999;
  --dp-border: #333333;
}
```

---

## Dynamic Theme Switching

### JavaScript

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  theme: 'light',
  className: 'dotpassport-ocean'
});

widget.mount('#container');

// Toggle theme
function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.body.classList.toggle('dark', newTheme === 'dark');
  widget.update({ theme: newTheme });
}

// System preference listener
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  widget.update({ theme: e.matches ? 'dark' : 'light' });
});
```

### React

```tsx
import { useState, useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

function ThemedWidget({ address }: { address: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  // Detect system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(prefersDark.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);

  // Create widget
  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address,
      type: 'reputation',
      theme,
      className: 'dotpassport-ocean'
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address]);

  // Update theme
  useEffect(() => {
    widgetRef.current?.update({ theme });
  }, [theme]);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <div ref={containerRef} className="dotpassport-ocean" />
    </div>
  );
}
```

---

## Tailwind CSS Integration

```tsx
function TailwindWidget({ address }: { address: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widget = createWidget({
      apiKey: 'your_api_key',
      address,
      type: 'reputation'
    });

    widget.mount(containerRef.current);
    return () => widget.destroy();
  }, [address]);

  return (
    <div
      ref={containerRef}
      className="
        [--dp-primary:theme(colors.violet.500)]
        [--dp-primary-hover:theme(colors.violet.600)]
        [--dp-bg:theme(colors.slate.50)]
        [--dp-bg-secondary:theme(colors.slate.100)]
        [--dp-text-primary:theme(colors.slate.900)]
        [--dp-text-secondary:theme(colors.slate.600)]
        [--dp-border:theme(colors.slate.200)]
        dark:[--dp-bg:theme(colors.slate.900)]
        dark:[--dp-bg-secondary:theme(colors.slate.800)]
        dark:[--dp-text-primary:theme(colors.slate.100)]
        dark:[--dp-text-secondary:theme(colors.slate.400)]
        dark:[--dp-border:theme(colors.slate.700)]
      "
    />
  );
}
```

---

## Styled Components

```tsx
import styled from 'styled-components';

const WidgetContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  --dp-primary: ${props => props.theme.colors.primary};
  --dp-bg: ${props => props.$theme === 'dark'
    ? props.theme.colors.dark.bg
    : props.theme.colors.light.bg};
  --dp-text-primary: ${props => props.$theme === 'dark'
    ? props.theme.colors.dark.text
    : props.theme.colors.light.text};
  --dp-border-radius: ${props => props.theme.borderRadius}px;
`;

function StyledWidget({ address, theme }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widget = createWidget({
      apiKey: 'your_api_key',
      address,
      type: 'reputation'
    });

    widget.mount(containerRef.current);
    return () => widget.destroy();
  }, [address]);

  return <WidgetContainer ref={containerRef} $theme={theme} />;
}
```

---

## CSS Variables Reference

| Variable | Description | Default (Light) |
|----------|-------------|-----------------|
| `--dp-primary` | Primary accent color | `#8b5cf6` |
| `--dp-primary-hover` | Primary hover state | `#7c3aed` |
| `--dp-secondary` | Secondary accent | `#ec4899` |
| `--dp-bg` | Background color | `#ffffff` |
| `--dp-bg-secondary` | Secondary background | `#f9fafb` |
| `--dp-bg-tertiary` | Tertiary background | `#f3f4f6` |
| `--dp-text-primary` | Primary text color | `#111827` |
| `--dp-text-secondary` | Secondary text color | `#6b7280` |
| `--dp-text-muted` | Muted text color | `#9ca3af` |
| `--dp-border` | Border color | `#e5e7eb` |
| `--dp-border-focus` | Focus border color | `#8b5cf6` |
| `--dp-border-radius` | Border radius | `12px` |
| `--dp-border-radius-sm` | Small border radius | `8px` |
| `--dp-border-radius-lg` | Large border radius | `16px` |
| `--dp-shadow` | Box shadow | `0 4px 6px...` |
| `--dp-shadow-lg` | Large box shadow | `0 10px 15px...` |

---

## Related

- [Theming Documentation](../widgets/theming.md)
- [Basic Usage](./basic-usage.md)
- [React Integration](../frameworks/react.md)
