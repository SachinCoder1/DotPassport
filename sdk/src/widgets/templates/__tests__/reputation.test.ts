/**
 * Tests for reputation template
 */
import { renderReputationTemplate, ReputationTemplateOptions } from '../reputation';

describe('renderReputationTemplate', () => {
  const baseOptions: ReputationTemplateOptions = {
    totalScore: 500,
    categories: {
      longevity: { score: 100, reason: 'TwoYears', title: 'Account Age' },
      governance: { score: 150, reason: 'Active', title: 'Governance' },
      staking: { score: 125, reason: 'High', title: 'Staking' },
      txCount: { score: 75, reason: 'Moderate', title: 'Transaction Count' },
    },
    showCategories: true,
    maxCategories: 6,
    compact: false,
    theme: 'light',
  };

  describe('Theme rendering', () => {
    it('should render with light theme class', () => {
      const html = renderReputationTemplate({ ...baseOptions, theme: 'light' });
      expect(html).toContain('dp-theme-light');
    });

    it('should render with dark theme class', () => {
      const html = renderReputationTemplate({ ...baseOptions, theme: 'dark' });
      expect(html).toContain('dp-theme-dark');
    });
  });

  describe('Score rendering', () => {
    it('should render total score', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('500');
    });

    it('should render score label', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('Reputation Score');
    });

    it('should format large numbers', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        totalScore: 10000,
      });
      expect(html).toContain('10,000');
    });

    it('should handle zero score', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        totalScore: 0,
      });
      expect(html).toContain('>0<');
    });
  });

  describe('Categories rendering', () => {
    it('should render categories when showCategories is true', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('dp-categories');
      expect(html).toContain('Account Age');
      expect(html).toContain('Governance');
    });

    it('should not render categories when showCategories is false', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        showCategories: false,
      });
      // Check that the actual categories div is not rendered (not just the CSS class name)
      expect(html).not.toContain('<div class="dp-categories">');
    });

    it('should limit categories to maxCategories', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        maxCategories: 2,
      });
      // Should only have 2 category items - match the actual element div, not CSS
      const matches = html.match(/<div class="dp-category-item">/g);
      expect(matches?.length).toBe(2);
    });

    it('should render category scores', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('100');
      expect(html).toContain('150');
    });

    it('should handle empty categories', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        categories: {},
      });
      // Check for actual element, not CSS class name
      expect(html).not.toContain('<div class="dp-category-item">');
    });
  });

  describe('Compact mode', () => {
    it('should apply compact class when compact is true', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        compact: true,
      });
      expect(html).toContain('dp-compact');
    });

    it('should not apply compact class when compact is false', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        compact: false,
      });
      // The main widget div should not have dp-compact in its class attribute
      expect(html).not.toMatch(/class="[^"]*dp-compact[^"]*"/);
    });
  });

  describe('Widget structure', () => {
    it('should include widget styles', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('<style>');
    });

    it('should have reputation widget class', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('dp-reputation-widget');
    });

    it('should have dp-widget class', () => {
      const html = renderReputationTemplate(baseOptions);
      expect(html).toContain('dp-widget');
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in category titles', () => {
      const html = renderReputationTemplate({
        ...baseOptions,
        categories: {
          test: { score: 100, reason: 'test', title: '<script>alert("xss")</script>' },
        },
      });
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
