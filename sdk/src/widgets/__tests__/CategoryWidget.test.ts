/**
 * Tests for CategoryWidget
 */
jest.mock('axios');

import { CategoryWidget } from '../CategoryWidget';
import { clearGlobalCache } from '../../client';
import { mockAxiosInstance, createMockResponse, resetAxiosMock } from '../../../__mocks__/axios';
import { TEST_ADDRESS, mockCategoryScore } from '../../__tests__/mocks/apiResponses';
import {
  createTestContainer,
  removeTestContainer,
} from '../../__tests__/mocks/domHelpers';

describe('CategoryWidget', () => {
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
    return new CategoryWidget({
      apiKey: 'test-api-key',
      address: TEST_ADDRESS,
      type: 'category',
      categoryKey: 'longevity',
      ...overrides,
    });
  };

  describe('Basic rendering', () => {
    it('should render category widget with score', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-widget')).not.toBeNull();
      expect(container.textContent).toContain('100');
    });

    it('should pass categoryKey to API', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ categoryKey: 'governance' });
      await widget.mount('#test-container');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/widget/category/'),
        expect.objectContaining({
          params: { categoryKey: 'governance' },
        })
      );
    });
  });

  describe('Display options', () => {
    it('should show title when showTitle is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showTitle: true });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('Account Longevity');
    });

    it('should hide title when showTitle is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showTitle: false });
      await widget.mount('#test-container');

      // The category name should not be prominently displayed
      expect(container.querySelector('.dp-category-title')).toBeNull();
    });

    it('should show description when showDescription is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showDescription: true });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('How long your account has been active');
    });

    it('should hide description when showDescription is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showDescription: false });
      await widget.mount('#test-container');

      // Check description is not shown
      expect(container.querySelector('.dp-category-desc')).toBeNull();
    });

    it('should show breakdown when showBreakdown is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showBreakdown: true });
      await widget.mount('#test-container');

      // Should show breakdown section
      expect(container.querySelector('.dp-breakdown')).not.toBeNull();
    });

    it('should hide breakdown when showBreakdown is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showBreakdown: false });
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-breakdown')).toBeNull();
    });

    it('should show advice when showAdvice is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showAdvice: true });
      await widget.mount('#test-container');

      expect(container.textContent).toContain('Keep your account active');
    });

    it('should hide advice when showAdvice is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showAdvice: false });
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-advice')).toBeNull();
    });
  });

  describe('Score-only mode', () => {
    it('should render minimal view when showScoreOnly is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ showScoreOnly: true });
      await widget.mount('#test-container');

      // Should not have breakdown or advice
      expect(container.querySelector('.dp-breakdown')).toBeNull();
      expect(container.querySelector('.dp-advice')).toBeNull();

      // But should have score
      expect(container.textContent).toContain('100');
    });
  });

  describe('Compact mode', () => {
    it('should apply compact class when compact is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ compact: true });
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-compact')).not.toBeNull();
    });
  });

  describe('Theme', () => {
    it('should apply light theme by default', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-theme-light')).not.toBeNull();
    });

    it('should apply dark theme', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget({ theme: 'dark' });
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-theme-dark')).not.toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should render error state on API failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.querySelector('.dp-error')).not.toBeNull();
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
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockCategoryScore));

      const widget = createWidget();
      await widget.mount('#test-container');
      await widget.refresh();

      // Refresh uses cached data, so only 1 API call
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should re-fetch when address changes', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockCategoryScore));

      const widget = createWidget();
      await widget.mount('#test-container');

      const newAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      await widget.update({ address: newAddress });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should destroy correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

      const widget = createWidget();
      await widget.mount('#test-container');
      widget.destroy();

      expect(container.innerHTML).toBe('');
    });

    it('should call onLoad callback on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));
      const onLoad = jest.fn();

      const widget = createWidget({ onLoad });
      await widget.mount('#test-container');

      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  describe('Null definition', () => {
    it('should handle null definition gracefully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse({
          ...mockCategoryScore,
          definition: null,
        })
      );

      const widget = createWidget();
      await widget.mount('#test-container');

      // Should render without errors
      expect(container.querySelector('.dp-widget')).not.toBeNull();
    });
  });
});
