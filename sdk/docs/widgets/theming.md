# Theming & Customization

Customize the appearance of DotPassport widgets.

## Theme Options

All widgets support three theme modes:

| Theme | Description |
|-------|-------------|
| `'light'` | Light color scheme (default) |
| `'dark'` | Dark color scheme |
| `'auto'` | Follows system preference |

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  theme: 'dark' // 'light' | 'dark' | 'auto'
});
```

---

## CSS Variables

Widgets use CSS custom properties that you can override:

### Core Colors

```css
.my-custom-widget {
  /* Primary accent color */
  --dp-primary: #8b5cf6;
  --dp-primary-hover: #7c3aed;

  /* Secondary accent */
  --dp-secondary: #ec4899;

  /* Background colors */
  --dp-bg: #ffffff;
  --dp-bg-secondary: #f9fafb;
  --dp-bg-tertiary: #f3f4f6;

  /* Text colors */
  --dp-text-primary: #111827;
  --dp-text-secondary: #6b7280;
  --dp-text-muted: #9ca3af;

  /* Border colors */
  --dp-border: #e5e7eb;
  --dp-border-focus: #8b5cf6;
}
```

### Layout & Styling

```css
.my-custom-widget {
  /* Border radius */
  --dp-border-radius: 12px;
  --dp-border-radius-sm: 8px;
  --dp-border-radius-lg: 16px;

  /* Shadows */
  --dp-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --dp-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Spacing */
  --dp-spacing-xs: 4px;
  --dp-spacing-sm: 8px;
  --dp-spacing-md: 16px;
  --dp-spacing-lg: 24px;

  /* Font sizes */
  --dp-font-size-xs: 12px;
  --dp-font-size-sm: 14px;
  --dp-font-size-base: 16px;
  --dp-font-size-lg: 18px;
  --dp-font-size-xl: 24px;
}
```

---

## Dark Theme Overrides

```css
.my-custom-widget.dp-theme-dark {
  --dp-bg: #1f2937;
  --dp-bg-secondary: #374151;
  --dp-bg-tertiary: #4b5563;
  --dp-text-primary: #f9fafb;
  --dp-text-secondary: #d1d5db;
  --dp-text-muted: #9ca3af;
  --dp-border: #4b5563;
}
```

---

## Complete Custom Theme

### Light Theme

```css
/* Custom purple theme */
.dotpassport-purple {
  --dp-primary: #7c3aed;
  --dp-primary-hover: #6d28d9;
  --dp-secondary: #a78bfa;
  --dp-bg: #faf5ff;
  --dp-bg-secondary: #f3e8ff;
  --dp-text-primary: #4c1d95;
  --dp-text-secondary: #6b21a8;
  --dp-border: #ddd6fe;
  --dp-border-radius: 16px;
  --dp-shadow: 0 4px 14px -2px rgb(124 58 237 / 0.25);
}
```

### Dark Theme

```css
.dotpassport-purple.dp-theme-dark {
  --dp-bg: #2e1065;
  --dp-bg-secondary: #3b0764;
  --dp-text-primary: #f5f3ff;
  --dp-text-secondary: #ddd6fe;
  --dp-border: #4c1d95;
}
```

### Usage

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  className: 'dotpassport-purple'
});
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
  --dp-border: #fce7f3;
}

.dotpassport-polkadot.dp-theme-dark {
  --dp-bg: #1a1a2e;
  --dp-bg-secondary: #16213e;
  --dp-border: #e6007a33;
}
```

### Kusama Theme

```css
.dotpassport-kusama {
  --dp-primary: #000000;
  --dp-secondary: #e6007a;
  --dp-bg: #ffffff;
  --dp-bg-secondary: #f5f5f5;
  --dp-border: #e5e5e5;
}

.dotpassport-kusama.dp-theme-dark {
  --dp-primary: #ffffff;
  --dp-bg: #000000;
  --dp-bg-secondary: #1a1a1a;
  --dp-text-primary: #ffffff;
  --dp-border: #333333;
}
```

---

## Responsive Customization

```css
/* Mobile adjustments */
@media (max-width: 640px) {
  .my-custom-widget {
    --dp-spacing-md: 12px;
    --dp-font-size-base: 14px;
    --dp-border-radius: 8px;
  }
}

/* Large screens */
@media (min-width: 1024px) {
  .my-custom-widget {
    --dp-spacing-lg: 32px;
    --dp-font-size-xl: 28px;
  }
}
```

---

## Dynamic Theme Switching

### JavaScript

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  theme: 'light'
});

widget.mount('#container');

// Theme toggle
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  widget.update({ theme: newTheme });
  localStorage.setItem('theme', newTheme);
}

// System preference listener
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  if (localStorage.getItem('theme') === null) {
    widget.update({ theme: e.matches ? 'dark' : 'light' });
  }
});
```

### React

```tsx
import { useState, useEffect } from 'react';

function ThemedWidget({ address }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: 'your_api_key',
      address,
      type: 'reputation',
      theme
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address]);

  useEffect(() => {
    widgetRef.current?.update({ theme });
  }, [theme]);

  return (
    <div>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <div ref={containerRef} />
    </div>
  );
}
```

---

## Compact Mode

Use `compact: true` for smaller widget displays:

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  compact: true
});
```

### Compact Mode CSS Adjustments

```css
.my-compact-widget {
  --dp-spacing-md: 8px;
  --dp-font-size-base: 13px;
  --dp-border-radius: 6px;
}
```

---

## CSS-in-JS Integration

### Styled Components

```tsx
import styled from 'styled-components';

const WidgetContainer = styled.div`
  --dp-primary: ${props => props.theme.primary};
  --dp-bg: ${props => props.theme.background};
  --dp-text-primary: ${props => props.theme.text};
  --dp-border-radius: ${props => props.theme.borderRadius}px;
`;

function StyledWidget({ address }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = createWidget({
      apiKey: 'your_api_key',
      address,
      type: 'reputation'
    });
    widget.mount(containerRef.current);
    return () => widget.destroy();
  }, [address]);

  return <WidgetContainer ref={containerRef} />;
}
```

### Tailwind CSS

```tsx
function TailwindWidget({ address }) {
  return (
    <div
      ref={containerRef}
      className="[--dp-primary:theme(colors.purple.500)] [--dp-bg:theme(colors.gray.50)] dark:[--dp-bg:theme(colors.gray.900)]"
    />
  );
}
```

---

## Related

- [Reputation Widget](./reputation.md)
- [Badge Widget](./badge.md)
- [Profile Widget](./profile.md)
- [Category Widget](./category.md)
- [Lifecycle Methods](./lifecycle.md)
