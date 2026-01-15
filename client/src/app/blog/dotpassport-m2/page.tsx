export default function BlogDotPassportMilestone2() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <article className="mx-auto w-full max-w-3xl px-5 py-14">
        {/* Header */}
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            DotPassport · Milestone 2
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-slate-900">
            Developer SDK, Widgets & Sandbox Platform
          </h1>
          <p className="mt-4 text-slate-600">
            A comprehensive toolkit for integrating Polkadot identity and
            reputation into your dApps. TypeScript SDK, embeddable widgets, REST
            API v2, and an interactive sandbox for developers.
          </p>
        </header>

        {/* Key Outcomes */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Milestone 2 — Outcomes
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>TypeScript SDK:</strong> Published to NPM as{" "}
              <a
                className="underline decoration-slate-300 hover:decoration-slate-700"
                href="https://www.npmjs.com/package/@dotpassport/sdk"
                target="_blank"
                rel="noreferrer"
              >
                @dotpassport/sdk
              </a>{" "}
              with 7 API methods for profiles, scores, and badges.
            </li>
            <li>
              <strong>REST API v2:</strong> 7 public endpoints with API key
              authentication, tiered rate limiting, and request logging.
            </li>
            <li>
              <strong>4 Embeddable Widgets:</strong> Profile, Reputation, Badge,
              and Category widgets with light/dark themes and CSS customization.
            </li>
            <li>
              <strong>Developer Sandbox:</strong> Interactive testing platform
              at{" "}
              <a
                className="underline decoration-slate-300 hover:decoration-slate-700"
                href="https://sandbox.dotpassport.io"
                target="_blank"
                rel="noreferrer"
              >
                sandbox.dotpassport.io
              </a>{" "}
              for API testing and widget preview.
            </li>
            <li>
              <strong>Wallet Integration:</strong> Support for Talisman,
              SubWallet, and Polkadot.js Extension with challenge-response
              authentication.
            </li>
            <li>
              <strong>Documentation:</strong> 44+ markdown files at{" "}
              <a
                className="underline decoration-slate-300 hover:decoration-slate-700"
                href="https://docs.dotpassport.io"
                target="_blank"
                rel="noreferrer"
              >
                docs.dotpassport.io
              </a>{" "}
              covering SDK, widgets, and framework guides.
            </li>
            <li>
              <strong>Test Coverage:</strong> 27 test files with 303+ passing
              tests across backend and SDK.
            </li>
          </ul>
        </section>

        {/* SDK Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            TypeScript SDK — @dotpassport/sdk
          </h2>
          <p className="mt-4 text-slate-700">
            The DotPassport SDK provides a simple, type-safe way to integrate
            Polkadot identity and reputation data into any JavaScript or
            TypeScript application. Install it from NPM and start querying
            on-chain reputation in minutes.
          </p>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800">Installation</h3>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
              {`npm install @dotpassport/sdk`}
            </pre>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800">Quick Start</h3>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
              {`import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'your-api-key',
});

// Get user profile with scores and badges
const profile = await client.getProfile('5GrwvaEF...');

// Get detailed reputation scores
const scores = await client.getScores('5GrwvaEF...');

// Get earned badges
const badges = await client.getBadges('5GrwvaEF...');`}
            </pre>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                7 API Methods
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>
                  <code className="rounded bg-slate-100 px-1">getProfile()</code>{" "}
                  — Full user profile
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">getScores()</code>{" "}
                  — All reputation scores
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">
                    getCategoryScore()
                  </code>{" "}
                  — Single category
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">getBadges()</code>{" "}
                  — Earned badges
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">getBadge()</code> —
                  Specific badge
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">
                    getBadgeDefinitions()
                  </code>
                </li>
                <li>
                  <code className="rounded bg-slate-100 px-1">
                    getCategoryDefinitions()
                  </code>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Features</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>TypeScript-first with full type definitions</li>
                <li>Built-in 5-minute response caching</li>
                <li>AbortSignal support for request cancellation</li>
                <li>Standardized error handling</li>
                <li>Tree-shakeable widget exports</li>
                <li>Environment configuration support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* REST API Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">REST API v2</h2>
          <p className="mt-4 text-slate-700">
            The Developer API provides direct HTTP access to DotPassport data.
            Authenticate with your API key and query any Polkadot address for
            reputation scores and badges.
          </p>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800">
              API Endpoints
            </h3>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
              {`# Authentication: X-API-Key header required

GET /api/v2/profiles/:address         # Full profile with scores & badges
GET /api/v2/scores/:address           # All reputation scores
GET /api/v2/scores/:address/category/:category  # Single category score
GET /api/v2/badges/:address           # All earned badges
GET /api/v2/badges/:address/:badgeId  # Specific badge details
GET /api/v2/metadata/badges           # Badge definitions
GET /api/v2/metadata/categories       # Category definitions`}
            </pre>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Authentication
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                All requests require an API key passed via the{" "}
                <code className="rounded bg-slate-100 px-1">X-API-Key</code>{" "}
                header. Get your key from the Developer Sandbox.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Rate Limiting
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                <strong>FREE tier:</strong> 100 requests/hour
                <br />
                <strong>PRO tier:</strong> 1,000 requests/hour
                <br />
                Automatic window resets with usage tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Widgets Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Embeddable Widgets
          </h2>
          <p className="mt-4 text-slate-700">
            Drop-in UI components that display DotPassport data beautifully.
            Four widget types with light/dark theme support and CSS variable
            customization.
          </p>

          {/* Widget Screenshots */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <img
                src="https://i.ibb.co/bMmjMXp2/dotpassport-profile-widget.png"
                alt="Profile Widget"
                className="w-full rounded-lg"
              />
              <p className="mt-2 text-center text-sm font-medium text-slate-700">
                Profile Widget
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <img
                src="https://i.ibb.co/fVxDyQFJ/dotpassport-reputation-widget-light.png"
                alt="Reputation Widget"
                className="w-full rounded-lg"
              />
              <p className="mt-2 text-center text-sm font-medium text-slate-700">
                Reputation Widget
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <img
                src="https://i.ibb.co/Wp7Q7408/dotpassport-badge-widget-light.png"
                alt="Badge Widget"
                className="w-full rounded-lg"
              />
              <p className="mt-2 text-center text-sm font-medium text-slate-700">
                Badge Widget
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <img
                src="https://i.ibb.co/chgG04Ws/dotpassport-reputation-widget-dark.png"
                alt="Dark Mode Widget"
                className="w-full rounded-lg"
              />
              <p className="mt-2 text-center text-sm font-medium text-slate-700">
                Dark Mode
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800">Widget Usage</h3>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
              {`import { createReputationWidget } from '@dotpassport/sdk/widgets';

const widget = createReputationWidget({
  container: '#widget-container',
  address: '5GrwvaEF...',
  theme: 'light', // 'light' | 'dark' | 'auto'
  apiKey: 'your-api-key',
});

widget.mount();

// Lifecycle methods
widget.refresh();  // Reload data
widget.update({ theme: 'dark' });  // Update options
widget.destroy();  // Clean up`}
            </pre>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Widget Types
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>
                  <strong>Profile</strong> — Complete user identity card
                </li>
                <li>
                  <strong>Reputation</strong> — Score breakdown with categories
                </li>
                <li>
                  <strong>Badge</strong> — Achievement showcase grid
                </li>
                <li>
                  <strong>Category</strong> — Single category deep dive
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Features</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Light/Dark/Auto theme modes</li>
                <li>CSS variable customization</li>
                <li>Event callbacks (onLoad, onError, onUpdate)</li>
                <li>Responsive design out of the box</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sandbox Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Developer Sandbox
          </h2>
          <p className="mt-4 text-slate-700">
            An interactive platform for developers to test the API, preview
            widgets, and manage their API keys. Connect your Polkadot wallet to
            get started at{" "}
            <a
              className="underline decoration-slate-300 hover:decoration-slate-700"
              href="https://sandbox.dotpassport.io"
              target="_blank"
              rel="noreferrer"
            >
              sandbox.dotpassport.io
            </a>
            .
          </p>

          {/* Sandbox Screenshots */}
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <img
                src="https://i.ibb.co/wZc8GRWG/dotpassport-sandbox-dashboard.png"
                alt="Sandbox Dashboard"
                className="w-full rounded-lg"
              />
              <p className="mt-3 text-sm text-slate-600">
                <strong>Dashboard</strong> — API key management, usage
                statistics, and rate limit tracking in real-time.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <img
                src="https://i.ibb.co/N61MmCDY/dotpassport-sandbox-api-testing-page.png"
                alt="API Testing Page"
                className="w-full rounded-lg"
              />
              <p className="mt-3 text-sm text-slate-600">
                <strong>API Testing</strong> — Test all 7 endpoints with live
                responses. Enter any Polkadot address and see the data returned.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <img
                src="https://i.ibb.co/B5PHBQfq/dotpassport-widget-testing-page.png"
                alt="Widget Playground"
                className="w-full rounded-lg"
              />
              <p className="mt-3 text-sm text-slate-600">
                <strong>Widget Playground</strong> — Preview and customize all 4
                widgets. Toggle themes, change addresses, and copy integration
                code.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Sandbox Features
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Wallet-based authentication</li>
                <li>API key generation and regeneration</li>
                <li>Real-time usage statistics</li>
                <li>Request log history with filtering</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Testing Tools
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Live API endpoint testing</li>
                <li>Widget preview with all themes</li>
                <li>Copy-paste integration code</li>
                <li>Status code distribution charts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Wallet Integration Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Wallet Integration
          </h2>
          <p className="mt-4 text-slate-700">
            The Sandbox platform supports major Polkadot wallets for secure,
            seamless authentication. Users sign a challenge message to prove
            wallet ownership — no passwords required.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">
                Talisman
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Full-featured Polkadot wallet
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">
                SubWallet
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Multi-chain asset management
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">
                Polkadot.js
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Official browser extension
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900">
              Authentication Flow
            </h4>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              <li>User connects their Polkadot wallet</li>
              <li>Server generates a unique challenge message with nonce</li>
              <li>User signs the challenge with their wallet</li>
              <li>Server verifies signature and issues JWT tokens</li>
              <li>Session persists with automatic token refresh</li>
            </ol>
          </div>
        </section>

        {/* Documentation Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Documentation
          </h2>
          <p className="mt-4 text-slate-700">
            Comprehensive documentation with 44+ markdown files covering
            everything from quick start guides to advanced integration patterns.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Getting Started
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Installation & setup</li>
                <li>Quick start guide</li>
                <li>API reference</li>
                <li>Type definitions</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Framework Guides
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>React integration</li>
                <li>Vue.js integration</li>
                <li>Angular integration</li>
                <li>Svelte & Vanilla JS</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Widget Documentation
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Widget overview & factory</li>
                <li>Profile, Reputation, Badge widgets</li>
                <li>Theming & customization</li>
                <li>Event handling</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Advanced Topics
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Caching strategies</li>
                <li>Security best practices</li>
                <li>Performance optimization</li>
                <li>Error recovery patterns</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-slate-700">
            Read the full documentation at{" "}
            <a
              className="underline decoration-slate-300 hover:decoration-slate-700"
              href="https://docs.dotpassport.io"
              target="_blank"
              rel="noreferrer"
            >
              docs.dotpassport.io
            </a>
            .
          </p>
        </section>

        {/* Test Coverage Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Test Coverage</h2>
          <p className="mt-4 text-slate-700">
            Comprehensive test suites ensure reliability across the entire
            codebase. Both backend services and the SDK are thoroughly tested.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Backend Tests
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                <strong>17 test files</strong> with 303+ passing tests
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                <li>API route testing</li>
                <li>Service layer tests (badge, score, API key)</li>
                <li>Middleware tests (auth, rate limit)</li>
                <li>Integration tests</li>
              </ul>
              <p className="mt-2 text-xs text-slate-400">
                Jest + MongoDB Memory Server
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">SDK Tests</h4>
              <p className="mt-1 text-sm text-slate-600">
                <strong>10 test files</strong> covering all SDK functionality
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                <li>Client API methods</li>
                <li>All 4 widget types</li>
                <li>Widget factory</li>
                <li>Utilities and templates</li>
              </ul>
              <p className="mt-2 text-xs text-slate-400">
                Vitest with DOM mocking
              </p>
            </div>
          </div>
        </section>

        {/* What's Live */}
        <section className="mb-12 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            What's Live Right Now
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <a
              href="https://dotpassport.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-pink-300 hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                D
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-slate-900">Main App</p>
                <p className="text-xs text-slate-500">dotpassport.io</p>
              </div>
            </a>
            <a
              href="https://sandbox.dotpassport.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-pink-300 hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                S
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-slate-900">
                  Developer Sandbox
                </p>
                <p className="text-xs text-slate-500">sandbox.dotpassport.io</p>
              </div>
            </a>
            <a
              href="https://docs.dotpassport.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-pink-300 hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                D
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-slate-900">
                  Documentation
                </p>
                <p className="text-xs text-slate-500">docs.dotpassport.io</p>
              </div>
            </a>
            <a
              href="https://www.npmjs.com/package/@dotpassport/sdk"
              target="_blank"
              rel="noreferrer"
              className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-pink-300 hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold">
                N
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-slate-900">
                  NPM Package
                </p>
                <p className="text-xs text-slate-500">@dotpassport/sdk</p>
              </div>
            </a>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Roadmap — What's Next
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Cross-chain reputation aggregation (Kusama, parachains)</li>
            <li>Additional widget types and themes</li>
            <li>Webhook notifications for reputation changes</li>
            <li>Pro tier with higher rate limits and priority support</li>
            <li>Mobile SDK for React Native</li>
          </ul>
        </section>

        {/* Footer / Links */}
        <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p>
            Source:
            <a
              className="ml-1 underline decoration-slate-300 hover:decoration-slate-700"
              href="https://github.com/SachinCoder1/DotPassport"
              target="_blank"
              rel="noreferrer"
            >
              github.com/SachinCoder1/DotPassport
            </a>
          </p>
          <p className="mt-1">
            Application:
            <a
              className="ml-1 underline decoration-slate-300 hover:decoration-slate-700"
              href="https://github.com/Polkadot-Fast-Grants/apply/blob/master/applications/DotPassport.md"
              target="_blank"
              rel="noreferrer"
            >
              Polkadot Fast Grants / DotPassport
            </a>
          </p>
          <p className="mt-1">
            Documentation:
            <a
              className="ml-1 underline decoration-slate-300 hover:decoration-slate-700"
              href="https://docs.dotpassport.io"
              target="_blank"
              rel="noreferrer"
            >
              docs.dotpassport.io
            </a>
          </p>
        </footer>
      </article>
    </main>
  );
}
