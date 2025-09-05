import request from 'supertest';
import { createApp } from '../../app';
import { getAuthToken } from '../../test/helper';
import * as BadgeService from '../../service/badge';
import { Badge } from '../../models/Badge';
import { UserBadge } from '../../models/UserBadge';
import { BadgeKey } from '../../service/badge/badgeDefinitions';

const app = createApp();

jest.mock('../../service/badge');
const mockedCheckUserBadges = BadgeService.checkUserBadges as jest.Mock;

describe('Badge API: /api/v1/badge', () => {
  
  describe('GET /definitions', () => {
    it('should return only active badge definitions, sorted by order', async () => {
      await Badge.create([
        {
          key: BadgeKey.PolkadotRegular, title: 'Polkadot Regular', shortDescription: 'd', longDescription: 'd', metric: 'm', active: true, order: 2,
          levels: [{ level: 1, key: 'REGULAR_LVL1', value: 1, title: 't', shortDescription:'s', longDescription:'l', constraints:[], advice:[] }],
        },
        {
          key: BadgeKey.ReferendumVoter, title: 'Referendum Voter', shortDescription: 'd', longDescription: 'd', metric: 'm', active: true, order: 1,
          levels: [{ level: 1, key: 'VOTER_LVL1', value: 1, title: 't', shortDescription:'s', longDescription:'l', constraints:[], advice:[] }],
        },
        {
          key: BadgeKey.IdentityConfirmed, title: 'Identity Confirmed', shortDescription: 'd', longDescription: 'd', metric: 'm', active: false, order: 3,
          levels: [{ level: 1, key: 'IDENTITY_LVL1', value: 1, title: 't', shortDescription:'s', longDescription:'l', constraints:[], advice:[] }],
        },
      ]);

      const response = await request(app).get('/api/v1/badge/definitions');

      expect(response.status).toBe(200);
      expect(response.body.badges).toHaveLength(2);
      expect(response.body.badges[0].key).toBe(BadgeKey.ReferendumVoter);
      expect(response.body.badges[1].key).toBe(BadgeKey.PolkadotRegular);
    });
  });

  describe('GET /', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/v1/badge');
      expect(response.status).toBe(401);
    });

    it('should return badges for the authenticated user', async () => {
      // Arrange
      const { token, userId } = await getAuthToken();
      await UserBadge.create([
        { user: userId, badgeKey: BadgeKey.PolkadotRegular, achievedLevel: 2, achievedLevelKey: 'KEY1', achievedLevelTitle: 'Expert' },
        { user: userId, badgeKey: BadgeKey.ReferendumVoter, achievedLevel: 1, achievedLevelKey: 'KEY2', achievedLevelTitle: 'Voter' },
      ]);

      // Act
      const response = await request(app)
        .get('/api/v1/badge')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.badges).toHaveLength(2);

      // --- THE FIX ---
      // Instead of checking a specific index, we check that the array contains
      // objects with the properties we expect. This is not dependent on order.
      expect(response.body.badges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ badgeKey: BadgeKey.PolkadotRegular }),
          expect.objectContaining({ badgeKey: BadgeKey.ReferendumVoter }),
        ])
      );
    });
  });

  describe('POST /refresh', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).post('/api/v1/badge/refresh');
      expect(response.status).toBe(401);
    });

    it('should create a new UserBadge if the service finds a new achievement', async () => {
      // Arrange
      const { token, userId } = await getAuthToken();
      mockedCheckUserBadges.mockResolvedValue({ [BadgeKey.RelayChainInitiate]: 1 });

      await Badge.create({
        key: BadgeKey.RelayChainInitiate,
        title: 'Initiate', shortDescription: 'd', longDescription: 'd', metric: 'm', active: true,
        levels: [{ level: 1, key: 'LVL1_INITIATE', value: 1, title: 'First Step', shortDescription:'s', longDescription:'l', constraints:[], advice:[] }],
      });

      // Act
      const response = await request(app)
        .post('/api/v1/badge/refresh')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.created).toBe(1);
      
      const userBadges = await UserBadge.find({ user: userId });
      expect(userBadges).toHaveLength(1);
      expect(userBadges[0].badgeKey).toBe(BadgeKey.RelayChainInitiate);
    });

    it('should update a UserBadge if a higher level is achieved', async () => {
        // Arrange
        const { token, userId } = await getAuthToken();
        await UserBadge.create({ user: userId, badgeKey: BadgeKey.RelayChainInitiate, achievedLevel: 1, achievedLevelKey: 'LVL1_INITIATE', achievedLevelTitle: 'First Step' });
        mockedCheckUserBadges.mockResolvedValue({ [BadgeKey.RelayChainInitiate]: 2 });

        await Badge.create({
            key: BadgeKey.RelayChainInitiate,
            title: 'Initiate', shortDescription: 'd', longDescription: 'd', metric: 'm', active: true,
            levels: [
                { level: 1, key: 'LVL1_INITIATE', value: 1, title: 'First Step', shortDescription:'s', longDescription:'l', constraints:[], advice:[] },
                { level: 2, key: 'LVL2_INITIATE', value: 10, title: 'Adept', shortDescription:'s', longDescription:'l', constraints:[], advice:[] }
            ],
        });

        // Act
        const response = await request(app)
            .post('/api/v1/badge/refresh')
            .set('Authorization', `Bearer ${token}`);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.updated).toBe(1);
        
        const updatedBadge = await UserBadge.findOne({ user: userId });
        expect(updatedBadge?.achievedLevel).toBe(2);
    });
  });
});