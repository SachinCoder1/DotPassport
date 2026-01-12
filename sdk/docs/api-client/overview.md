# API Client Overview

The DotPassportClient provides programmatic access to all DotPassport API endpoints.

## Features

- **Full API Coverage** - Access all endpoints
- **TypeScript-First** - Complete type safety
- **Automatic Error Handling** - Structured error responses
- **Rate Limit Aware** - Built-in rate limit tracking

## Available Methods

### Profile Methods
- `getProfile(address)` - Get user profile

### Scores Methods
- `getScores(address)` - Get all scores
- `getCategoryScore(address, categoryKey)` - Get specific category

### Badges Methods
- `getBadges(address)` - Get all badges
- `getBadge(address, badgeKey)` - Get specific badge

### Metadata Methods
- `getBadgeDefinitions()` - Get all badge definitions
- `getCategoryDefinitions()` - Get all category definitions

## Next Steps

- [Initialization](./initialization.md) - Set up the client
- [Profile Methods](./profile.md) - Fetch user profiles
- [Scores Methods](./scores.md) - Get reputation scores
- [Badges Methods](./badges.md) - Retrieve badges
