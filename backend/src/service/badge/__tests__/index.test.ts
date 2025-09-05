// --- Mocking ALL External Dependencies ---
// This must be at the top of the file, before any imports from the service itself.
import * as subscanService from '~/service/subscan';
jest.mock('~/service/subscan');
import * as kodadotService from '~/service/kodadot';
jest.mock('~/service/kodadot');

// --- Import the function to be tested AFTER mocks are set up ---
import { checkUserBadges } from '..';
import { BadgeKey } from '../badgeDefinitions';
import { polkadotAddress } from '~/test/helper';

const ADDRESS = polkadotAddress;

// Create typed mocks for all the service's dependencies for easy use in tests
const mockedFetchExtrinsicsList = subscanService.fetchExtrinsicsList as jest.Mock;
const mockedFetchAccountAgeDays = subscanService.fetchAccountAgeDays as jest.Mock;
const mockedFetchReferendaVotes = subscanService.fetchReferendaVotes as jest.Mock;
const mockedFetchAccountRewardSlashList = subscanService.fetchAccountRewardSlashList as jest.Mock;
const mockedFetchAccountTokenList = subscanService.fetchAccountTokenList as jest.Mock;
const mockedGetOwnedNfts = kodadotService.getOwnedNfts as jest.Mock;

describe('Badge Service: checkUserBadges', () => {

  // Before each test, reset all mocks to their default "zero" state.
  // This ensures that tests are isolated and don't interfere with each other.
  beforeEach(() => {
    jest.clearAllMocks();

    // Provide default "zero" values for all mocked dependencies
    mockedFetchExtrinsicsList.mockResolvedValue({ count: 0, extrinsics: [] });
    mockedFetchAccountAgeDays.mockResolvedValue(0);
    mockedFetchReferendaVotes.mockResolvedValue({ count: 0, list: [] });
    mockedFetchAccountRewardSlashList.mockResolvedValue({ count: 0, list: [] });
    mockedFetchAccountTokenList.mockResolvedValue([]);
    mockedGetOwnedNfts.mockResolvedValue({ totalCount: 0, data: [] });
  });

  it('should return an empty object if metrics do not meet any badge criteria', async () => {
    // Arrange: We are using the default "zero" mocks from beforeEach

    // Act
    const earnedBadges = await checkUserBadges(ADDRESS);

    // Assert
    expect(earnedBadges).toEqual({}); // Expect an empty object
  });

  it('should award the highest achieved level for a multi-level badge', async () => {
    // Arrange: Override the mock to return a high value for a specific metric.
    // 400 days is enough for Level 2 of PolkadotRegular (value: 365)
    mockedFetchAccountAgeDays.mockResolvedValue(400);

    // Act
    const earnedBadges = await checkUserBadges(ADDRESS);
    
    // Assert
    expect(earnedBadges).toHaveProperty(BadgeKey.PolkadotRegular);
    expect(earnedBadges[BadgeKey.PolkadotRegular]).toBe(2); // Level 2
  });

  it('should award multiple different badges if multiple criteria are met', async () => {
    // Arrange: Override multiple mocks
    mockedFetchAccountAgeDays.mockResolvedValue(100); // PolkadotRegular Level 1
    mockedFetchReferendaVotes.mockResolvedValue({ count: 6, list: [] }); // ReferendumVoter Level 2

    // Act
    const earnedBadges = await checkUserBadges(ADDRESS);

    // Assert
    expect(Object.keys(earnedBadges)).toHaveLength(2); // Should have exactly 2 badges
    expect(earnedBadges[BadgeKey.PolkadotRegular]).toBe(1);
    expect(earnedBadges[BadgeKey.ReferendumVoter]).toBe(2);
  });

  it('should correctly award the special TrustedNominator badge', async () => {
    // Arrange: This badge requires nominator activity AND zero slashes.
    
    // Simulate 7 months of staking activity. The service calculates this based on the
    // timestamp of the user's first reward.
    const sevenMonthsAgoInSeconds = Math.floor((Date.now() / 1000) - (7 * 30.44 * 24 * 60 * 60));
    
    // The service fetches the first page of rewards to get the total count...
    mockedFetchAccountRewardSlashList.mockImplementation(async (params) => {
      if (params.category === 'Reward' && params.row === 1) {
        return { count: 1, list: [] }; // The service only needs the count here
      }
      // ...then fetches the last page to find the first reward.
      if (params.category === 'Reward' && params.page === 0) {
        return { count: 1, list: [{ block_timestamp: sevenMonthsAgoInSeconds }] };
      }
      // For slash checks, return 0.
      if (params.category === 'Slash') {
        return { count: 0, list: [] };
      }
      return { count: 0, list: [] };
    });

    // Act
    const earnedBadges = await checkUserBadges(ADDRESS);

    // Assert
    // The user has more than 6 months of activity and 0 slashes.
    expect(earnedBadges).toHaveProperty(BadgeKey.TrustedNominator);
    expect(earnedBadges[BadgeKey.TrustedNominator]).toBe(1);
  });
});