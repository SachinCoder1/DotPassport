/**
 * Generate CSS styles for widgets
 * Uses CSS variables for easy customization
 */
export function getWidgetStyles(): string {
  return `
    /* Base Widget Styles */
    .dp-widget {
      /* Color variables */
      --dp-primary: #8b5cf6;
      --dp-secondary: #ec4899;
      --dp-bg: #ffffff;
      --dp-text-primary: #111827;
      --dp-text-secondary: #6b7280;
      --dp-border: #e5e7eb;
      --dp-hover-bg: #f9fafb;

      /* Spacing */
      --dp-spacing-sm: 0.5rem;
      --dp-spacing-md: 1rem;
      --dp-spacing-lg: 1.5rem;

      /* Border radius */
      --dp-radius-sm: 0.375rem;
      --dp-radius-md: 0.5rem;
      --dp-radius-lg: 0.75rem;

      /* Shadows */
      --dp-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --dp-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --dp-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

      /* Typography */
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--dp-text-primary);
      line-height: 1.5;

      /* Layout */
      padding: var(--dp-spacing-lg);
      border-radius: var(--dp-radius-lg);
      background: var(--dp-bg);
      border: 1px solid var(--dp-border);
      box-shadow: var(--dp-shadow-sm);
      box-sizing: border-box;
    }

    /* Dark Theme */
    .dp-theme-dark {
      --dp-bg: #1f2937;
      --dp-text-primary: #f9fafb;
      --dp-text-secondary: #d1d5db;
      --dp-border: #374151;
      --dp-hover-bg: #374151;
    }

    /* Loading State */
    .dp-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .dp-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--dp-border);
      border-top-color: var(--dp-primary);
      border-radius: 50%;
      animation: dp-spin 0.8s linear infinite;
    }

    @keyframes dp-spin {
      to { transform: rotate(360deg); }
    }

    /* Error State */
    .dp-error {
      padding: var(--dp-spacing-md);
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: var(--dp-radius-md);
      color: #991b1b;
    }

    .dp-theme-dark .dp-error {
      background: #7f1d1d;
      border-color: #991b1b;
      color: #fca5a5;
    }

    .dp-error-title {
      font-weight: 600;
      margin-bottom: var(--dp-spacing-sm);
    }

    .dp-error-message {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    /* Reputation Widget */
    .dp-reputation-widget .dp-score-header {
      text-align: center;
      margin-bottom: var(--dp-spacing-lg);
    }

    .dp-reputation-widget .dp-score-value {
      font-size: 3.5rem;
      font-weight: 700;
      color: var(--dp-primary);
      line-height: 1;
    }

    .dp-reputation-widget .dp-score-label {
      margin-top: var(--dp-spacing-sm);
      font-size: 0.875rem;
      color: var(--dp-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dp-reputation-widget.dp-compact .dp-score-value {
      font-size: 2.5rem;
    }

    .dp-reputation-widget.dp-compact {
      padding: var(--dp-spacing-md);
    }

    /* Categories */
    .dp-categories {
      display: grid;
      gap: var(--dp-spacing-sm);
    }

    .dp-category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--dp-spacing-sm) var(--dp-spacing-md);
      background: rgba(0, 0, 0, 0.02);
      border-radius: var(--dp-radius-md);
      transition: background 0.2s;
    }

    .dp-category-item:hover {
      background: var(--dp-hover-bg);
    }

    .dp-theme-dark .dp-category-item {
      background: rgba(255, 255, 255, 0.03);
    }

    .dp-category-title {
      font-size: 0.875rem;
      color: var(--dp-text-primary);
    }

    .dp-category-score {
      font-weight: 600;
      color: var(--dp-primary);
    }

    /* Badge Widget */
    .dp-badge-widget .dp-badge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--dp-spacing-md);
    }

    .dp-badge-item {
      text-align: center;
      padding: var(--dp-spacing-md);
      border: 1px solid var(--dp-border);
      border-radius: var(--dp-radius-md);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .dp-badge-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--dp-shadow-md);
    }

    .dp-badge-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto var(--dp-spacing-sm);
      border-radius: 50%;
      background: linear-gradient(135deg, var(--dp-primary), var(--dp-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .dp-badge-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      color: var(--dp-text-primary);
    }

    .dp-badge-level {
      font-size: 0.75rem;
      color: var(--dp-text-secondary);
    }

    /* Profile Widget */
    .dp-profile-widget .dp-profile-header {
      display: flex;
      gap: var(--dp-spacing-md);
      margin-bottom: var(--dp-spacing-lg);
    }

    .dp-profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--dp-primary), var(--dp-secondary));
      flex-shrink: 0;
    }

    .dp-profile-info {
      flex: 1;
    }

    .dp-profile-name {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: var(--dp-text-primary);
    }

    .dp-profile-address {
      font-size: 0.875rem;
      color: var(--dp-text-secondary);
      font-family: monospace;
    }

    .dp-profile-bio {
      margin-top: var(--dp-spacing-md);
      padding-top: var(--dp-spacing-md);
      border-top: 1px solid var(--dp-border);
      color: var(--dp-text-primary);
    }

    .dp-profile-socials {
      display: flex;
      gap: var(--dp-spacing-sm);
      margin-top: var(--dp-spacing-md);
    }

    .dp-social-link {
      padding: var(--dp-spacing-sm);
      border-radius: var(--dp-radius-sm);
      background: var(--dp-hover-bg);
      color: var(--dp-text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .dp-social-link:hover {
      background: var(--dp-border);
    }

    /* Category Widget */
    .dp-category-widget .dp-category-header {
      margin-bottom: var(--dp-spacing-lg);
    }

    .dp-category-widget .dp-category-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--dp-text-primary);
      margin-bottom: 0.25rem;
    }

    .dp-category-widget .dp-category-desc {
      font-size: 0.875rem;
      color: var(--dp-text-secondary);
    }

    .dp-category-widget .dp-category-score-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--dp-primary);
      margin: var(--dp-spacing-md) 0;
    }

    .dp-breakdown {
      margin-top: var(--dp-spacing-lg);
    }

    .dp-breakdown-title {
      font-weight: 600;
      margin-bottom: var(--dp-spacing-md);
      color: var(--dp-text-primary);
    }

    .dp-breakdown-item {
      padding: var(--dp-spacing-sm);
      margin-bottom: var(--dp-spacing-sm);
      border-left: 3px solid var(--dp-primary);
      padding-left: var(--dp-spacing-md);
    }

    .dp-breakdown-item-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--dp-text-primary);
    }

    .dp-breakdown-item-desc {
      font-size: 0.75rem;
      color: var(--dp-text-secondary);
      margin-top: 0.25rem;
    }

    /* Utility Classes */
    .dp-text-center {
      text-align: center;
    }

    .dp-mt-md {
      margin-top: var(--dp-spacing-md);
    }

    .dp-mb-md {
      margin-bottom: var(--dp-spacing-md);
    }
  `;
}
