# Changelog

All notable changes to the DotPassport SDK.

## [0.1.1] - 2025-01-12

### Added
- Initial public release
- `DotPassportClient` for API interactions
- Widget system with `createWidget()` function
- Support for reputation, badge, profile, and category widgets
- React, Vue, Svelte, and Angular integration examples
- TypeScript support with full type definitions
- Light, dark, and auto theme support
- CSS variable theming system

### Widget Types
- **Reputation Widget**: Display overall reputation score with category breakdown
- **Badge Widget**: Show earned achievement badges
- **Profile Widget**: Display user profile information
- **Category Widget**: Show individual reputation categories

### API Methods
- `getScores(address)`: Fetch reputation scores
- `getCategoryScore(address, categoryKey)`: Fetch specific category score
- `getBadges(address)`: Fetch badges data
- `getBadge(address, badgeKey)`: Fetch specific badge
- `getProfile(address)`: Fetch user profile
- `getBadgeDefinitions()`: Fetch all badge definitions
- `getCategoryDefinitions()`: Fetch all category definitions

---

## [Unreleased]

### Planned Features
- Server-side rendering support
- Preact adapter
- Web Component wrapper
- Batch API requests
- Offline support with IndexedDB caching

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.1 | 2025-01-12 | Initial public release |

---

## Migration Guides

### From Beta to 0.1.x

If you were using a pre-release version:

1. Update package:
   ```bash
   npm install @dotpassport/sdk@latest
   ```

2. Update imports (if changed):
   ```typescript
   // Old
   import { DotPassport } from '@dotpassport/sdk';

   // New
   import { DotPassportClient, createWidget } from '@dotpassport/sdk';
   ```

3. Update widget creation:
   ```typescript
   // Old
   const widget = new DotPassport.Widget(config);

   // New
   const widget = createWidget(config);
   ```

---

## Deprecations

No deprecations in current version.

---

## Breaking Changes

### 0.1.0 to 0.1.1

No breaking changes.

---

## Related

- [Contributing](./contributing.md)
- [Support](./support.md)
- [Getting Started](../getting-started/quick-start.md)
