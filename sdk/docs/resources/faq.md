# Frequently Asked Questions

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

No, use test keys (`test_*`) for development and live keys (`live_*`) for production.

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

Make sure you have `@types/node` installed and TypeScript 5.0+.

## Support

Still have questions?

- [GitHub Issues](https://github.com/dotpassport/sdk/issues)
- [Discord Community](https://discord.gg/dotpassport)
- [Email Support](mailto:support@dotpassport.com)
