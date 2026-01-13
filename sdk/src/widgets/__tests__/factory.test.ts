/**
 * Tests for Widget Factory Functions
 */
import {
  createWidget,
  createReputationWidget,
  createBadgeWidget,
  createProfileWidget,
  createCategoryWidget,
  ReputationWidget,
  BadgeWidget,
  ProfileWidget,
  CategoryWidget,
} from '../index';
import { TEST_ADDRESS } from '../../__tests__/mocks/apiResponses';

describe('Widget Factory Functions', () => {
  const baseConfig = {
    apiKey: 'test-api-key',
    address: TEST_ADDRESS,
  };

  describe('createWidget', () => {
    it('should create ReputationWidget when type is "reputation"', () => {
      const widget = createWidget({ ...baseConfig, type: 'reputation' });
      expect(widget).toBeInstanceOf(ReputationWidget);
    });

    it('should create ReputationWidget when type is undefined', () => {
      const widget = createWidget(baseConfig as any);
      expect(widget).toBeInstanceOf(ReputationWidget);
    });

    it('should create BadgeWidget when type is "badge"', () => {
      const widget = createWidget({ ...baseConfig, type: 'badge' });
      expect(widget).toBeInstanceOf(BadgeWidget);
    });

    it('should create BadgeWidget when type is "badges"', () => {
      const widget = createWidget({ ...baseConfig, type: 'badges' });
      expect(widget).toBeInstanceOf(BadgeWidget);
    });

    it('should create ProfileWidget when type is "profile"', () => {
      const widget = createWidget({ ...baseConfig, type: 'profile' });
      expect(widget).toBeInstanceOf(ProfileWidget);
    });

    it('should create CategoryWidget when type is "category"', () => {
      const widget = createWidget({
        ...baseConfig,
        type: 'category',
        categoryKey: 'longevity',
      });
      expect(widget).toBeInstanceOf(CategoryWidget);
    });

    it('should throw error for unknown type', () => {
      expect(() =>
        createWidget({ ...baseConfig, type: 'unknown' as any })
      ).toThrow('Unknown widget type: unknown');
    });
  });

  describe('createReputationWidget', () => {
    it('should create ReputationWidget instance', () => {
      const widget = createReputationWidget(baseConfig);
      expect(widget).toBeInstanceOf(ReputationWidget);
    });

    it('should accept optional config options', () => {
      const widget = createReputationWidget({
        ...baseConfig,
        showCategories: true,
        maxCategories: 3,
        compact: true,
        theme: 'dark',
      });
      expect(widget).toBeInstanceOf(ReputationWidget);
    });
  });

  describe('createBadgeWidget', () => {
    it('should create BadgeWidget instance', () => {
      const widget = createBadgeWidget(baseConfig);
      expect(widget).toBeInstanceOf(BadgeWidget);
    });

    it('should accept badgeKey option', () => {
      const widget = createBadgeWidget({
        ...baseConfig,
        badgeKey: 'early_adopter',
      });
      expect(widget).toBeInstanceOf(BadgeWidget);
    });

    it('should accept maxBadges option', () => {
      const widget = createBadgeWidget({
        ...baseConfig,
        maxBadges: 3,
      });
      expect(widget).toBeInstanceOf(BadgeWidget);
    });
  });

  describe('createProfileWidget', () => {
    it('should create ProfileWidget instance', () => {
      const widget = createProfileWidget(baseConfig);
      expect(widget).toBeInstanceOf(ProfileWidget);
    });

    it('should accept display options', () => {
      const widget = createProfileWidget({
        ...baseConfig,
        showIdentities: false,
        showSocials: true,
        showBio: false,
      });
      expect(widget).toBeInstanceOf(ProfileWidget);
    });
  });

  describe('createCategoryWidget', () => {
    it('should create CategoryWidget instance', () => {
      const widget = createCategoryWidget({
        ...baseConfig,
        categoryKey: 'longevity',
      });
      expect(widget).toBeInstanceOf(CategoryWidget);
    });

    it('should require categoryKey', () => {
      const widget = createCategoryWidget({
        ...baseConfig,
        categoryKey: 'governance',
      });
      expect(widget).toBeInstanceOf(CategoryWidget);
    });

    it('should accept display options', () => {
      const widget = createCategoryWidget({
        ...baseConfig,
        categoryKey: 'longevity',
        showTitle: true,
        showDescription: false,
        showBreakdown: true,
        showAdvice: false,
        showScoreOnly: false,
        compact: true,
      });
      expect(widget).toBeInstanceOf(CategoryWidget);
    });
  });

  describe('Widget class exports', () => {
    it('should export ReputationWidget class', () => {
      expect(ReputationWidget).toBeDefined();
      expect(typeof ReputationWidget).toBe('function');
    });

    it('should export BadgeWidget class', () => {
      expect(BadgeWidget).toBeDefined();
      expect(typeof BadgeWidget).toBe('function');
    });

    it('should export ProfileWidget class', () => {
      expect(ProfileWidget).toBeDefined();
      expect(typeof ProfileWidget).toBe('function');
    });

    it('should export CategoryWidget class', () => {
      expect(CategoryWidget).toBeDefined();
      expect(typeof CategoryWidget).toBe('function');
    });
  });

  describe('Callback support', () => {
    it('should accept onLoad callback', () => {
      const onLoad = jest.fn();
      const widget = createReputationWidget({
        ...baseConfig,
        onLoad,
      });
      expect(widget).toBeInstanceOf(ReputationWidget);
    });

    it('should accept onError callback', () => {
      const onError = jest.fn();
      const widget = createReputationWidget({
        ...baseConfig,
        onError,
      });
      expect(widget).toBeInstanceOf(ReputationWidget);
    });

    it('should accept className option', () => {
      const widget = createReputationWidget({
        ...baseConfig,
        className: 'custom-class',
      });
      expect(widget).toBeInstanceOf(ReputationWidget);
    });
  });
});
