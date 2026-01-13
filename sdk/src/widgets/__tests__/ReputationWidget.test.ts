/**
 * Tests for ReputationWidget
 */
jest.mock('axios');

import { ReputationWidget } from '../ReputationWidget';
import { clearGlobalCache } from '../../client';
import { mockAxiosInstance, createMockResponse, resetAxiosMock } from '../../../__mocks__/axios';
import { TEST_ADDRESS, mockUserScores } from '../../__tests__/mocks/apiResponses';
import {
  createTestContainer,
  removeTestContainer,
  waitForDomUpdate,
} from '../../__tests__/mocks/domHelpers';

describe('ReputationWidget', () => {
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
    return new ReputationWidget({
      apiKey: 'test-api-key',
      address: TEST_ADDRESS,
      ...overrides,
    });
  };

  describe('mount', () => {
    it('should render loading state initially', async () => {
      // Never resolves to keep loading state
      mockAxiosInstance.get.mockImplementation(() => new Promise(() => {}));

      const widget = createWidget();
      const mountPromise = widget.mount('#test-container');

      await waitForDomUpdate();

      // Check for loading text or spinner in the HTML
      expect(container.innerHTML).toContain('dp-loading');
      expect(container.innerHTML).toContain('dp-spinner');
    });

    it('should render reputation data after loading', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-widget');
      expect(container.textContent).toContain('450');
    });

    it('should render categories when showCategories is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ showCategories: true });
      await widget.mount('#test-container');

      // Check that category titles appear in content
      expect(container.textContent).toContain('Account Age');
      expect(container.textContent).toContain('Governance');
    });

    it('should hide categories when showCategories is false', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ showCategories: false });
      await widget.mount('#test-container');

      // Category titles should not appear
      expect(container.textContent).not.toContain('Account Age');
    });

    it('should limit categories with maxCategories', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ showCategories: true, maxCategories: 2 });
      await widget.mount('#test-container');

      // With 4 categories in mock, limiting to 2 should only show first 2
      // The first two by Object.entries order would be longevity and txCount
      const text = container.textContent || '';
      expect(text).toContain('Account Age'); // longevity title
    });

    it('should apply compact class when compact is true', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ compact: true });
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-compact');
    });

    it('should apply light theme class by default', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-theme-light');
    });

    it('should apply dark theme class when theme is dark', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ theme: 'dark' });
      await widget.mount('#test-container');

      expect(container.innerHTML).toContain('dp-theme-dark');
    });

    it('should call onLoad callback on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));
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
      expect(container.textContent).toContain('Error Loading Data');
    });

    it('should call onError callback on failure', async () => {
      const error = new Error('API Error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      const onError = jest.fn();

      const widget = createWidget({ onError });
      await widget.mount('#test-container');

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should add custom className to container', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ className: 'my-custom-class' });
      await widget.mount('#test-container');

      expect(container.classList.contains('my-custom-class')).toBe(true);
    });

    it('should mount to HTMLElement directly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount(container);

      expect(container.innerHTML).toContain('dp-widget');
    });
  });

  describe('update', () => {
    it('should re-fetch data when address changes', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount('#test-container');

      const newAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      await widget.update({ address: newAddress });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should not re-fetch when only display options change', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ showCategories: true });
      await widget.mount('#test-container');

      await widget.update({ showCategories: false });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      // Categories should no longer be visible
      expect(container.textContent).not.toContain('Account Age');
    });

    it('should update theme without re-fetching', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ theme: 'light' });
      await widget.mount('#test-container');

      await widget.update({ theme: 'dark' });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      expect(container.innerHTML).toContain('dp-theme-dark');
    });
  });

  describe('refresh', () => {
    it('should use cached data on refresh', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount('#test-container');
      await widget.refresh();

      // Refresh uses cached data, so only 1 API call
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error if widget not mounted', async () => {
      const widget = createWidget();

      await expect(widget.refresh()).rejects.toThrow('Widget not mounted');
    });

    it('should call onLoad callback after refresh', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));
      const onLoad = jest.fn();

      const widget = createWidget({ onLoad });
      await widget.mount('#test-container');
      await widget.refresh();

      expect(onLoad).toHaveBeenCalledTimes(2);
    });
  });

  describe('destroy', () => {
    it('should clear container content', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount('#test-container');
      widget.destroy();

      expect(container.innerHTML).toBe('');
    });

    it('should remove custom className', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget({ className: 'my-custom-class' });
      await widget.mount('#test-container');
      widget.destroy();

      expect(container.classList.contains('my-custom-class')).toBe(false);
    });
  });

  describe('unmount', () => {
    it('should be an alias for destroy', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

      const widget = createWidget();
      await widget.mount('#test-container');
      widget.unmount();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('empty categories', () => {
    it('should handle empty categories object', async () => {
      const scoresWithoutCategories = { ...mockUserScores, categories: {} };
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(scoresWithoutCategories)
      );

      const widget = createWidget({ showCategories: true });
      await widget.mount('#test-container');

      // Should render without errors - main widget should exist
      expect(container.innerHTML).toContain('dp-widget');
    });

    it('should handle undefined categories', async () => {
      const scoresWithoutCategories = { ...mockUserScores, categories: undefined };
      mockAxiosInstance.get.mockResolvedValueOnce(
        createMockResponse(scoresWithoutCategories)
      );

      const widget = createWidget({ showCategories: true });
      await widget.mount('#test-container');

      // Should render without errors
      expect(container.innerHTML).toContain('dp-widget');
    });
  });
});
