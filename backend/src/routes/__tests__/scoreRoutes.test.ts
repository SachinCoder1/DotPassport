// THE FIX: Import 'request' from 'supertest', not 'express'
import request from 'supertest'; 
import { createApp } from '../../app';
import { getAuthToken } from '../../test/helper';
import * as ScoreService from '../../service/score';
import { ScoreRefreshStatus } from '../../service/score/types';
import { Score } from '../../models/Score';
import { Category } from '../../models/Category';
import mongoose from 'mongoose';
import { CategoryKey } from '../../service/score/scoreDefinitions';

// Create an instance of the app for testing
const app = createApp();

// Mock the score service
jest.mock('../../service/score');
const mockedUpdateUserScore = ScoreService.updateUserScore as jest.Mock;

describe('Score API: /api/v1/score', () => {

  describe('GET /categories', () => {
    it('should return only active categories, sorted by the order field', async () => {
      // Arrange
      await Category.create([
        {
          key: CategoryKey.Longevity,
          displayName: 'Account Age',
          short_description: 'Short desc for longevity',
          long_description: 'Long desc for longevity',
          active: true,
          order: 2,
        },
        {
          key: CategoryKey.Governance,
          displayName: 'Governance',
          short_description: 'Short desc for governance',
          long_description: 'Long desc for governance',
          active: true,
          order: 1,
        },
        {
          key: CategoryKey.StakingRewards,
          displayName: 'Staking',
          short_description: 'Short desc for staking',
          long_description: 'Long desc for staking',
          active: false,
          order: 3,
        },
      ]);

      // Act
      const response = await request(app).get('/api/v1/score/categories');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(2);
      expect(response.body.categories[0].key).toBe(CategoryKey.Governance);
      expect(response.body.categories[1].key).toBe(CategoryKey.Longevity);
    });
  });

  describe('GET /', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/v1/score');
      expect(response.status).toBe(401);
    });

    it('should return an existing score from the database if one is found', async () => {
      // Arrange
      const { token, userId } = await getAuthToken();
      await Score.create({ user: userId, totalScore: 123, categories: new Map() });

      // Act
      const response = await request(app)
        .get('/api/v1/score')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.totalScore).toBe(123);
      expect(mockedUpdateUserScore).not.toHaveBeenCalled();
    });

    it('should call the score service to create a score if none exists', async () => {
      // Arrange
      const { token, userId } = await getAuthToken();
      const mockNewScore = {
        _id: new mongoose.Types.ObjectId(),
        totalScore: 500,
        categories: new Map(),
        updatedAt: new Date(),
      };
      mockedUpdateUserScore.mockResolvedValue({ score: mockNewScore });

      // Act
      const response = await request(app)
        .get('/api/v1/score')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.totalScore).toBe(500);
      expect(mockedUpdateUserScore).toHaveBeenCalledWith(userId.toHexString());
    });
  });

  describe('POST /refresh', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).post('/api/v1/score/refresh');
      expect(response.status).toBe(401);
    });

    it('should return 201 when a score is created for the first time', async () => {
      // Arrange
      const { token, userId } = await getAuthToken();
      mockedUpdateUserScore.mockResolvedValue({
        status: ScoreRefreshStatus.Created,
        score: { totalScore: 500, categories: new Map() },
      });

      // Act
      const response = await request(app)
        .post('/api/v1/score/refresh')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(ScoreRefreshStatus.Created);
      expect(mockedUpdateUserScore).toHaveBeenCalledWith(userId.toHexString());
    });

    it('should return 500 if the service throws an error', async () => {
      // Arrange
      const { token } = await getAuthToken();
      mockedUpdateUserScore.mockRejectedValue(new Error('Service failure'));

      // Act
      const response = await request(app)
        .post('/api/v1/score/refresh')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Could not refresh score');
    });
  });
});