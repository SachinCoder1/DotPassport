/**
 * Tests for ProfileWidget
 */
jest.mock('axios');

import { ProfileWidget } from '../ProfileWidget';
import { clearGlobalCache } from '../../client';
import { mockAxiosInstance, createMockResponse, resetAxiosMock } from '../../../__mocks__/axios';
import { TEST_ADDRESS, mockUserProfile } from '../../__tests__/mocks/apiResponses';
import {
  createTestContainer,
  removeTestContainer,
} from '../../__tests__/mocks/domHelpers';

describe('ProfileWidget', () => {
  let container: HTMLElement;

  beforeEach(() => {
    resetAxiosMock();
    clearGlobalCache();
    container = createTestContainer();
  });

  afterEach(() => {
    removeTestContainer();
  });

  const createWidget = (overrides = {}) => {
    return new ProfileWidget({
      apiKey: 'test-api-key',
      address: TEST_ADDRESS,
      type: 'profile',
      ...overrides,
    });
  };

  describe('Profile header', () => {
    it('should render profile widget with name', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-widget');
      expect(container.textContent).toContain('Test User');
    });

    it('should render address', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget();
      await widget.mount('#test-container');

      // Address should be truncated or shown
      expect(container.textContent).toContain('5Grw');
    });

    it('should render avatar when avatarUrl is provided', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget();
      await widget.mount('#test-container');

      // Check for img element or avatar URL in HTML
      expect(container.innerHTML).toContain('avatar');
    });

    it('should handle missing avatarUrl', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse({
          ...mockUserProfile,
          avatarUrl: undefined,
        })
      );

      const widget = createWidget();
      await widget.mount('#test-container');

      // Should render without errors
      expect(container.innerHTML).toContain('dp-widget');
    });

    it('should display "Anonymous" when displayName is missing', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse({
          ...mockUserProfile,
          displayName: undefined,
        })
      );

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.textContent).toContain('Anonymous');
    });
  });

  describe('Bio section', () => {
    it('should render bio when showBio is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ showBio: true });
      await widget.mount('#test-container');

      expect(container.textContent).toContain(mockUserProfile.bio);
    });

    it('should hide bio when showBio is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ showBio: false });
      await widget.mount('#test-container');

      expect(container.textContent).not.toContain(mockUserProfile.bio);
    });
  });

  describe('Social links', () => {
    it('should render social links when showSocials is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ showSocials: true });
      await widget.mount('#test-container');

      // Check for social link text
      expect(container.textContent).toContain('Twitter');
    });

    it('should hide social links when showSocials is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ showSocials: false });
      await widget.mount('#test-container');

      // Should not contain social platform names
      expect(container.textContent).not.toContain('Twitter');
    });

    it('should handle empty socialLinks', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse({
          ...mockUserProfile,
          socialLinks: {},
        })
      );

      const widget = createWidget({ showSocials: true });
      await widget.mount('#test-container');

      // Should render without errors
      expect(container.innerHTML).toContain('dp-widget');
    });
  });

  describe('Polkadot identities', () => {
    it('should render identities when showIdentities is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ showIdentities: true });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('TestIdentity');
    });

    it('should hide identities when showIdentities is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ showIdentities: false });
      await widget.mount('#test-container');

      // Identity display name should not appear
      expect(container.textContent).not.toContain('TestIdentity');
    });

    it('should handle empty polkadotIdentities', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse({
          ...mockUserProfile,
          polkadotIdentities: [],
        })
      );

      const widget = createWidget({ showIdentities: true });
      await widget.mount('#test-container');

      // Should render without errors
      expect(container.innerHTML).toContain('dp-widget');
    });
  });

  describe('Theme', () => {
    it('should apply light theme by default', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-theme-light');
    });

    it('should apply dark theme', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget({ theme: 'dark' });
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-theme-dark');
    });
  });

  describe('Lifecycle', () => {
    it('should call onLoad callback on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));
      const onLoad = jest.fn();

      const widget = createWidget({ onLoad });
      await widget.mount('#test-container');

      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('should render error state on API failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-error');
    });

    it('should use cached data on refresh', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserProfile));

      const widget = createWidget();
      await widget.mount('#test-container');
      await widget.refresh();

      // Refresh uses cached data, so only 1 API call
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should destroy correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

      const widget = createWidget();
      await widget.mount('#test-container');
      widget.destroy();

      expect(container.innerHTML).toBe('');
    });
  });
});
