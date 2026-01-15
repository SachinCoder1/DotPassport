import { Router } from 'express';
import { validateRequest } from '~/middleware/validateResource';
import {
  requestChallengeHandler,
  authenticateHandler,
  refreshTokenHandler,
  logoutHandler,
  getMeHandler,
  regenerateKeyHandler,
  getRequestLogsHandler,
  getStatsHandler,
  getOriginsHandler,
  updateOriginsHandler,
} from '../controller/sandboxController';
import {
  challengeSchema,
  authenticateSchema,
  regenerateKeySchema,
  refreshTokenSchema,
} from '../schemas/sandbox.schema';
import { sandboxAuth } from '../middleware/sandboxAuth';

const router = Router();

/**
 * @route   POST /api/v1/sandbox/challenge
 * @desc    Request a challenge for wallet signature
 * @access  Public
 */
router.post(
  '/challenge',
  validateRequest({ body: challengeSchema }),
  requestChallengeHandler
);

/**
 * @route   POST /api/v1/sandbox/auth
 * @desc    Authenticate and get/create API key
 * @access  Public
 */
router.post(
  '/auth',
  validateRequest({ body: authenticateSchema }),
  authenticateHandler
);

/**
 * @route   POST /api/v1/sandbox/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  refreshTokenHandler
);

/**
 * @route   POST /api/v1/sandbox/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', logoutHandler);

/**
 * @route   GET /api/v1/sandbox/me/:address
 * @desc    Get current user info
 * @access  Protected (JWT)
 */
router.get('/me/:address', sandboxAuth, getMeHandler);

/**
 * @route   POST /api/v1/sandbox/regenerate-key
 * @desc    Regenerate API key for user
 * @access  Protected (JWT + signature)
 */
router.post(
  '/regenerate-key',
  sandboxAuth,
  validateRequest({ body: regenerateKeySchema }),
  regenerateKeyHandler
);

/**
 * @route   GET /api/v1/sandbox/logs
 * @desc    Get request logs for authenticated user
 * @access  Protected (JWT)
 */
router.get('/logs', sandboxAuth, getRequestLogsHandler);

/**
 * @route   GET /api/v1/sandbox/stats
 * @desc    Get request statistics for authenticated user
 * @access  Protected (JWT)
 */
router.get('/stats', sandboxAuth, getStatsHandler);

/**
 * @route   GET /api/v1/sandbox/origins
 * @desc    Get user's custom allowed origins (excludes system origins)
 * @access  Protected (JWT)
 */
router.get('/origins', sandboxAuth, getOriginsHandler);

/**
 * @route   PATCH /api/v1/sandbox/origins
 * @desc    Update user's custom allowed origins (max 3)
 * @access  Protected (JWT)
 */
router.patch('/origins', sandboxAuth, updateOriginsHandler);

export default router;
