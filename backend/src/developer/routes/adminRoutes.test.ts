import request from 'supertest';
import { createApp } from '~/app';
import { User } from '~/models/User';
import { generateAccessToken } from '~/utils/authTokens';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';

const app = createApp();

describe('Admin API Routes (/api/v1/admin/api-keys)', () => {
  let adminToken: string;
  let adminUserId: string;

  beforeEach(async () => {
    // Create an admin user
    const adminUser = await User.create({
      addresses: ['test-admin-address'],
      roles: ['admin'],
    });
    adminUserId = adminUser.id;
    adminToken = generateAccessToken(adminUserId);
  });

  describe('POST /api/v1/admin/api-keys', () => {
    it('should create a new API key with Free tier', async () => {
      const response = await request(app)
        .post('/api/v1/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appName: 'Test App',
          contactEmail: 'test@example.com',
          tier: 'free',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API key created successfully');
      expect(response.body.apiKey.key).toMatch(/^dp_live_[a-f0-9]{48}$/);
      expect(response.body.apiKey.appName).toBe('Test App');
      expect(response.body.apiKey.tier).toBe('free');
      expect(response.body.apiKey.rateLimits.requestsPerHour).toBe(100);
    });

    it('should create a new API key with Pro tier and allowed origins', async () => {
      const response = await request(app)
        .post('/api/v1/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appName: 'Pro App',
          contactEmail: 'pro@example.com',
          tier: 'pro',
          allowedOrigins: ['https://example.com', 'https://app.example.com'],
          metadata: { plan: 'monthly' },
        })
        .expect(201);

      expect(response.body.apiKey.tier).toBe('pro');
      expect(response.body.apiKey.allowedOrigins).toHaveLength(2);
      expect(response.body.apiKey.rateLimits.requestsPerHour).toBe(1000);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/admin/api-keys')
        .send({
          appName: 'Test App',
          contactEmail: 'test@example.com',
          tier: 'free',
        })
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should reject request with invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appName: 'AB', // Too short
          contactEmail: 'invalid-email',
          tier: 'invalid-tier',
        })
        .expect(400);
    });

    it('should reject request with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appName: 'Test App',
          // Missing contactEmail and tier
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/admin/api-keys', () => {
    beforeEach(async () => {
      // Create multiple API keys
      const { createApiKey } = await import('../service/apiKeyService');
      await createApiKey({
        appName: 'App 1',
        contactEmail: 'app1@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });
      await createApiKey({
        appName: 'App 2',
        contactEmail: 'app2@example.com',
        tier: ApiKeyTier.PRO,
        createdBy: adminUserId,
      });
      await createApiKey({
        appName: 'App 3',
        contactEmail: 'app3@example.com',
        tier: ApiKeyTier.ENTERPRISE,
        createdBy: adminUserId,
      });
    });

    it('should list all API keys with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKeys).toHaveLength(3);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/admin/api-keys?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.apiKeys).toHaveLength(2);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter by tier', async () => {
      const response = await request(app)
        .get('/api/v1/admin/api-keys?tier=pro')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.apiKeys).toHaveLength(1);
      expect(response.body.data.apiKeys[0].tier).toBe('pro');
    });

    it('should search by app name', async () => {
      const response = await request(app)
        .get('/api/v1/admin/api-keys?search=App 2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.apiKeys).toHaveLength(1);
      expect(response.body.data.apiKeys[0].appName).toBe('App 2');
    });

    it('should reject request without authentication', async () => {
      await request(app).get('/api/v1/admin/api-keys').expect(401);
    });
  });

  describe('GET /api/v1/admin/api-keys/:keyId', () => {
    it('should get API key details', async () => {
      const { createApiKey } = await import('../service/apiKeyService');
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });

      const response = await request(app)
        .get(`/api/v1/admin/api-keys/${created.apiKeyDoc.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appName).toBe('Test App');
      expect(response.body.data).not.toHaveProperty('keyHash');
    });

    it('should return 404 for non-existent key', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/v1/admin/api-keys/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('API key not found');
    });
  });

  describe('PATCH /api/v1/admin/api-keys/:keyId', () => {
    it('should update API key', async () => {
      const { createApiKey } = await import('../service/apiKeyService');
      const created = await createApiKey({
        appName: 'Old Name',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });

      const response = await request(app)
        .patch(`/api/v1/admin/api-keys/${created.apiKeyDoc.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appName: 'New Name',
          tier: 'pro',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appName).toBe('New Name');
      expect(response.body.data.tier).toBe('pro');
    });

    it('should reject empty update', async () => {
      const { createApiKey } = await import('../service/apiKeyService');
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });

      await request(app)
        .patch(`/api/v1/admin/api-keys/${created.apiKeyDoc.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /api/v1/admin/api-keys/:keyId', () => {
    it('should revoke API key', async () => {
      const { createApiKey } = await import('../service/apiKeyService');
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });

      const response = await request(app)
        .delete(`/api/v1/admin/api-keys/${created.apiKeyDoc.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'No longer needed',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.revokedAt).toBeDefined();
      expect(response.body.data.revokedReason).toBe('No longer needed');

      // Verify key is actually revoked
      const revokedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(revokedKey!.isActive).toBe(false);
    });

    it('should reject revoking already revoked key', async () => {
      const { createApiKey, revokeApiKey } = await import(
        '../service/apiKeyService'
      );
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });

      await revokeApiKey(created.apiKeyDoc.id, adminUserId, 'First revoke');

      await request(app)
        .delete(`/api/v1/admin/api-keys/${created.apiKeyDoc.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Second revoke',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/admin/api-keys/:keyId/usage', () => {
    it('should get usage statistics', async () => {
      const { createApiKey } = await import('../service/apiKeyService');
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: adminUserId,
      });

      // Add some usage
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.totalRequests': 50,
        'usage.currentHourRequests': 25,
        'usage.currentDayRequests': 250,
        'usage.currentMonthRequests': 2500,
      });

      const response = await request(app)
        .get(`/api/v1/admin/api-keys/${created.apiKeyDoc.id}/usage`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.usage.totalRequests).toBe(50);
      expect(response.body.data.utilizationPercentage.hour).toBe(25);
      expect(response.body.data.utilizationPercentage.day).toBe(25);
      expect(response.body.data.utilizationPercentage.month).toBe(25);
    });
  });

  describe('Authentication and authorization', () => {
    it('should reject all requests without authentication', async () => {
      await request(app).post('/api/v1/admin/api-keys').send({}).expect(401);
      await request(app).get('/api/v1/admin/api-keys').expect(401);
      await request(app).get('/api/v1/admin/api-keys/someid').expect(401);
      await request(app).patch('/api/v1/admin/api-keys/someid').send({}).expect(401);
      await request(app).delete('/api/v1/admin/api-keys/someid').send({}).expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app)
        .get('/api/v1/admin/api-keys')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
