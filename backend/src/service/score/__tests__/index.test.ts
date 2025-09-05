import mongoose from 'mongoose';
import { User } from '~/models/User';
import { Category } from '~/models/Category';
import { Score } from '~/models/Score';
import { ScoreRefreshStatus } from '../types';
import { CategoryKey } from '../scoreDefinitions';

// Mocking ALL External Dependencies
import * as subscanService from '../../subscan';
jest.mock('../../subscan');
import * as kodadotService from '../../kodadot';
jest.mock('../../kodadot');

// Import the functions to be tested AFTER mocks are set up
import { calculateScore, updateUserScore } from '..';
import { polkadotAddress } from '~/test/helper';

const ADDRESS = polkadotAddress;

// Create typed mocks for all dependencies
const mockedFetchAccountAgeDays = subscanService.fetchAccountAgeDays as jest.Mock;
const mockedFetchTransfersList = subscanService.fetchTransfersList as jest.Mock;
const mockedFetchExtrinsicsList = subscanService.fetchExtrinsicsList as jest.Mock;
const mockedFetchReferendaVotes = subscanService.fetchReferendaVotes as jest.Mock;
const mockedFetchAccountRewardSlashList = subscanService.fetchAccountRewardSlashList as jest.Mock;
const mockedFetchVotedValidatorsList = subscanService.fetchVotedValidatorsList as jest.Mock;
const mockedFetchStakingRewardSum = subscanService.fetchStakingRewardSum as jest.Mock;
const mockedFetchAccountTokenList = subscanService.fetchAccountTokenList as jest.Mock;
const mockedGetOwnedNfts = kodadotService.getOwnedNfts as jest.Mock;

describe('Score Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});
    await Category.deleteMany({});
    await Score.deleteMany({});

    // Create the required Category documents here, so they exist for EVERY test.
    await Category.create([
      { key: CategoryKey.Longevity, displayName: 'Account Longevity', short_description: 's', long_description: 'l' },
      { key: CategoryKey.TxCount, displayName: 'Transaction Count', short_description: 's', long_description: 'l' },
      { key: CategoryKey.TxVolume, displayName: 'Transaction Volume', short_description: 's', long_description: 'l' },
      { key: CategoryKey.Modules, displayName: 'Module Interaction', short_description: 's', long_description: 'l' },
      { key: CategoryKey.Governance, displayName: 'Governance Participation', short_description: 's', long_description: 'l' },
      { key: CategoryKey.StakingRewards, displayName: 'Staking Rewards', short_description: 's', long_description: 'l' },
      { key: CategoryKey.StakingNominators, displayName: 'Nominator Count', short_description: 's', long_description: 'l' },
      { key: CategoryKey.StakingSlash, displayName: 'Slashes', short_description: 's', long_description: 'l' },
      { key: CategoryKey.TokenDiversity, displayName: 'Token Diversity', short_description: 's', long_description: 'l' },
      { key: CategoryKey.NftHoldings, displayName: 'NFT Holdings', short_description: 's', long_description: 'l' },
      { key: CategoryKey.NftActivity, displayName: 'NFT Activity', short_description: 's', long_description: 'l' },
      { key: CategoryKey.ExtrinsicDepth, displayName: 'Extrinsic Depth', short_description: 's', long_description: 'l' },
    ]);

    // Provide default return values for ALL mocked external services.
    mockedFetchAccountAgeDays.mockResolvedValue(0);
    mockedFetchTransfersList.mockResolvedValue({ count: 0, transfers: [] });
    mockedFetchExtrinsicsList.mockResolvedValue({ count: 0, extrinsics: [] });
    mockedFetchReferendaVotes.mockResolvedValue({ count: 0, list: [] });
    mockedFetchAccountRewardSlashList.mockResolvedValue({ count: 0, list: [] });
    mockedFetchVotedValidatorsList.mockResolvedValue([]);
    mockedFetchStakingRewardSum.mockResolvedValue(0);
    mockedFetchAccountTokenList.mockResolvedValue([]);
    mockedGetOwnedNfts.mockResolvedValue({ totalCount: 0, data: [] });
  });

  describe('calculateScore', () => {
    it('should correctly calculate a total score based on mocked on-chain metrics', async () => {
      // Arrange
      mockedFetchAccountAgeDays.mockResolvedValue(400); // 10 points
      mockedFetchTransfersList.mockResolvedValue({ count: 55, transfers: [] }); // 10 points

      // Act
      const result = await calculateScore('');

      // Assert
      expect(result.total).toBe(20);
      expect(result.categories.longevity.score).toBe(10);
      expect(result.categories.txCount.score).toBe(10);
    });
  });

  describe('updateUserScore', () => {
    it('should create a new score document if none exists', async () => {
      // Arrange
      const userId = new mongoose.Types.ObjectId();
      const user = new User({ _id: userId, addresses: [ADDRESS] });
      await user.save();
      
      // Override mocks to produce a predictable score
      mockedFetchAccountAgeDays.mockResolvedValue(365); // 10 points
      mockedFetchTransfersList.mockResolvedValue({ count: 50, transfers: [] }); // 10 points
      mockedFetchStakingRewardSum.mockResolvedValue(100000000000); // 10 DOT = 10 points
      
      // Act
      const { status, score } = await updateUserScore(userId.toHexString());

      // --- THE FIX ---
      // The total score is 10 + 10 + 10 = 30.
      const expectedScore = 30;

      // Assert
      expect(status).toBe(ScoreRefreshStatus.Created);
      expect(score.totalScore).toBe(expectedScore);
      const scoreInDb = await Score.findOne({ user: userId });
      expect(scoreInDb?.totalScore).toBe(expectedScore);
    });

    it('should update an existing score and archive the old one', async () => {
        // Arrange
        const userId = new mongoose.Types.ObjectId();
        const user = new User({ _id: userId, addresses: [ADDRESS] });
        await user.save();

        const initialScore = await Score.create({
            user: userId,
            totalScore: 10,
            categories: new Map([[CategoryKey.Longevity, { score: 10, reason: 'old', title: 'Longevity' }]]),
        });
        
        // Override mocks to produce a new, different score
        mockedFetchAccountAgeDays.mockResolvedValue(500); // 10 points
        mockedFetchTransfersList.mockResolvedValue({ count: 100, transfers: [] }); // 10 points

        // Act
        const { status, score: updatedScore } = await updateUserScore(userId.toHexString());
        
        const expectedScore = 20;

        // Assert
        expect(status).toBe(ScoreRefreshStatus.Updated);
        expect(updatedScore.totalScore).toBe(expectedScore);
        const scoreInDb = await Score.findById(initialScore._id);
        expect(scoreInDb?.totalScore).toBe(expectedScore);
        expect(scoreInDb?.history).toHaveLength(1);
        expect(scoreInDb?.history[0].totalScore).toBe(10);
    });
  });
});