# Vanilla JavaScript Integration

Use DotPassport widgets with plain JavaScript - no framework required.

## Installation

### NPM

```bash
npm install @dotpassport/sdk
```

### CDN

```html
<script type="module">
  import { createWidget, DotPassportClient } from 'https://unpkg.com/@dotpassport/sdk/dist/index.js';
</script>
```

---

## Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>DotPassport Widget Demo</title>
</head>
<body>
  <div id="reputation-widget"></div>

  <script type="module">
    import { createWidget } from '@dotpassport/sdk';

    const widget = createWidget({
      apiKey: 'your_api_key',
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      type: 'reputation',
      theme: 'light'
    });

    widget.mount('#reputation-widget');
  </script>
</body>
</html>
```

---

## Complete HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DotPassport Demo</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .controls {
      margin-bottom: 1rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    input[type="text"] {
      flex: 1;
      min-width: 300px;
      padding: 0.5rem;
      font-size: 1rem;
      font-family: monospace;
    }

    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }

    #widget-container {
      min-height: 300px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
    }

    .dark {
      background: #1f2937;
      color: white;
    }
  </style>
</head>
<body>
  <h1>DotPassport Widget Demo</h1>

  <div class="controls">
    <input
      type="text"
      id="address-input"
      value="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      placeholder="Enter Polkadot address"
    />
    <button id="load-btn">Load</button>
    <button id="theme-btn">Toggle Theme</button>
    <button id="refresh-btn">Refresh</button>
  </div>

  <div id="widget-container"></div>

  <script type="module">
    import { createWidget } from '@dotpassport/sdk';

    const API_KEY = 'your_api_key';
    let currentTheme = 'light';
    let widget = null;

    // Initialize widget
    function initWidget(address) {
      // Destroy existing widget
      if (widget) {
        widget.destroy();
      }

      widget = createWidget({
        apiKey: API_KEY,
        address: address,
        type: 'reputation',
        theme: currentTheme,
        showCategories: true,
        onLoad: () => console.log('Widget loaded'),
        onError: (error) => console.error('Widget error:', error)
      });

      widget.mount('#widget-container');
    }

    // Load button
    document.getElementById('load-btn').addEventListener('click', () => {
      const address = document.getElementById('address-input').value.trim();
      if (address) {
        initWidget(address);
      }
    });

    // Theme toggle
    document.getElementById('theme-btn').addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.body.classList.toggle('dark', currentTheme === 'dark');

      if (widget) {
        widget.update({ theme: currentTheme });
      }
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
      if (widget) {
        widget.refresh();
      }
    });

    // Initialize on load
    const initialAddress = document.getElementById('address-input').value;
    initWidget(initialAddress);
  </script>
</body>
</html>
```

---

## API Client Usage

```html
<script type="module">
  import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

  const client = new DotPassportClient({
    apiKey: 'your_api_key'
  });

  async function loadUserData(address) {
    try {
      // Fetch all data in parallel
      const [profile, scores, badges] = await Promise.all([
        client.getProfile(address),
        client.getScores(address),
        client.getBadges(address)
      ]);

      // Display profile
      document.getElementById('display-name').textContent = profile.displayName || 'Anonymous';
      document.getElementById('bio').textContent = profile.bio || 'No bio';

      // Display scores
      document.getElementById('total-score').textContent = scores.totalScore;

      // Display categories
      const categoriesHtml = Object.entries(scores.categories)
        .map(([key, cat]) => `
          <div class="category">
            <span class="title">${cat.title}</span>
            <span class="score">${cat.score}</span>
          </div>
        `)
        .join('');
      document.getElementById('categories').innerHTML = categoriesHtml;

      // Display badges
      const badgesHtml = badges.badges
        .filter(b => b.earned)
        .map(badge => `
          <div class="badge ${badge.tier}">
            <span class="badge-icon">${badge.icon}</span>
            <span class="badge-title">${badge.title}</span>
          </div>
        `)
        .join('');
      document.getElementById('badges').innerHTML = badgesHtml;

    } catch (error) {
      if (error instanceof DotPassportError) {
        if (error.statusCode === 404) {
          document.getElementById('error').textContent = 'User not found';
        } else {
          document.getElementById('error').textContent = error.message;
        }
      }
    }
  }

  // Load on button click
  document.getElementById('load-btn').addEventListener('click', () => {
    const address = document.getElementById('address').value;
    loadUserData(address);
  });
</script>
```

---

## Multiple Widgets

