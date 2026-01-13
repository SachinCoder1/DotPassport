/**
 * Integration Tests for Widget System
 * Tests full widget lifecycle and cross-widget scenarios
 */
jest.mock('axios');

import { ReputationWidget } from '../ReputationWidget';
import { BadgeWidget } from '../BadgeWidget';
import { ProfileWidget } from '../ProfileWidget';
import { CategoryWidget } from '../CategoryWidget';
import { clearGlobalCache } from '../../client';
import { mockAxiosInstance, createMockResponse, resetAxiosMock } from '../../../__mocks__/axios';
import {
  TEST_ADDRESS,
  mockUserScores,
  mockUserBadges,
  mockUserProfile,
  mockCategoryScore,
} from '../../__tests__/mocks/apiResponses';
import {
  createTestContainer,
  removeTestContainer,
  waitForDomUpdate,
} from '../../__tests__/mocks/domHelpers';

describe('Widget Integration Tests', () => {
  beforeEach(() => {
    resetAxiosMock();
    clearGlobalCache();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Complete Widget Lifecycle', () => {
    it('should handle full lifecycle: mount -> update -> refresh -> destroy', async () => {
      const container = createTestContainer();
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      const onLoad = jest.fn();
      const widget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        onLoad,
      });

      // Mount
      await widget.mount('#test-container');
      expect(container.querySelector('.dp-widget')).not.toBeNull();
      expect(onLoad).toHaveBeenCalledTimes(1);

      // Update (address change triggers re-fetch)
      const newAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      await widget.update({ address: newAddress });
      expect(onLoad).toHaveBeenCalledTimes(2);

      // Refresh (uses cache, so no new API call but onLoad is still called)
      await widget.refresh();
      expect(onLoad).toHaveBeenCalledTimes(3);
      // Only 2 API calls because refresh uses cached data
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);

      // Destroy
      widget.destroy();
      expect(container.innerHTML).toBe('');

      removeTestContainer();
    });
  });

  describe('Multiple Widgets on Same Page', () => {
    it('should handle multiple widgets with separate states', async () => {
      document.body.innerHTML = `
        <div id="reputation-container"></div>
        <div id="profile-container"></div>
        <div id="badge-container"></div>
      `;

      mockAxiosInstance.get
        .mockResolvedValueOnce(createMockResponse(mockUserScores))
        .mockResolvedValueOnce(createMockResponse(mockUserProfile))
        .mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const reputationWidget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
      });
      const profileWidget = new ProfileWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        type: 'profile',
      });
      const badgeWidget = new BadgeWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        type: 'badge',
      });

      await Promise.all([
        reputationWidget.mount('#reputation-container'),
        profileWidget.mount('#profile-container'),
        badgeWidget.mount('#badge-container'),
      ]);

      expect(
        document.querySelector('#reputation-container .dp-widget')
      ).not.toBeNull();
      expect(
        document.querySelector('#profile-container .dp-widget')
      ).not.toBeNull();
      expect(
        document.querySelector('#badge-container .dp-widget')
      ).not.toBeNull();

      // Cleanup
      reputationWidget.destroy();
      profileWidget.destroy();
      badgeWidget.destroy();
    });

    it('should allow independent updates', async () => {
      document.body.innerHTML = `
        <div id="widget1"></div>
        <div id="widget2"></div>
      `;

      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      const widget1 = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        theme: 'light',
      });
      const widget2 = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        theme: 'dark',
      });

      await widget1.mount('#widget1');
      await widget2.mount('#widget2');

      expect(document.querySelector('#widget1 .dp-theme-light')).not.toBeNull();
      expect(document.querySelector('#widget2 .dp-theme-dark')).not.toBeNull();

      // Update only widget1
      await widget1.update({ theme: 'dark' });

      expect(document.querySelector('#widget1 .dp-theme-dark')).not.toBeNull();
      expect(document.querySelector('#widget2 .dp-theme-dark')).not.toBeNull();

      widget1.destroy();
      widget2.destroy();
    });
  });

  describe('Theme Switching', () => {
    it('should switch themes via update', async () => {
      const container = createTestContainer();
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      const widget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        theme: 'light',
      });

      await widget.mount('#test-container');
      expect(container.querySelector('.dp-theme-light')).not.toBeNull();

      await widget.update({ theme: 'dark' });
      expect(container.querySelector('.dp-theme-dark')).not.toBeNull();
      expect(container.querySelector('.dp-theme-light')).toBeNull();

      widget.destroy();
      removeTestContainer();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from error on refresh', async () => {
      const container = createTestContainer();
      const onError = jest.fn();
      const onLoad = jest.fn();

      mockAxiosInstance.get
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        onError,
        onLoad,
      });

      await widget.mount('#test-container');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(container.querySelector('.dp-error')).not.toBeNull();

      await widget.refresh();
      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(container.querySelector('.dp-widget')).not.toBeNull();
      expect(container.querySelector('.dp-error')).toBeNull();

      widget.destroy();
      removeTestContainer();
    });

    it('should handle multiple consecutive errors', async () => {
      const container = createTestContainer();
      const onError = jest.fn();

      mockAxiosInstance.get
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        onError,
      });

      await widget.mount('#test-container');
      expect(onError).toHaveBeenCalledTimes(1);

      await widget.refresh();
      expect(onError).toHaveBeenCalledTimes(2);

      await widget.refresh();
      expect(container.querySelector('.dp-widget')).not.toBeNull();

      widget.destroy();
      removeTestContainer();
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in user-provided profile content', async () => {
      const container = createTestContainer();
      const maliciousProfile = {
        ...mockUserProfile,
        displayName: '<script>alert("xss")</script>',
        bio: '<img src="x" onerror="alert(\'xss\')">',
      };

      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(maliciousProfile)
      );

      const widget = new ProfileWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        type: 'profile',
        showBio: true,
      });

      await widget.mount('#test-container');

      // Script tags should be escaped, not executed
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.querySelector('script')).toBeNull();

      widget.destroy();
      removeTestContainer();
    });

    it('should escape HTML in category titles', async () => {
      const container = createTestContainer();
      const maliciousScores = {
        ...mockUserScores,
        categories: {
          malicious: {
            score: 100,
            reason: 'test',
            title: '<img src=x onerror=alert(1)>',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(maliciousScores)
      );

      const widget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        showCategories: true,
      });

      await widget.mount('#test-container');

      // The XSS payload should be escaped - no img element should exist
      expect(container.querySelector('img')).toBeNull();
      // The onerror handler should not be present as an attribute (< should be escaped to &lt;)
      expect(container.innerHTML).toContain('&lt;img');

      widget.destroy();
      removeTestContainer();
    });
  });

  describe('Configuration Options', () => {
    it('should apply all configuration options correctly', async () => {
      const container = createTestContainer();
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        showCategories: true,
        maxCategories: 2,
        compact: true,
        theme: 'dark',
        className: 'custom-class',
      });

      await widget.mount('#test-container');

      expect(container.classList.contains('custom-class')).toBe(true);
      expect(container.querySelector('.dp-theme-dark')).not.toBeNull();
      expect(container.querySelector('.dp-compact')).not.toBeNull();
      expect(container.querySelector('.dp-categories')).not.toBeNull();

      const categoryItems = container.querySelectorAll('.dp-category-item');
      expect(categoryItems.length).toBeLessThanOrEqual(2);

      widget.destroy();
      removeTestContainer();
    });
  });

  describe('Widget Type Switching', () => {
    it('should handle mounting different widget types to same container', async () => {
      const container = createTestContainer();

      // First mount reputation widget
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));
      const reputationWidget = new ReputationWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
      });
      await reputationWidget.mount('#test-container');
      expect(container.textContent).toContain('Reputation Score');

      // Destroy and mount profile widget
      reputationWidget.destroy();

      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));
      const profileWidget = new ProfileWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        type: 'profile',
      });
      await profileWidget.mount('#test-container');
      expect(container.textContent).toContain('Test User');

      profileWidget.destroy();
      removeTestContainer();
    });
  });

  describe('Category Widget with Different Categories', () => {
    it('should handle different category keys', async () => {
      const container = createTestContainer();
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockCategoryScore));

      const widget = new CategoryWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        type: 'category',
        categoryKey: 'longevity',
      });

      await widget.mount('#test-container');
      expect(container.textContent).toContain('Account Longevity');

      // Update to different category
      await widget.update({ categoryKey: 'governance' });

      widget.destroy();
      removeTestContainer();
    });
  });

  describe('Badge Widget Single vs Multiple', () => {
    it('should handle switching between single and multiple badge views', async () => {
      const container = createTestContainer();
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserBadges));

      const widget = new BadgeWidget({
        apiKey: 'test-api-key',
        address: TEST_ADDRESS,
        type: 'badge',
      });

      await widget.mount('#test-container');

      // Should show multiple badges
      const badgeItems = container.querySelectorAll('.dp-badge-item');
      expect(badgeItems.length).toBe(2);

      widget.destroy();
      removeTestContainer();
    });
  });
});
