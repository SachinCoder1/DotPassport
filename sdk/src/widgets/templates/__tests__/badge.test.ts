/**
 * Tests for badge template
 */
import { renderBadgeTemplate, BadgeTemplateOptions } from '../badge';
import { UserBadge, BadgeDefinition } from '../../../types';

describe('renderBadgeTemplate', () => {
  const mockBadges: UserBadge[] = [
    {
      badgeKey: 'early_adopter',
      achievedLevel: 3,
      achievedLevelKey: 'gold',
      achievedLevelTitle: 'Gold Early Adopter',
      earnedAt: '2024-01-10T10:00:00Z',
    },
    {
      badgeKey: 'governance_voter',
      achievedLevel: 2,
      achievedLevelKey: 'silver',
      achievedLevelTitle: 'Silver Governance Voter',
      earnedAt: '2024-01-12T14:30:00Z',
    },
  ];

  const mockDefinition: BadgeDefinition = {
    key: 'whale',
    title: 'Whale',
    shortDescription: 'Hold significant assets',
    longDescription: 'Badge for large holders',
    metric: 'balance',
    levels: [
      {
        level: 1,
        key: 'bronze',
        value: 1000,
        title: 'Bronze Whale',
        shortDescription: 'Hold 1000+ DOT',
        longDescription: '',
      },
    ],
  };

  const baseOptions: BadgeTemplateOptions = {
    badges: mockBadges,
    maxBadges: 6,
    showProgress: false,
    theme: 'light',
    isSingle: false,
  };

  describe('Multiple badges display', () => {
    it('should render badge widget', () => {
      const html = renderBadgeTemplate(baseOptions);
      expect(html).toContain('dp-badge-widget');
    });

    it('should render badge grid', () => {
      const html = renderBadgeTemplate(baseOptions);
      expect(html).toContain('dp-badge-grid');
    });

    it('should render all badges', () => {
      const html = renderBadgeTemplate(baseOptions);
      expect(html).toContain('Gold Early Adopter');
      expect(html).toContain('Silver Governance Voter');
    });

    it('should limit badges to maxBadges', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        maxBadges: 1,
      });
      expect(html).toContain('Gold Early Adopter');
      expect(html).not.toContain('Silver Governance Voter');
    });

    it('should show empty state when no badges', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
      });
      expect(html).toContain('No badges earned yet');
    });
  });

  describe('Single badge display', () => {
    it('should render single badge', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [mockBadges[0]],
        isSingle: true,
      });
      expect(html).toContain('Gold Early Adopter');
    });

    it('should only show one badge when isSingle is true', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        isSingle: true,
      });
      // Count actual badge items by looking for the badge title pattern
      expect(html).toContain('Gold Early Adopter');
      expect(html).not.toContain('Silver Governance Voter');
    });
  });

  describe('Not earned state', () => {
    it('should render not earned state', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
        isSingle: true,
        notEarned: true,
        definition: mockDefinition,
      });
      expect(html).toContain('dp-badge-not-earned');
      expect(html).toContain('Badge not yet earned');
    });

    it('should show badge title for not earned', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
        isSingle: true,
        notEarned: true,
        definition: mockDefinition,
      });
      expect(html).toContain('Whale');
    });

    it('should show badge description for not earned', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
        isSingle: true,
        notEarned: true,
        definition: mockDefinition,
      });
      expect(html).toContain('Hold significant assets');
    });

    it('should show first level requirement', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
        isSingle: true,
        notEarned: true,
        definition: mockDefinition,
      });
      expect(html).toContain('First Level');
      expect(html).toContain('Bronze Whale');
    });

    it('should show locked icon', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
        isSingle: true,
        notEarned: true,
        definition: mockDefinition,
      });
      expect(html).toContain('🔒');
    });
  });

  describe('Badge icons', () => {
    it('should show trophy for level 5+', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [{ ...mockBadges[0], achievedLevel: 5 }],
      });
      expect(html).toContain('🏆');
    });

    it('should show gold medal for level 4', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [{ ...mockBadges[0], achievedLevel: 4 }],
      });
      expect(html).toContain('🥇');
    });

    it('should show silver medal for level 3', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [{ ...mockBadges[0], achievedLevel: 3 }],
      });
      expect(html).toContain('🥈');
    });

    it('should show bronze medal for level 2', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [{ ...mockBadges[0], achievedLevel: 2 }],
      });
      expect(html).toContain('🥉');
    });

    it('should show basic medal for level 1', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [{ ...mockBadges[0], achievedLevel: 1 }],
      });
      expect(html).toContain('🎖️');
    });
  });

  describe('Progress display', () => {
    it('should show earned date when showProgress is true', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        showProgress: true,
      });
      // Should contain formatted date
      expect(html).toContain('Jan 10, 2024');
    });

    it('should not show earned date when showProgress is false', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        showProgress: false,
      });
      // The date itself should not appear in content
      expect(html).not.toContain('Jan 10, 2024');
    });
  });

  describe('Theme', () => {
    it('should apply light theme', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        theme: 'light',
      });
      expect(html).toContain('dp-theme-light');
    });

    it('should apply dark theme', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        theme: 'dark',
      });
      expect(html).toContain('dp-theme-dark');
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in badge titles', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [
          {
            ...mockBadges[0],
            achievedLevelTitle: '<script>alert("xss")</script>',
          },
        ],
      });
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in definition title', () => {
      const html = renderBadgeTemplate({
        ...baseOptions,
        badges: [],
        isSingle: true,
        notEarned: true,
        definition: {
          ...mockDefinition,
          title: '<script>alert("xss")</script>',
        },
      });
      expect(html).not.toContain('<script>alert');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
