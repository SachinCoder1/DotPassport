import { HttpError } from '~/errors/HttpError';
import {
  fetchBalanceHistory,
  fetchAccountTokenList,
  fetchStakingRewardSum,
  fetchTransfersList,
  fetchEventsList,
  fetchNominatorInfo,
  fetchVotedValidatorsList,
  fetchAccountRewardSlashList,
  fetchExtrinsicsList,
  fetchReferendaVotes,
  fetchAccountAgeDays,
  fetchAccountDetailsByAddress,
} from '..'; 

// Import the client that we need to mock
import * as subscanClient from '../subscanClient';
import { polkadotAddress } from '~/test/helper';

// --- The Mock Setup ---
jest.mock('../subscanClient');

// Create a typed mock for the function we want to control
const mockedSubscanRequest = subscanClient.subscanRequest as jest.Mock;

// Use the real address provided by the user for all tests
const TEST_ADDRESS = polkadotAddress;

// Before each test, clear any previous mock history to ensure test isolation
beforeEach(() => {
  mockedSubscanRequest.mockClear();
});

describe('Subscan Service Functions', () => {

  describe('fetchBalanceHistory', () => {
    it('should call the correct endpoint and return the history', async () => {
      const mockHistory = [{ balance: '100', date: '2025-09-05' }];
      mockedSubscanRequest.mockResolvedValue({ data: { history: mockHistory } });
      const params = { address: TEST_ADDRESS, start: '2025-01-01', end: '2025-09-05' };
      
      const result = await fetchBalanceHistory(params.address, params.start, params.end);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/account/balance_history', params);
      expect(result).toEqual(mockHistory);
    });
  });
  
  describe('fetchAccountTokenList', () => {
    it('should call the correct endpoint and return native tokens', async () => {
      const mockTokens = [{ symbol: 'DOT', balance: '123' }];
      mockedSubscanRequest.mockResolvedValue({ data: { native: mockTokens } });
      
      const result = await fetchAccountTokenList(TEST_ADDRESS);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/account/tokens', { address: TEST_ADDRESS });
      expect(result).toEqual(mockTokens);
    });
  });
  
  describe('fetchStakingRewardSum', () => {
    it('should call the correct endpoint with all params and return the sum', async () => {
      mockedSubscanRequest.mockResolvedValue({ data: { sum: 987.65 } });
      const params = { address: TEST_ADDRESS, start: '2025-01-01', end: '2025-09-05', block_range: '1-100' };

      const result = await fetchStakingRewardSum(params);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/staking/total_reward', params);
      expect(result).toBe(987.65);
    });
  });

  describe('fetchTransfersList', () => {
    it('should call the correct endpoint with default values', async () => {
      mockedSubscanRequest.mockResolvedValue({ data: { count: 0, transfers: [] } });
      
      await fetchTransfersList({ address: TEST_ADDRESS });

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/v2/scan/transfers', {
        address: TEST_ADDRESS,
        order: 'desc',
        page: 0,
        row: 100,
      });
    });
  });

  describe('fetchEventsList', () => {
    it('should call the correct endpoint and pass optional params', async () => {
      mockedSubscanRequest.mockResolvedValue({ data: { count: 0, events: [] } });
      const params = { address: TEST_ADDRESS, module: 'System', finalized: true };
      
      await fetchEventsList(params);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/v2/scan/events', {
        ...params,
        order: 'desc',
        page: 0,
        row: 100
      });
    });
  });
  
  describe('fetchNominatorInfo', () => {
    it('should call the correct endpoint and return nominator data', async () => {
      const mockNominatorData = { nominator_stash: TEST_ADDRESS, status: 'active' };
      mockedSubscanRequest.mockResolvedValue({ data: mockNominatorData });
      
      const result = await fetchNominatorInfo(TEST_ADDRESS);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/staking/nominator', { address: TEST_ADDRESS });
      expect(result).toEqual(mockNominatorData);
    });
  });
  
  describe('fetchVotedValidatorsList', () => {
    it('should call the correct endpoint and return the list of validators', async () => {
      const mockValidators = [{ rank_validator: 1, status: 'active' }];
      mockedSubscanRequest.mockResolvedValue({ data: { list: mockValidators } });
      
      const result = await fetchVotedValidatorsList(TEST_ADDRESS);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/staking/voted', { address: TEST_ADDRESS });
      expect(result).toEqual(mockValidators);
    });
  });
  
  describe('fetchAccountRewardSlashList', () => {
    it('should call the correct endpoint and return the list', async () => {
      const mockList = [{ era: 123, amount: '1000' }];
      mockedSubscanRequest.mockResolvedValue({ data: { count: 1, list: mockList } });
      const params = { address: TEST_ADDRESS, category: 'Reward' as const };

      const result = await fetchAccountRewardSlashList(params);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/account/reward_slash', { ...params, page: 0, row: 100 });
      expect(result.list).toEqual(mockList);
    });
  });

  describe('fetchExtrinsicsList', () => {
    it('should call the correct endpoint and return extrinsics', async () => {
      const mockExtrinsics = [{ id: 1, success: true }];
      mockedSubscanRequest.mockResolvedValue({ data: { count: 1, extrinsics: mockExtrinsics } });
      
      const result = await fetchExtrinsicsList({ address: TEST_ADDRESS });

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/v2/scan/extrinsics', { address: TEST_ADDRESS, order: 'asc', page: 0, row: 100 });
      expect(result.extrinsics).toEqual(mockExtrinsics);
    });
  });
  
  describe('fetchReferendaVotes', () => {
    it('should call the correct endpoint and return votes list', async () => {
      const mockVotes = [{ referendum_index: 1, status: 'Ayes' }];
      mockedSubscanRequest.mockResolvedValue({ data: { count: 1, list: mockVotes } });
      
      const result = await fetchReferendaVotes({ account: TEST_ADDRESS });

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/scan/referenda/votes', { account: TEST_ADDRESS, order: 'desc', page: 0, row: 100 });
      expect(result.list).toEqual(mockVotes);
    });
  });

  describe('fetchAccountAgeDays', () => {
    it('should call fetchExtrinsicsList and correctly calculate age', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-09-15T00:00:00.000Z'));
      const tenDaysAgoSeconds = Math.floor(new Date('2025-09-05T00:00:00.000Z').getTime() / 1000);
      mockedSubscanRequest.mockResolvedValue({ data: { extrinsics: [{ block_timestamp: tenDaysAgoSeconds }] } });

      const age = await fetchAccountAgeDays(TEST_ADDRESS);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/v2/scan/extrinsics', { address: TEST_ADDRESS, order: 'asc', page: 0, row: 1 });
      expect(age).toBe(10);
      jest.useRealTimers();
    });
  });

  describe('fetchAccountDetailsByAddress', () => {
    it('should call the correct endpoint and return the data', async () => {
      const mockDetails = { account: { address: TEST_ADDRESS, nonce: 5 } };
      mockedSubscanRequest.mockResolvedValue({ data: mockDetails });
      
      const result = await fetchAccountDetailsByAddress(TEST_ADDRESS);

      expect(mockedSubscanRequest).toHaveBeenCalledWith('/api/v2/scan/search', { address: TEST_ADDRESS });
      expect(result).toEqual(mockDetails);
    });
  });
});