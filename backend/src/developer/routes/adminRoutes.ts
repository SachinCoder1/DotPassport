import { Router } from 'express';
import { authMiddleware } from '~/middleware/auth';
import { requireAdmin } from '~/middleware/adminAuth';
import { validateRequest } from '~/middleware/validateResource';
import {
  createApiKeyHandler,
  listApiKeysHandler,
  getApiKeyHandler,
  updateApiKeyHandler,
  revokeApiKeyHandler,
  getUsageStatsHandler,
} from '../controller/apiKeyController';
import {
  createApiKeySchema,
  updateApiKeySchema,
  revokeApiKeySchema,
} from '../schemas/apiKey.schema';

const router = Router();

// All admin routes require JWT authentication
router.use(authMiddleware);

// All admin routes require admin role
router.use(requireAdmin);

/**
 * @route   POST /api/v1/admin/api-keys
 * @desc    Create a new API key
 * @access  Private (Admin)
 */
router.post(
  '/',
  validateRequest({ body: createApiKeySchema }),
  createApiKeyHandler
);

/**
 * @route   GET /api/v1/admin/api-keys
 * @desc    List all API keys with pagination and filtering
 * @access  Private (Admin)
 */
router.get('/', listApiKeysHandler);

/**
 * @route   GET /api/v1/admin/api-keys/:keyId
 * @desc    Get API key details
 * @access  Private (Admin)
 */
router.get('/:keyId', getApiKeyHandler);

/**
 * @route   PATCH /api/v1/admin/api-keys/:keyId
 * @desc    Update API key
 * @access  Private (Admin)
 */
router.patch(
  '/:keyId',
  validateRequest({ body: updateApiKeySchema }),
  updateApiKeyHandler
);

/**
 * @route   DELETE /api/v1/admin/api-keys/:keyId
 * @desc    Revoke API key
 * @access  Private (Admin)
 */
router.delete(
  '/:keyId',
  validateRequest({ body: revokeApiKeySchema }),
  revokeApiKeyHandler
);

/**
 * @route   GET /api/v1/admin/api-keys/:keyId/usage
 * @desc    Get usage statistics for an API key
 * @access  Private (Admin)
 */
router.get('/:keyId/usage', getUsageStatsHandler);

export default router;
