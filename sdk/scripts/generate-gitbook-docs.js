#!/usr/bin/env node

/**
 * Script to generate GitBook documentation structure
 * Converts comprehensive docs into smaller, focused GitBook pages
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

// Ensure all directories exist
const dirs = [
  'getting-started',
  'api-client',
  'widgets',
  'frameworks',
  'advanced',
  'examples',
  'resources'
];

dirs.forEach(dir => {
  const dirPath = path.join(docsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Define all documentation pages to generate
const pages = {
  // API Client pages
  'api-client/overview.md': `# API Client Overview

The DotPassportClient provides programmatic access to all DotPassport API endpoints.

## Features

- **Full API Coverage** - Access all endpoints
- **TypeScript-First** - Complete type safety
- **Automatic Error Handling** - Structured error responses
- **Rate Limit Aware** - Built-in rate limit tracking

## Available Methods

### Profile Methods
- \`getProfile(address)\` - Get user profile

### Scores Methods
- \`getScores(address)\` - Get all scores
- \`getCategoryScore(address, categoryKey)\` - Get specific category

### Badges Methods
- \`getBadges(address)\` - Get all badges
- \`getBadge(address, badgeKey)\` - Get specific badge

### Metadata Methods
- \`getBadgeDefinitions()\` - Get all badge definitions
- \`getCategoryDefinitions()\` - Get all category definitions

## Next Steps

- [Initialization](./initialization.md) - Set up the client
- [Profile Methods](./profile.md) - Fetch user profiles
- [Scores Methods](./scores.md) - Get reputation scores
- [Badges Methods](./badges.md) - Retrieve badges
`,

  'api-client/initialization.md': `# Client Initialization

Learn how to initialize the DotPassportClient.

## Basic Initialization

\`\`\`typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here'
});
\`\`\`

## Configuration Options

\`\`\`typescript
interface DotPassportConfig {
  apiKey: string;      // Required: Your API key
  baseUrl?: string;    // Optional: API base URL
}
\`\`\`

### API Key

Your authentication key. Get it from the [developer dashboard](https://dotpassport.com/developers).

\`\`\`typescript
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});
\`\`\`

### Base URL

Override the default API URL (useful for testing):

\`\`\`typescript
const client = new DotPassportClient({
  apiKey: 'test_key',
  baseUrl: 'https://api-staging.dotpassport.com'
});
\`\`\`

## Environment-Specific Setup

### Development

\`\`\`typescript
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_TEST_KEY!,
  baseUrl: 'https://api-staging.dotpassport.com'
});
\`\`\`

### Production

\`\`\`typescript
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_LIVE_KEY!
});
\`\`\`

## Singleton Pattern

Create a single instance for your entire application:

\`\`\`typescript
// lib/dotpassport.ts
import { DotPassportClient } from '@dotpassport/sdk';

export const dotpassport = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});

// Usage in other files
import { dotpassport } from './lib/dotpassport';

const scores = await dotpassport.getScores(address);
\`\`\`

## Next Steps

- [Profile Methods](./profile.md)
- [Scores Methods](./scores.md)
- [Error Handling](./error-handling.md)
`,

  'api-client/profile.md': `# Profile Methods

Retrieve user profile information.

## getProfile()

Get a user's complete profile.

\`\`\`typescript
async getProfile(address: string): Promise<UserProfile>
\`\`\`

### Parameters

- **address** (string): Polkadot address of the user

### Returns

\`UserProfile\` object containing:

\`\`\`typescript
interface UserProfile {
  address: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  identities: Identity[];
  socials: {
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
    email?: string;
    website?: string;
  };
  joinedAt: string;
  updatedAt: string;
}
\`\`\`

### Example

\`\`\`typescript
const profile = await client.getProfile(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(profile.displayName);  // "Alice"
console.log(profile.bio);          // "Polkadot enthusiast"
console.log(profile.socials.twitter); // "@alice_dot"
\`\`\`

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 404 | User not found | Address has no profile |
| 401 | Invalid API key | API key is invalid |

## Identity Type

\`\`\`typescript
interface Identity {
  chain: string;      // "polkadot", "kusama", etc.
  address: string;
  displayName?: string;
  verified: boolean;
}
\`\`\`

## Complete Example

\`\`\`typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});

async function displayUserProfile(address: string) {
  try {
    const profile = await client.getProfile(address);

    console.log(\`👤 \${profile.displayName}\`);
    console.log(\`📍 \${profile.address}\`);

    if (profile.bio) {
      console.log(\`📝 \${profile.bio}\`);
    }

    if (profile.socials.twitter) {
      console.log(\`🐦 \${profile.socials.twitter}\`);
    }

    console.log(\`✅ Verified identities: \${profile.identities.filter(i => i.verified).length}\`);

  } catch (error) {
    if (error instanceof DotPassportError) {
      console.error(\`Error \${error.statusCode}: \${error.message}\`);
    }
  }
}
\`\`\`

## Next Steps

- [Scores Methods](./scores.md)
- [Badges Methods](./badges.md)
- [Error Handling](./error-handling.md)
`,

  'widgets/overview.md': `# Widgets Overview

Framework-agnostic embeddable widgets for displaying reputation data.

## Features

- **Framework-Agnostic** - Works with any framework or vanilla JS
- **Lightweight** - ~7KB gzipped per widget
- **Customizable** - Full theme and style support
- **Zero Dependencies** - Self-contained with inline styles

## Available Widgets

### Reputation Widget (Default)

Displays total reputation score with category breakdown.

[Learn more →](./reputation.md)

### Badge Widget

Shows badges earned by the user.

[Learn more →](./badge.md)

### Profile Widget

User profile card with social links.

[Learn more →](./profile.md)

### Category Widget

Detailed breakdown of a specific category.

[Learn more →](./category.md)

## Quick Start

\`\`\`html
<div id="reputation-widget"></div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  createWidget({
    apiKey: 'your-api-key',
    address: 'polkadot-address'
  }).mount('#reputation-widget');
</script>
\`\`\`

## Common Configuration

All widgets accept these options:

\`\`\`typescript
{
  apiKey: string;              // Required
  address: string;             // Required
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}
\`\`\`

## Next Steps

- [Reputation Widget](./reputation.md)
- [Badge Widget](./badge.md)
- [Lifecycle Methods](./lifecycle.md)
- [Theming](./theming.md)
`,

  'frameworks/react.md': `# React Integration

Integrate DotPassport widgets into React applications.

## Installation

\`\`\`bash
npm install @dotpassport/sdk
\`\`\`

## Basic Component

Create a reusable widget component:

\`\`\`tsx
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
\`\`\`

## Usage

\`\`\`tsx
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
\`\`\`

## Dynamic Updates

\`\`\`tsx
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
\`\`\`

## Multiple Widgets

\`\`\`tsx
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
\`\`\`

## Next Steps

- [Vue Integration](./vue.md)
- [Widget Configuration](../widgets/overview.md)
- [Error Handling](../api-client/error-handling.md)
`,

  'advanced/typescript.md': `# TypeScript Support

The SDK is written in TypeScript with complete type definitions.

## Type Imports

\`\`\`typescript
import type {
  // Client types
  DotPassportConfig,
  DotPassportError,

  // Data types
  UserProfile,
  UserScores,
  UserBadges,
  CategoryScore,

  // Widget types
  WidgetConfig,
  ReputationWidgetConfig,
  BadgeWidgetConfig,
  ProfileWidgetConfig,
  CategoryWidgetConfig,

  // Definition types
  BadgeDefinition,
  CategoryDefinition
} from '@dotpassport/sdk';
\`\`\`

## Type Safety

All methods are fully typed:

\`\`\`typescript
const scores: UserScores = await client.getScores(address);
const badges: UserBadges = await client.getBadges(address);

// TypeScript will catch type errors
scores.totalScore;        // ✅ number
scores.invalidProperty;   // ❌ TypeScript error
\`\`\`

## Generic Types

Client methods use generics for type inference:

\`\`\`typescript
// Type is inferred automatically
const profile = await client.getProfile(address);
profile.displayName; // TypeScript knows this is a string

// Or explicitly specify types
const scores = await client.getScores<UserScores>(address);
\`\`\`

## Widget Types

\`\`\`typescript
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

const config: WidgetConfig = {
  apiKey: 'key',
  address: 'address',
  type: 'reputation'
};

const widget = createWidget(config);
\`\`\`

## Custom Type Guards

\`\`\`typescript
import { DotPassportError } from '@dotpassport/sdk';

function isDotPassportError(error: unknown): error is DotPassportError {
  return error instanceof DotPassportError;
}

try {
  await client.getScores(address);
} catch (error) {
  if (isDotPassportError(error)) {
    console.log(error.statusCode, error.message);
  }
}
\`\`\`

## Next Steps

- [API Reference](../api-reference.md)
- [Error Handling](../api-client/error-handling.md)
`,

  'resources/faq.md': `# Frequently Asked Questions

Common questions about DotPassport SDK.

## General

### What is DotPassport?

DotPassport is a reputation system for the Polkadot ecosystem that tracks user activity and achievements across the network.

### Is it free to use?

Yes, the SDK is free and open source (MIT license). API usage has rate limits based on your tier.

## API Keys

### How do I get an API key?

Sign up at [dotpassport.com/developers](https://dotpassport.com/developers) and generate a key from your dashboard.

### Can I use the same key for development and production?

No, use test keys (\`test_*\`) for development and live keys (\`live_*\`) for production.

### What happens if my API key is exposed?

Revoke it immediately in your dashboard and generate a new one.

## Rate Limits

### What are the rate limits?

- **Free**: 100/hour, 1,000/day
- **Pro**: 1,000/hour, 10,000/day
- **Enterprise**: Custom limits

### How do I handle rate limits?

Implement caching, request throttling, or upgrade your tier. See [Rate Limiting](../api-client/rate-limiting.md).

## Widgets

### Can I customize widget styles?

Yes, widgets support CSS variable overrides. See [Theming](../widgets/theming.md).

### Do widgets work without a framework?

Yes, widgets are framework-agnostic and work with vanilla JavaScript.

### Can I use multiple widgets on one page?

Yes, you can mount multiple widgets. Each widget is independent.

## Troubleshooting

### Getting "User not found" error

The address may not exist in the system or has no reputation data yet.

### Widget not displaying

Check:
1. API key is valid
2. Address is correct
3. Container element exists
4. No console errors

### TypeScript errors

Make sure you have \`@types/node\` installed and TypeScript 5.0+.

## Support

Still have questions?

- [GitHub Issues](https://github.com/dotpassport/sdk/issues)
- [Discord Community](https://discord.gg/dotpassport)
- [Email Support](mailto:support@dotpassport.com)
`
};

// Write all pages
console.log('Generating GitBook documentation pages...\n');

let generated = 0;
let skipped = 0;

Object.entries(pages).forEach(([filename, content]) => {
  const filepath = path.join(docsDir, filename);
  const dir = path.dirname(filepath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Only write if file doesn't exist or is empty
  if (!fs.existsSync(filepath) || fs.readFileSync(filepath, 'utf8').trim() === '') {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Generated: ${filename}`);
    generated++;
  } else {
    console.log(`⏭️  Skipped: ${filename} (already exists)`);
    skipped++;
  }
});

console.log(`\n✨ Done! Generated ${generated} pages, skipped ${skipped} existing pages.`);
console.log('\nNext steps:');
console.log('1. Review the generated files');
console.log('2. Follow GITBOOK_SETUP.md to publish to GitBook');
console.log('3. Or run: npm run docs:serve (if GitBook CLI installed)');
