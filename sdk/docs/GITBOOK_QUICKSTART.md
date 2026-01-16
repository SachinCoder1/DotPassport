# GitBook Quick Start

Quick guide to get your DotPassport SDK documentation live on GitBook.

## ✅ What's Already Done

1. **GitBook Configuration** - `.gitbook.yaml` created
2. **Navigation Structure** - `SUMMARY.md` with full table of contents
3. **Documentation Pages** - Key pages generated in `docs/` folder
4. **Setup Guide** - Comprehensive `GITBOOK_SETUP.md`
5. **NPM Scripts** - Added to `package.json`

## 🚀 Quick Setup (Recommended)

### Option 1: GitBook Cloud (5 minutes)

**Easiest way - No local installation needed**

1. **Sign Up**
   - Go to [gitbook.com](https://www.gitbook.com)
   - Create a free account

2. **Connect GitHub**
   - Click "New Space"
   - Select "Import from GitHub"
   - Authorize GitBook
   - Select your `dotpassport/sdk` repository

3. **Configure**
   - GitBook auto-detects `.gitbook.yaml`
   - Uses `SUMMARY.md` for navigation
   - Click "Publish"

4. **Done!**
   - Your docs are live at `https://your-space.gitbook.io`
   - Auto-syncs with GitHub pushes

### Option 2: GitBook CLI (Local Preview)

**For local development and preview**

1. **Install GitBook CLI**
   ```bash
   npm install -g gitbook-cli
   cd sdk
   gitbook init
   ```

2. **Serve Locally**
   ```bash
   npm run docs:serve
   # or
   gitbook serve
   ```

   View at http://localhost:4000

3. **Build Static Site**
   ```bash
   npm run docs:build
   # or
   gitbook build
   ```

   Output in `_book/` folder

## 📁 File Structure

```
sdk/
├── .gitbook.yaml          # GitBook config
├── SUMMARY.md             # Navigation (table of contents)
├── README.md              # Home page
├── GITBOOK_SETUP.md       # Detailed setup guide
└── docs/
    ├── getting-started/   # Getting started guides
    ├── api-client/        # API client docs
    ├── widgets/           # Widget guides
    ├── frameworks/        # Framework integrations
    ├── advanced/          # Advanced topics
    ├── examples/          # Code examples
    ├── resources/         # FAQ, support, etc.
    ├── api-reference.md   # Complete API reference
    └── widgets.md         # Complete widget guide
```

## 🛠️ NPM Scripts

```bash
# Generate additional GitBook pages
npm run docs:generate

# Serve docs locally (requires GitBook CLI)
npm run docs:serve

# Build static site (requires GitBook CLI)
npm run docs:build
```

## 📝 Key GitBook Features

### Hints/Callouts

```markdown
{% hint style="info" %}
This is an info message
{% endhint %}

{% hint style="warning" %}
This is a warning
{% endhint %}

{% hint style="danger" %}
Critical warning
{% endhint %}

{% hint style="success" %}
Success message
{% endhint %}
```

### Code Tabs

```markdown
{% tabs %}
{% tab title="JavaScript" %}
```js
const client = new DotPassportClient({ apiKey: 'key' });
```
{% endtab %}

{% tab title="TypeScript" %}
```ts
const client: DotPassportClient = new DotPassportClient({ apiKey: 'key' });
```
{% endtab %}
{% endtabs %}
```

### Collapsible Sections

```markdown
<details>
<summary><strong>Click to expand</strong></summary>

Content goes here...

</details>
```

## 🎨 Customization

### Custom Domain

1. In GitBook: Settings → Domain
2. Add your domain (e.g., `docs.dotpassport.io`)
3. Add DNS CNAME record:
   ```
   Type: CNAME
   Name: docs
   Value: hosting.gitbook.io
   ```

### Branding

- **Logo**: Settings → Customization → Logo
- **Colors**: Settings → Customization → Theme
- **Favicon**: Settings → Customization → Favicon

### Analytics

- Settings → Integrations → Google Analytics
- Add your GA tracking ID

## 🔄 Auto-Update Workflow

Once connected to GitHub:

1. Edit markdown files locally
2. Commit and push to GitHub
3. GitBook automatically syncs
4. Documentation updates live

## 📚 Documentation Pages

### Already Created

✅ Installation
✅ Quick Start
✅ Authentication
✅ API Client Overview
✅ Client Initialization
✅ Profile Methods
✅ Widget Overview
✅ React Integration
✅ TypeScript Support
✅ FAQ
✅ Type Definitions
✅ Complete API Reference
✅ Complete Widget Guide

### Still To Create (Optional)

- Scores Methods (detailed)
- Badges Methods (detailed)
- Error Handling (detailed)
- Rate Limiting (detailed)
- Vue Integration
- Svelte Integration
- Angular Integration
- More examples

Use `npm run docs:generate` to create these automatically.

## 🐛 Troubleshooting

### GitBook not syncing

- Check GitHub integration is active
- Verify `.gitbook.yaml` is valid YAML
- Check file paths in `SUMMARY.md`
- Force sync in GitBook settings

### 404 on pages

- Ensure file exists in `SUMMARY.md`
- Check file path is correct (case-sensitive)
- File must be committed to GitHub

### Local preview not working

- Install GitBook CLI: `npm install -g gitbook-cli`
- Run `gitbook init` first
- Check Node.js version (v16+ recommended)

## 🎯 Next Steps

1. **Review GITBOOK_SETUP.md** for detailed instructions
2. **Customize SUMMARY.md** if needed
3. **Add more content** to docs pages
4. **Set up GitBook Cloud** for live publishing
5. **Configure custom domain** (optional)
6. **Add analytics** (optional)

## 📖 Resources

- [GitBook Documentation](https://docs.gitbook.com)
- [GitBook Markdown Guide](https://docs.gitbook.com/editing-content/markdown)
- [Full Setup Guide](../GITBOOK_SETUP.md)

## 💡 Tips

- Keep pages focused and concise
- Use code examples liberally
- Add visual aids (screenshots, diagrams)
- Link between related pages
- Update regularly with new features
- Monitor analytics to see what users read most

---

**Ready to publish?** Go to [gitbook.com](https://www.gitbook.com) and connect your repository!
