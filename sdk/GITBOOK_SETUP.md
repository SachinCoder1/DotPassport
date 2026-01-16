# GitBook Setup Guide

This guide explains how to set up and publish the DotPassport SDK documentation to GitBook.

## Overview

GitBook is a modern documentation platform that turns your markdown files into beautiful, searchable documentation. This SDK uses GitBook for its official documentation.

## Prerequisites

- GitHub account
- GitBook account (free at [gitbook.com](https://www.gitbook.com))
- Git repository for the SDK

## Setup Options

### Option 1: GitBook Cloud (Recommended)

The easiest way to get started. GitBook will automatically sync with your GitHub repository.

#### Step 1: Connect GitHub

1. Sign in to [GitBook](https://www.gitbook.com)
2. Click **New Space**
3. Select **GitHub** as the source
4. Authorize GitBook to access your repositories
5. Select the `dotpassport/sdk` repository
6. Choose the `main` branch

#### Step 2: Configure GitBook

GitBook will automatically detect the `.gitbook.yaml` configuration file and use the structure defined in `SUMMARY.md`.

#### Step 3: Customize

1. Go to **Space Settings**
2. Configure:
   - Custom domain (optional)
   - Branding colors
   - Logo and favicon
   - Search settings
   - Analytics integration

#### Step 4: Publish

1. Click **Publish** in the top right
2. Choose visibility:
   - **Public**: Anyone can view
   - **Private**: Only invited users
   - **Public with login**: Free but requires sign-in

Your documentation is now live!

### Option 2: GitBook CLI (Self-Hosted)

For self-hosted documentation or local preview.

#### Install GitBook CLI

```bash
npm install -g gitbook-cli
```

#### Initialize GitBook

```bash
cd sdk
gitbook init
```

#### Serve Locally

```bash
gitbook serve
```

View at `http://localhost:4000`

#### Build Static Site

```bash
gitbook build
```

This creates a static site in `./_book` that you can host anywhere (Netlify, Vercel, GitHub Pages, etc.).

## File Structure

```
sdk/
├── .gitbook.yaml          # GitBook configuration
├── SUMMARY.md             # Table of contents (navigation)
├── README.md              # Home page
└── docs/
    ├── getting-started/
    │   ├── installation.md
    │   ├── quick-start.md
    │   └── authentication.md
    ├── api-client/
    │   ├── overview.md
    │   ├── profile.md
    │   ├── scores.md
    │   └── ...
    ├── widgets/
    │   ├── overview.md
    │   ├── reputation.md
    │   └── ...
    └── ...
```

## Configuration Files

### .gitbook.yaml

Main configuration file:

```yaml
root: ./

structure:
  readme: README.md
  summary: SUMMARY.md

redirects:
  previous/page: new-folder/page.md
```

### SUMMARY.md

Defines the navigation structure. Each line is a nav item:

```markdown
# Table of Contents

## Getting Started
* [Introduction](README.md)
* [Installation](docs/getting-started/installation.md)

## API Client
* [Overview](docs/api-client/overview.md)
```

## Writing Documentation

### GitBook-Specific Features

#### Hints/Callouts

```markdown
{% hint style="info" %}
This is an info callout.
{% endhint %}

{% hint style="warning" %}
This is a warning.
{% endhint %}

{% hint style="danger" %}
This is a danger notice.
{% endhint %}

{% hint style="success" %}
This is a success message.
{% endhint %}
```

#### Code Tabs

```markdown
{% tabs %}
{% tab title="JavaScript" %}
```javascript
const client = new DotPassportClient({ apiKey: 'key' });
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
const client: DotPassportClient = new DotPassportClient({ apiKey: 'key' });
```
{% endtab %}
{% endtabs %}
```

#### API Methods

```markdown
{% swagger method="get" path="/api/v2/profile/:address" baseUrl="https://api.dotpassport.io" summary="Get User Profile" %}
{% swagger-description %}
Retrieves the profile for a given address.
{% endswagger-description %}

{% swagger-parameter in="path" name="address" required="true" %}
Polkadot address
{% endswagger-parameter %}

{% swagger-response status="200" description="Success" %}
```json
{
  "success": true,
  "data": {
    "address": "5Grw...",
    "displayName": "Alice"
  }
}
```
{% endswagger-response %}
{% endswagger %}
```

## Publishing Workflow

### Automatic Updates

When connected to GitHub, GitBook automatically syncs changes:

1. Make changes to markdown files
2. Commit and push to GitHub
3. GitBook detects changes
4. Documentation updates automatically

### Manual Sync

If using GitBook CLI:

1. Build the site: `gitbook build`
2. Deploy `_book/` directory to your host

## Custom Domain

### Setup

1. In GitBook, go to **Space Settings → Domain**
2. Enter your custom domain (e.g., `docs.dotpassport.io`)
3. Add DNS records:

```
Type: CNAME
Name: docs
Value: hosting.gitbook.io
```

4. Wait for DNS propagation (up to 24 hours)
5. Enable SSL in GitBook settings

## Analytics Integration

### Google Analytics

1. Go to **Space Settings → Integrations**
2. Enable Google Analytics
3. Enter your GA tracking ID

### Custom Analytics

Add tracking scripts via **Settings → Advanced → Custom Scripts**.

## Search Configuration

GitBook includes built-in search. Configure it:

1. Go to **Space Settings → Search**
2. Enable/disable features:
   - Fuzzy search
   - Search in code blocks
   - Search shortcuts

## Versioning

Support multiple versions:

1. Create different branches (`v1`, `v2`, etc.)
2. In GitBook, go to **Versions**
3. Add version for each branch
4. Users can switch versions in the UI

## Team Collaboration

### Invite Team Members

1. Go to **Space Settings → Members**
2. Click **Invite**
3. Enter email and select role:
   - **Admin**: Full access
   - **Editor**: Can edit content
   - **Reader**: Read-only access

### Review Changes

GitBook supports change requests (like pull requests):

1. Make changes in GitBook editor
2. Submit change request
3. Team reviews
4. Merge when approved

## Best Practices

### Organization

- Keep pages focused and concise
- Use consistent heading hierarchy
- Link between related pages
- Include code examples
- Add visual aids (images, diagrams)

### Writing Style

- Use clear, simple language
- Write in present tense
- Use active voice
- Include practical examples
- Add troubleshooting sections

### Maintenance

- Review and update regularly
- Fix broken links
- Update code examples
- Add new features
- Archive outdated content

## Troubleshooting

### GitBook Not Syncing

**Solutions**:
- Check GitHub integration is active
- Verify `.gitbook.yaml` is valid
- Check `SUMMARY.md` paths are correct
- Force sync in GitBook settings

### 404 on Published Pages

**Solutions**:
- Verify file exists in `SUMMARY.md`
- Check file path is correct
- Ensure file is committed to GitHub
- Clear GitBook cache

### Code Blocks Not Highlighting

**Solutions**:
- Specify language after triple backticks
- Use supported language names
- Check for syntax errors in code

## Alternative: VitePress

If you prefer a different documentation tool, consider VitePress:

### Setup VitePress

```bash
npm install -D vitepress
```

### Initialize

```bash
npx vitepress init
```

### Configure

Create `.vitepress/config.ts`:

```typescript
export default {
  title: 'DotPassport SDK',
  description: 'Official SDK documentation',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Installation', link: '/guide/installation' }
      ]
    }
  }
};
```

### Serve

```bash
npm run docs:dev
```

## Resources

- [GitBook Documentation](https://docs.gitbook.com)
- [GitBook Markdown Guide](https://docs.gitbook.com/editing-content/markdown)
- [GitBook API](https://developer.gitbook.com)
- [VitePress Documentation](https://vitepress.dev)

## Support

For GitBook-specific issues:
- [GitBook Support](https://www.gitbook.com/support)
- [GitBook Community](https://github.com/GitbookIO/gitbook/discussions)

For SDK documentation issues:
- [GitHub Issues](https://github.com/dotpassport/sdk/issues)
- [Discord Community](https://discord.gg/dotpassport)
