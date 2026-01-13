/**
 * Tests for BadgeWidget
 */
jest.mock('axios');

import { BadgeWidget } from '../BadgeWidget';
import { clearGlobalCache } from '../../client';
import { mockAxiosInstance, createMockResponse, resetAxiosMock } from '../../../__mocks__/axios';
import {
  TEST_ADDRESS,
  mockUserBadges,
  mockSpecificBadgeEarned,
  mockSpecificBadgeNotEarned,
} from '../../__tests__/mocks/apiResponses';
import {
  createTestContainer,
  removeTestContainer,
} from '../../__tests__/mocks/domHelpers';

describe('BadgeWidget', () => {
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
    return new BadgeWidget({
      apiKey: 'test-api-key',
      address: TEST_ADDRESS,
      type: 'badge',
      ...overrides,
    });
  };

  describe('Multiple badges display', () => {
    it('should render badge widget with multiple badges', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-widget');
    });

    it('should display badges', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const widget = createWidget();
      await widget.mount('#test-container');

      // Check badge titles appear
      expect(container.textContent).toContain('Gold Early Adopter');
      expect(container.textContent).toContain('Silver Governance Voter');
    });

    it('should limit badges with maxBadges', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const widget = createWidget({ maxBadges: 1 });
      await widget.mount('#test-container');

      // First badge should appear, second should not
      expect(container.textContent).toContain('Gold Early Adopter');
      expect(container.textContent).not.toContain('Silver Governance Voter');
    });

    it('should show "No badges earned" message when empty', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse({
          ...mockUserBadges,
          badges: [],
          count: 0,
        })
      );

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.textContent).toContain('No badges earned');
    });
  });

  describe('Single badge display', () => {
    it('should render single earned badge', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(mockSpecificBadgeEarned)
      );

      const widget = createWidget({ badgeKey: 'early_adopter' });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('Gold Early Adopter');
    });

    it('should render "not earned" state for unearned badge', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(mockSpecificBadgeNotEarned)
      );

      const widget = createWidget({ badgeKey: 'whale' });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('Badge not yet earned');
    });

    it('should show badge definition for unearned badge', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(mockSpecificBadgeNotEarned)
      );

      const widget = createWidget({ badgeKey: 'whale' });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('Whale');
    });

    it('should pass badgeKey to API', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(mockSpecificBadgeEarned)
      );

      const widget = createWidget({ badgeKey: 'early_adopter' });
      await widget.mount('#test-container');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/widget/badge/'),
        expect.objectContaining({
          params: { badgeKey: 'early_adopter' },
        })
      );
    });
  });

  describe('Badge display options', () => {
    it('should show earned date when showProgress is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const widget = createWidget({ showProgress: true });
      await widget.mount('#test-container');

      // Check if formatted date is shown
      expect(container.textContent).toContain('Jan 10, 2024');
    });

    it('should apply dark theme', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const widget = createWidget({ theme: 'dark' });
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-theme-dark');
    });
  });

  describe('Error handling', () => {
    it('should render error state on API failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-error');
    });

    it('should call onError callback on failure', async () => {
      const error = new Error('API Error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      const onError = jest.fn();

      const widget = createWidget({ onError });
      await widget.mount('#test-container');

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('Lifecycle', () => {
    it('should use cached data on refresh', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserBadges));

      const widget = createWidget();
      await widget.mount('#test-container');
      await widget.refresh();

      // Refresh uses cached data, so only 1 API call
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should re-fetch when address changes', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserBadges));

      const widget = createWidget();
      await widget.mount('#test-container');

      const newAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      await widget.update({ address: newAddress });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should destroy correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

      const widget = createWidget();
      await widget.mount('#test-container');
      widget.destroy();

      expect(container.innerHTML).toBe('');
    });
  });
});