```html
<div class="widget-grid">
  <div id="reputation-widget"></div>
  <div id="badge-widget"></div>
  <div id="profile-widget"></div>
</div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  const API_KEY = 'your_api_key';
  const ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  const widgets = [];

  // Create and mount widgets
  function initWidgets(address) {
    // Destroy existing
    widgets.forEach(w => w.destroy());
    widgets.length = 0;

    // Reputation widget
    const reputation = createWidget({
      apiKey: API_KEY,
      address,
      type: 'reputation',
      showCategories: true
    });
    reputation.mount('#reputation-widget');
    widgets.push(reputation);

    // Badge widget
    const badge = createWidget({
      apiKey: API_KEY,
      address,
      type: 'badge',
      maxBadges: 6
    });
    badge.mount('#badge-widget');
    widgets.push(badge);

    // Profile widget
    const profile = createWidget({
      apiKey: API_KEY,
      address,
      type: 'profile'
    });
    profile.mount('#profile-widget');
    widgets.push(profile);
  }

  // Update all widgets
  function updateAddress(newAddress) {
    widgets.forEach(w => w.update({ address: newAddress }));
  }

  // Refresh all widgets
  function refreshAll() {
    widgets.forEach(w => w.refresh());
  }

  // Cleanup
  window.addEventListener('beforeunload', () => {
    widgets.forEach(w => w.destroy());
  });

  // Initialize
  initWidgets(ADDRESS);
</script>
```

---

## Dynamic Widget Creation

```html
<select id="widget-type">
  <option value="reputation">Reputation</option>
  <option value="badge">Badges</option>
  <option value="profile">Profile</option>
  <option value="category">Category</option>
</select>

<select id="category-select" style="display: none;">
  <option value="longevity">Account Longevity</option>
  <option value="governance">Governance</option>
  <option value="identity">Identity</option>
</select>

<button id="create-btn">Create Widget</button>
<div id="widget-container"></div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  const API_KEY = 'your_api_key';
  const ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  let currentWidget = null;
  const typeSelect = document.getElementById('widget-type');
  const categorySelect = document.getElementById('category-select');

  // Show/hide category select based on widget type
  typeSelect.addEventListener('change', () => {
    categorySelect.style.display = typeSelect.value === 'category' ? 'block' : 'none';
  });

  // Create widget on button click
  document.getElementById('create-btn').addEventListener('click', () => {
    // Destroy existing
    if (currentWidget) {
      currentWidget.destroy();
    }

    const type = typeSelect.value;
    const config = {
      apiKey: API_KEY,
      address: ADDRESS,
      type: type
    };

    // Add category key for category widget
    if (type === 'category') {
      config.categoryKey = categorySelect.value;
    }

    currentWidget = createWidget(config);
    currentWidget.mount('#widget-container');
  });
</script>
```

---

## Event-Driven Architecture

```javascript
// widget-manager.js
class WidgetManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.widgets = new Map();
    this.events = new EventTarget();
  }

  create(id, options) {
    if (this.widgets.has(id)) {
      this.destroy(id);
    }

    const widget = createWidget({
      apiKey: this.apiKey,
      ...options,
      onLoad: () => {
        this.events.dispatchEvent(new CustomEvent('widgetLoad', { detail: { id } }));
      },
      onError: (error) => {
        this.events.dispatchEvent(new CustomEvent('widgetError', { detail: { id, error } }));
      }
    });

    this.widgets.set(id, widget);
    return widget;
  }

  mount(id, target) {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.mount(target);
    }
  }

  update(id, config) {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.update(config);
    }
  }

  updateAll(config) {
    this.widgets.forEach(widget => widget.update(config));
  }

  refresh(id) {
    const widget = this.widgets.get(id);
    if (widget) {
      return widget.refresh();
    }
  }

  refreshAll() {
    return Promise.all(
      Array.from(this.widgets.values()).map(w => w.refresh())
    );
  }

  destroy(id) {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.destroy();
      this.widgets.delete(id);
    }
  }

  destroyAll() {
    this.widgets.forEach(widget => widget.destroy());
    this.widgets.clear();
  }

  on(event, callback) {
    this.events.addEventListener(event, callback);
  }

  off(event, callback) {
    this.events.removeEventListener(event, callback);
  }
}

// Usage
const manager = new WidgetManager('your_api_key');

manager.on('widgetLoad', (e) => {
  console.log(`Widget ${e.detail.id} loaded`);
});

manager.on('widgetError', (e) => {
  console.error(`Widget ${e.detail.id} error:`, e.detail.error);
});

manager.create('main-reputation', {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

manager.mount('main-reputation', '#widget-container');
```

---

## Related

- [React Integration](./react.md)
- [Vue Integration](./vue.md)
- [Svelte Integration](./svelte.md)
- [Widget Lifecycle](../widgets/lifecycle.md)
