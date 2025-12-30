import { Router } from 'express';
import { apiKeyCors } from '../middleware/apiKeyCors';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { apiKeyRateLimit } from '../middleware/apiKeyRateLimit';
import {
  getProfileByAddress,
  getScoresByAddress,
  getSpecificCategoryScore,
  getBadgesByAddress,
  getSpecificBadgeByAddress,
  getBadgeDefinitions,
  getCategoryDefinitions,
} from '../controller/developerController';

const router = Router();

// All developer routes require CORS validation, API key authentication, and rate limiting
// IMPORTANT: apiKeyCors must run BEFORE apiKeyAuth to handle preflight OPTIONS requests
router.use(apiKeyCors);
router.use(apiKeyAuth);
router.use(apiKeyRateLimit);

/**
 * @route   GET /api/v2/profiles/:address
 * @desc    Get user profile by address
 * @access  Public (API Key required)
 */
router.get('/profiles/:address', getProfileByAddress);

/**
 * @route   GET /api/v2/scores/:address/:categoryKey
 * @desc    Get specific category score for user by address and category key
 * @access  Public (API Key required)
 */
router.get('/scores/:address/:categoryKey', getSpecificCategoryScore);

/**
 * @route   GET /api/v2/scores/:address
 * @desc    Get user scores by address
 * @access  Public (API Key required)
 */
router.get('/scores/:address', getScoresByAddress);

/**
 * @route   GET /api/v2/badges/:address/:badgeKey
 * @desc    Get specific badge for user by address and badge key
 * @access  Public (API Key required)
 */
router.get('/badges/:address/:badgeKey', getSpecificBadgeByAddress);

/**
 * @route   GET /api/v2/badges/:address
 * @desc    Get user badges by address
 * @access  Public (API Key required)
 */
router.get('/badges/:address', getBadgesByAddress);

/**
 * @route   GET /api/v2/metadata/badges
 * @desc    Get badge definitions (metadata)
 * @access  Public (API Key required)
 */
router.get('/metadata/badges', getBadgeDefinitions);

/**
 * @route   GET /api/v2/metadata/categories
 * @desc    Get category definitions (metadata)
 * @access  Public (API Key required)
 */
router.get('/metadata/categories', getCategoryDefinitions);

export default router;
