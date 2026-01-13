/**
 * Tests for DotPassportClient
 */
jest.mock('axios');

import { DotPassportClient, DotPassportError, DotPassportConfig, clearGlobalCache } from '../client';
import { mockAxiosInstance, createMockResponse, createMockError, resetAxiosMock } from '../../__mocks__/axios';
import {
  TEST_ADDRESS,
  mockUserProfile,
  mockUserScores,
  mockUserBadges,
  mockSpecificBadgeEarned,
  mockCategoryScore,
  mockBadgeDefinitions,
  mockCategoryDefinitions,
} from './mocks/apiResponses';

describe('DotPassportClient', () => {
  let client: DotPassportClient;
  const validConfig: DotPassportConfig = {
    apiKey: 'test-api-key-12345',
    baseUrl: 'https://api.test.com',
  };

  beforeEach(() => {
    resetAxiosMock();
    clearGlobalCache();
    client = new DotPassportClient(validConfig);
  });

  describe('Constructor', () => {
    it('should throw error when apiKey is missing', () => {
      expect(() => new DotPassportClient({ apiKey: '' })).toThrow('API key is required');
    });

    it('should throw error when apiKey is undefined', () => {
      expect(() => new DotPassportClient({ apiKey: undefined as any })).toThrow(
        'API key is required'
      );
    });

    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(DotPassportClient);
    });

    it('should use default baseUrl when not provided', () => {
      const clientWithDefaults = new DotPassportClient({ apiKey: 'test' });
      expect(clientWithDefaults).toBeInstanceOf(DotPassportClient);
    });

    it('should apply custom headers when provided', () => {
      const clientWithHeaders = new DotPassportClient({
        apiKey: 'test',
        customHeaders: { 'X-Custom-Header': 'value' },
      });
      expect(clientWithHeaders).toBeInstanceOf(DotPassportClient);
    });
  });

  describe('API Methods', () => {
    describe('getProfile', () => {
      it('should fetch user profile successfully', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

        const result = await client.getProfile(TEST_ADDRESS);

        expect(result).toEqual(mockUserProfile);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/profiles/${TEST_ADDRESS}`,
          { signal: undefined }
        );
      });

      it('should support AbortSignal', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));
        const controller = new AbortController();

        await client.getProfile(TEST_ADDRESS, controller.signal);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ signal: controller.signal })
        );
      });
    });

    describe('getScores', () => {
      it('should fetch user scores successfully', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

        const result = await client.getScores(TEST_ADDRESS);

        expect(result).toEqual(mockUserScores);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/scores/${TEST_ADDRESS}`,
          expect.any(Object)
        );
      });

      it('should support AbortSignal', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));
        const controller = new AbortController();

        await client.getScores(TEST_ADDRESS, controller.signal);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ signal: controller.signal })
        );
      });
    });

    describe('getCategoryScore', () => {
      it('should fetch specific category score', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

        const result = await client.getCategoryScore(TEST_ADDRESS, 'longevity');

        expect(result).toEqual(mockCategoryScore);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/scores/${TEST_ADDRESS}/longevity`,
          expect.any(Object)
        );
      });

      it('should support AbortSignal', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));
        const controller = new AbortController();

        await client.getCategoryScore(TEST_ADDRESS, 'longevity', controller.signal);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ signal: controller.signal })
        );
      });
    });

    describe('getBadges', () => {
      it('should fetch user badges successfully', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

        const result = await client.getBadges(TEST_ADDRESS);

        expect(result).toEqual(mockUserBadges);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/badges/${TEST_ADDRESS}`,
          expect.any(Object)
        );
      });
    });

    describe('getBadge', () => {
      it('should fetch specific badge', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockSpecificBadgeEarned));

        const result = await client.getBadge(TEST_ADDRESS, 'early_adopter');

        expect(result).toEqual(mockSpecificBadgeEarned);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/badges/${TEST_ADDRESS}/early_adopter`,
          expect.any(Object)
        );
      });
    });

    describe('getBadgeDefinitions', () => {
      it('should fetch badge definitions', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockBadgeDefinitions));

        const result = await client.getBadgeDefinitions();

        expect(result).toEqual(mockBadgeDefinitions);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/metadata/badges');
      });
    });

    describe('getCategoryDefinitions', () => {
      it('should fetch category definitions', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryDefinitions));

        const result = await client.getCategoryDefinitions();

        expect(result).toEqual(mockCategoryDefinitions);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/metadata/categories');
      });
    });
  });

  describe('Widget API Methods (with caching)', () => {
    describe('getWidgetReputation', () => {
      it('should fetch reputation data', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

        const result = await client.getWidgetReputation(TEST_ADDRESS);

        expect(result).toEqual(mockUserScores);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/widget/reputation/${TEST_ADDRESS}`,
          expect.any(Object)
        );
      });

      it('should cache reputation data', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));

        const result1 = await client.getWidgetReputation(TEST_ADDRESS);
        const result2 = await client.getWidgetReputation(TEST_ADDRESS);

        expect(result1).toEqual(mockUserScores);
        expect(result2).toEqual(mockUserScores);
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1); // Cached
      });

      it('should bypass cache with forceRefresh', async () => {
        mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

        await client.getWidgetReputation(TEST_ADDRESS);
        await client.getWidgetReputation(TEST_ADDRESS, undefined, true);

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      });

      it('should support AbortSignal', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserScores));
        const controller = new AbortController();

        await client.getWidgetReputation(TEST_ADDRESS, controller.signal);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ signal: controller.signal })
        );
      });
    });

    describe('getWidgetProfile', () => {
      it('should fetch and cache profile data', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

        const result = await client.getWidgetProfile(TEST_ADDRESS);

        expect(result).toEqual(mockUserProfile);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/widget/profile/${TEST_ADDRESS}`,
          expect.any(Object)
        );
      });

      it('should use cache on subsequent calls', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserProfile));

        await client.getWidgetProfile(TEST_ADDRESS);
        await client.getWidgetProfile(TEST_ADDRESS);

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      });

      it('should bypass cache with forceRefresh', async () => {
        mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserProfile));

        await client.getWidgetProfile(TEST_ADDRESS);
        await client.getWidgetProfile(TEST_ADDRESS, undefined, true);

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });

    describe('getWidgetBadges', () => {
      it('should fetch badges without badgeKey', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

        const result = await client.getWidgetBadges(TEST_ADDRESS);

        expect(result).toEqual(mockUserBadges);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/widget/badge/${TEST_ADDRESS}`,
          expect.objectContaining({
            params: {},
          })
        );
      });

      it('should fetch specific badge with badgeKey', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockSpecificBadgeEarned));

        const result = await client.getWidgetBadges(TEST_ADDRESS, 'early_adopter');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/widget/badge/${TEST_ADDRESS}`,
          expect.objectContaining({
            params: { badgeKey: 'early_adopter' },
          })
        );
      });

      it('should cache badge data', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockUserBadges));

        await client.getWidgetBadges(TEST_ADDRESS);
        await client.getWidgetBadges(TEST_ADDRESS);

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      });

      it('should cache separately for different badgeKeys', async () => {
        mockAxiosInstance.get
          .mockResolvedValueOnce(createMockResponse(mockUserBadges))
          .mockResolvedValueOnce(createMockResponse(mockSpecificBadgeEarned));

        await client.getWidgetBadges(TEST_ADDRESS);
        await client.getWidgetBadges(TEST_ADDRESS, 'early_adopter');

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });

    describe('getWidgetCategory', () => {
      it('should fetch category with categoryKey', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

        const result = await client.getWidgetCategory(TEST_ADDRESS, 'longevity');

        expect(result).toEqual(mockCategoryScore);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/api/v2/widget/category/${TEST_ADDRESS}`,
          expect.objectContaining({
            params: { categoryKey: 'longevity' },
          })
        );
      });

      it('should cache category data', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockCategoryScore));

        await client.getWidgetCategory(TEST_ADDRESS, 'longevity');
        await client.getWidgetCategory(TEST_ADDRESS, 'longevity');

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      });

      it('should cache separately for different categoryKeys', async () => {
        mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockCategoryScore));

        await client.getWidgetCategory(TEST_ADDRESS, 'longevity');
        await client.getWidgetCategory(TEST_ADDRESS, 'governance');

        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Cache Management', () => {
    it('clearCache should clear all cached data', async () => {
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      await client.getWidgetReputation(TEST_ADDRESS);
      client.clearCache();
      await client.getWidgetReputation(TEST_ADDRESS);

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('clearCacheForAddress should only clear cache for specific address', async () => {
      const address2 = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      await client.getWidgetReputation(TEST_ADDRESS);
      await client.getWidgetReputation(address2);

      client.clearCacheForAddress(TEST_ADDRESS);

      await client.getWidgetReputation(TEST_ADDRESS);
      await client.getWidgetReputation(address2);

      // 3 total: 2 initial + 1 after clearing address1 (address2 still cached)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
    });

    it('clearCacheForAddress should not affect other addresses', async () => {
      const address2 = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      mockAxiosInstance.get.mockResolvedValue(createMockResponse(mockUserScores));

      await client.getWidgetReputation(TEST_ADDRESS);
      await client.getWidgetReputation(address2);

      client.clearCacheForAddress(TEST_ADDRESS);

      // This should be cached (not cleared)
      await client.getWidgetReputation(address2);

      // Only 2 calls: initial fetches, address2 is still cached
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw DotPassportError on API error response', async () => {
      const error = new DotPassportError('Not found', 404, { message: 'Not found' });
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.getProfile(TEST_ADDRESS)).rejects.toThrow(DotPassportError);
    });

    it('should include status code in DotPassportError', async () => {
      const error = new DotPassportError('Not found', 404);
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      try {
        await client.getProfile(TEST_ADDRESS);
        fail('Expected error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(DotPassportError);
        expect((e as DotPassportError).statusCode).toBe(404);
      }
    });

    it('should include response data in DotPassportError', async () => {
      const responseData = { message: 'User not found', code: 'USER_NOT_FOUND' };
      const error = new DotPassportError('Not found', 404, responseData);
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      try {
        await client.getProfile(TEST_ADDRESS);
        fail('Expected error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(DotPassportError);
        expect((e as DotPassportError).response).toEqual(responseData);
      }
    });

    it('should handle network errors without response', async () => {
      const error = new DotPassportError('Network Error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.getProfile(TEST_ADDRESS)).rejects.toThrow('Network Error');
    });
  });

  describe('DotPassportError', () => {
    it('should have correct name', () => {
      const error = new DotPassportError('Test error');
      expect(error.name).toBe('DotPassportError');
    });

    it('should include message', () => {
      const error = new DotPassportError('Test error message');
      expect(error.message).toBe('Test error message');
    });

    it('should include statusCode when provided', () => {
      const error = new DotPassportError('Test error', 500);
      expect(error.statusCode).toBe(500);
    });

    it('should include response when provided', () => {
      const response = { error: 'details' };
      const error = new DotPassportError('Test error', 500, response);
      expect(error.response).toEqual(response);
    });
  });
});
