# Contributing Guide

Thank you for your interest in contributing to DotPassport SDK!

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dotpassport-sdk.git
   cd dotpassport-sdk
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development

### Project Structure

```
sdk/
├── src/
│   ├── client/        # API client
│   ├── widgets/       # Widget components
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── docs/              # Documentation
├── tests/             # Test files
└── examples/          # Example apps
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the SDK |
| `npm run dev` | Start development mode |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript checks |

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- client.test.ts
```

---

## Code Style

### TypeScript

- Use TypeScript for all source files
- Export types from public API
- Prefer interfaces over type aliases for object shapes
- Use strict mode

```typescript
// ✅ Good
interface WidgetConfig {
  apiKey: string;
  address: string;
  type: 'reputation' | 'badge' | 'profile';
}

// ❌ Avoid
type WidgetConfig = {
  apiKey: any;
  address: any;
  type: string;
};
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `api-client.ts` |
| Classes | PascalCase | `DotPassportClient` |
| Functions | camelCase | `createWidget` |
| Constants | UPPER_SNAKE | `DEFAULT_TTL` |
| Types | PascalCase | `ScoresResponse` |

### Comments

```typescript
/**
 * Creates a new DotPassport widget.
 *
 * @param config - Widget configuration options
 * @returns Widget instance with mount, update, refresh, and destroy methods
 *
 * @example
 * ```typescript
 * const widget = createWidget({
 *   apiKey: 'your_api_key',
 *   address: '5Grwva...',
 *   type: 'reputation'
 * });
 * widget.mount('#container');
 * ```
 */
export function createWidget(config: WidgetConfig): Widget {
  // ...
}
```

---

## Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

2. **Update documentation** if you changed public APIs

3. **Add tests** for new features

4. **Update CHANGELOG.md** with your changes

### PR Title Format

Use conventional commit format:

```
feat: add compact mode to reputation widget
fix: handle rate limit errors gracefully
docs: update React integration guide
chore: upgrade dependencies
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

---

## Reporting Issues

### Bug Reports

Include:
1. SDK version
2. Environment (browser, Node.js version)
3. Steps to reproduce
4. Expected vs actual behavior
5. Error messages/screenshots

### Feature Requests

Include:
1. Use case description
2. Proposed solution
3. Alternative solutions considered

---

## Documentation

### Adding New Pages

1. Create the markdown file in `docs/`
2. Add entry to `SUMMARY.md`
3. Follow existing page structure

### Documentation Style

- Use clear, concise language
- Include code examples
- Add links to related pages
- Use tables for reference data

---

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. After merge, tag release
5. Publish to npm

---

## Code of Conduct

- Be respectful and inclusive
- Give constructive feedback
- Help others learn
- Report unacceptable behavior

---

## Getting Help

- **Discord:** [Join our community](https://discord.gg/dotpassport)
- **GitHub Issues:** Report bugs or request features
- **Email:** dev@dotpassport.xyz

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Related

- [Support](./support.md)
- [Changelog](./changelog.md)
