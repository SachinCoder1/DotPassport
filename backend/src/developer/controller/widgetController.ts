import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { User } from '~/models/User';
import { Profile } from '~/models/Profile';
import { Score } from '~/models/Score';
import { UserBadge } from '~/models/UserBadge';
import { Badge } from '~/models/Badge';
import { Category } from '~/models/Category';
import {
  getOrCreateApiUserForProfile,
  getOrCreateApiUserForScores,
  getOrCreateApiUserForBadges,
  isValidPolkadotAddress,
} from '~/service/jit/apiUserService';

/**
 * Widget API Controller
 * Provides consolidated endpoints for widget data fetching.
 * Each widget type gets all its data in a single API call.
 * This reduces rate limit usage and improves performance.
 */

type WidgetType = 'reputation' | 'profile' | 'badge' | 'category';

interface WidgetParams {
  type: WidgetType;
  address: string;
}

interface WidgetQuery {
  forceRefresh?: string;
  badgeKey?: string;
  categoryKey?: string;
}

/**
 * Get widget data by type and address
 * GET /api/v2/widget/:type/:address
 *
 * Supported types:
 * - reputation: Returns scores data
 * - profile: Returns profile data
 * - badge: Returns badges data (optional badgeKey query param for specific badge)
 * - category: Returns category score data (requires categoryKey query param)
 */
export async function getWidgetData(
  req: Request<WidgetParams, {}, {}, WidgetQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const { type, address } = req.params;
    const { forceRefresh, badgeKey, categoryKey } = req.query;
    const shouldRefresh = forceRefresh === 'true';

    // Validate widget type
    const validTypes: WidgetType[] = ['reputation', 'profile', 'badge', 'category'];
    if (!validTypes.includes(type)) {
      return next(new HttpError(400, `Invalid widget type. Must be one of: ${validTypes.join(', ')}`));
    }

    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      return next(new HttpError(400, 'Invalid Polkadot address format'));
    }

    // Category widget requires categoryKey
    if (type === 'category' && !categoryKey) {
      return next(new HttpError(400, 'categoryKey query parameter is required for category widget'));
    }

    // Route to appropriate handler
    switch (type) {
      case 'reputation':
        return await getReputationWidgetData(address, shouldRefresh, res, next);
      case 'profile':
        return await getProfileWidgetData(address, shouldRefresh, res, next);
      case 'badge':
        return await getBadgeWidgetData(address, shouldRefresh, badgeKey, res, next);
      case 'category':
        return await getCategoryWidgetData(address, shouldRefresh, categoryKey!, res, next);
      default:
        return next(new HttpError(400, 'Invalid widget type'));
    }
  } catch (err: any) {
    logger.error('Error in getWidgetData', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get widget data')
    );
  }
}

/**
 * Get reputation widget data (scores)
 */
async function getReputationWidgetData(
  address: string,
  forceRefresh: boolean,
  res: Response,
  next: NextFunction
) {
  // Try to find app user first
  const user = await User.findOne({ addresses: address });

  if (user) {
    const score = await Score.findOne({ user: user._id });

    if (score) {
      return res.status(200).json({
        success: true,
        data: {
          address,
          totalScore: score.totalScore,
          categories: Object.fromEntries(score.categories),
          calculatedAt: score.updatedAt,
          source: 'app',
        },
      });
    }
  }

  // Fetch from ApiUser (optimized for scores - skips badge fetching)
  logger.info('Fetching ApiUser for reputation widget', { address, forceRefresh });
  const apiUser = await getOrCreateApiUserForScores(address, forceRefresh);

  const categoryScores = apiUser.score.categories
    ? Object.fromEntries(apiUser.score.categories)
    : {};

  return res.status(200).json({
    success: true,
    data: {
      address,
      totalScore: apiUser.score.totalScore,
      categories: categoryScores,
      calculatedAt: apiUser.score.calculatedAt,
      source: 'api',
    },
  });
}

/**
 * Get profile widget data
 */
async function getProfileWidgetData(
  address: string,
  forceRefresh: boolean,
  res: Response,
  next: NextFunction
) {
  // Try to find app user first
  const user = await User.findOne({ addresses: address }).populate('profile');

  if (user && user.profile) {
    const profile = await Profile.findById(user.profile);
    if (profile) {
      return res.status(200).json({
        success: true,
        data: {
          address,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          socialLinks: Object.fromEntries(profile.socialLinks || new Map()),
          polkadotIdentities: profile.polkadotIdentities.map((id) => ({
            address: id.address,
            display: id.display,
            web: id.web,
            twitter: id.twitter,
            github: id.github,
            judgements: id.judgements,
          })),
          source: 'app',
        },
      });
    }
  }

  // Fetch from ApiUser (fast path - only profile data, no scores/badges)
  logger.info('Fetching ApiUser for profile widget', { address, forceRefresh });
  const apiUser = await getOrCreateApiUserForProfile(address, forceRefresh);

  // Extract social links from polkadot identity
  const socialLinks: Record<string, string> = {};
  if (apiUser.profile.polkadotIdentity) {
    const identity = apiUser.profile.polkadotIdentity;
    if (identity.web) socialLinks.web = identity.web;
    if (identity.twitter) socialLinks.twitter = identity.twitter;
    if (identity.github) socialLinks.github = identity.github;
    if (identity.email) socialLinks.email = identity.email;
    if (identity.matrix) socialLinks.matrix = identity.matrix;
    if (identity.discord) socialLinks.discord = identity.discord;
    if (identity.riot) socialLinks.riot = identity.riot;
  }

  // Build polkadot identities array
  const polkadotIdentities = [];
  if (apiUser.profile.polkadotIdentity) {
    polkadotIdentities.push({
      address: apiUser.profile.polkadotIdentity.address || address,
      display: apiUser.profile.polkadotIdentity.display,
      legal: apiUser.profile.polkadotIdentity.legal,
      email: apiUser.profile.polkadotIdentity.email,
      web: apiUser.profile.polkadotIdentity.web,
      twitter: apiUser.profile.polkadotIdentity.twitter,
      github: apiUser.profile.polkadotIdentity.github,
      matrix: apiUser.profile.polkadotIdentity.matrix,
      discord: apiUser.profile.polkadotIdentity.discord,
      riot: apiUser.profile.polkadotIdentity.riot,
      judgements: apiUser.profile.polkadotIdentity.judgements || [],
      role: apiUser.profile.polkadotIdentity.role,
      nonce: apiUser.profile.polkadotIdentity.nonce,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      address,
      displayName: apiUser.profile.polkadotIdentity?.display || apiUser.profile.displayName || undefined,
      avatarUrl: undefined,
      bio: undefined,
      socialLinks,
      polkadotIdentities,
      nftCount: apiUser.profile.nftCount,
      source: 'api',
    },
  });
}

/**
 * Get badge widget data
 */
async function getBadgeWidgetData(
  address: string,
  forceRefresh: boolean,
  badgeKey: string | undefined,
  res: Response,
  next: NextFunction
) {
  // Try to find app user first
  const user = await User.findOne({ addresses: address });

  if (user) {
    if (badgeKey) {
      // Fetch specific badge
      const userBadge = await UserBadge.findOne({
        user: user._id,
        badgeKey
      }).lean();

      if (userBadge) {
        const badgeDefinition = await Badge.findOne({ key: badgeKey, active: true }).lean();

        return res.status(200).json({
          success: true,
          data: {
            address,
            badge: {
              badgeKey: userBadge.badgeKey,
              achievedLevel: userBadge.achievedLevel,
              achievedLevelKey: userBadge.achievedLevelKey,
              achievedLevelTitle: userBadge.achievedLevelTitle,
              earnedAt: userBadge.earnedAt,
            },
            definition: badgeDefinition ? {
              title: badgeDefinition.title,
              shortDescription: badgeDefinition.shortDescription,
              longDescription: badgeDefinition.longDescription,
              metric: badgeDefinition.metric,
              imageUrl: badgeDefinition.imageUrl,
              levels: badgeDefinition.levels,
            } : null,
            source: 'app',
          },
        });
      }
    } else {
      // Fetch all badges
      const userBadges = await UserBadge.find({ user: user._id }).lean();

      if (userBadges && userBadges.length > 0) {
        return res.status(200).json({
          success: true,
          data: {
            address,
            badges: userBadges.map((badge) => ({
              badgeKey: badge.badgeKey,
              achievedLevel: badge.achievedLevel,
              achievedLevelKey: badge.achievedLevelKey,
              achievedLevelTitle: badge.achievedLevelTitle,
              earnedAt: badge.earnedAt,
            })),
            count: userBadges.length,
            source: 'app',
          },
        });
      }
    }
  }

  // Fetch from ApiUser (optimized for badges - skips score calculation)
  logger.info('Fetching ApiUser for badge widget', { address, badgeKey, forceRefresh });
  const apiUser = await getOrCreateApiUserForBadges(address, forceRefresh);

  if (badgeKey) {
    // Specific badge
    const apiBadge = apiUser.badges.find((b) => b.badgeKey === badgeKey);
    const badgeDefinition = await Badge.findOne({ key: badgeKey, active: true }).lean();

    // If badge key doesn't exist in the system, return 404
    if (!badgeDefinition) {
      return next(new HttpError(404, 'Badge definition not found'));
    }

    // If user hasn't earned this badge, return earned: false with badge definition
    if (!apiBadge) {
      return res.status(200).json({
        success: true,
        data: {
          address,
          badge: null,
          earned: false,
          definition: {
            title: badgeDefinition.title,
            shortDescription: badgeDefinition.shortDescription,
            longDescription: badgeDefinition.longDescription,
            metric: badgeDefinition.metric,
            imageUrl: badgeDefinition.imageUrl,
            levels: badgeDefinition.levels,
          },
          source: 'api',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        address,
        badge: {
          badgeKey: apiBadge.badgeKey,
          achievedLevel: apiBadge.achievedLevel,
          achievedLevelKey: apiBadge.achievedLevelKey,
          achievedLevelTitle: apiBadge.achievedLevelTitle,
          earnedAt: apiBadge.earnedAt || new Date(), // Include earnedAt with fallback
        },
        earned: true,
        definition: {
          title: badgeDefinition.title,
          shortDescription: badgeDefinition.shortDescription,
          longDescription: badgeDefinition.longDescription,
          metric: badgeDefinition.metric,
          imageUrl: badgeDefinition.imageUrl,
          levels: badgeDefinition.levels,
        },
        source: 'api',
      },
    });
  }

  // All badges - map to ensure earnedAt is included with fallback for cached data
  return res.status(200).json({
    success: true,
    data: {
      address,
      badges: apiUser.badges.map((badge) => ({
        badgeKey: badge.badgeKey,
        achievedLevel: badge.achievedLevel,
        achievedLevelKey: badge.achievedLevelKey,
        achievedLevelTitle: badge.achievedLevelTitle,
        earnedAt: badge.earnedAt || new Date(), // Fallback for old cached data without earnedAt
      })),
      count: apiUser.badges.length,
      source: 'api',
    },
  });
}

/**
 * Get category widget data
 */
async function getCategoryWidgetData(
  address: string,
  forceRefresh: boolean,
  categoryKey: string,
  res: Response,
  next: NextFunction
) {
  // Try to find app user first
  const user = await User.findOne({ addresses: address });

  if (user) {
    const score = await Score.findOne({ user: user._id });

    if (score) {
      const categoryScore = score.categories.get(categoryKey as any);

      if (categoryScore !== undefined) {
        const categoryDefinition = await Category.findOne({
          key: categoryKey,
          active: true
        }).lean();

        return res.status(200).json({
          success: true,
          data: {
            address,
            category: {
              key: categoryKey,
              score: categoryScore,
            },
            definition: categoryDefinition ? {
              displayName: categoryDefinition.displayName,
              short_description: categoryDefinition.short_description,
              long_description: categoryDefinition.long_description,
              order: categoryDefinition.order,
              reasons: categoryDefinition.reasons,
            } : null,
            calculatedAt: score.updatedAt,
            source: 'app',
          },
        });
      }
    }
  }

  // Fetch from ApiUser (optimized for scores - skips badge fetching)
  logger.info('Fetching ApiUser for category widget', { address, categoryKey, forceRefresh });
  const apiUser = await getOrCreateApiUserForScores(address, forceRefresh);

  const categoryScore = apiUser.score.categories?.get(categoryKey as any);
  if (categoryScore === undefined) {
    return next(new HttpError(404, 'Category score not found for this user'));
  }

  const categoryDefinition = await Category.findOne({
    key: categoryKey,
    active: true
  }).lean();

  return res.status(200).json({
    success: true,
    data: {
      address,
      category: {
        key: categoryKey,
        score: categoryScore,
      },
      definition: categoryDefinition ? {
        displayName: categoryDefinition.displayName,
        short_description: categoryDefinition.short_description,
        long_description: categoryDefinition.long_description,
        order: categoryDefinition.order,
        reasons: categoryDefinition.reasons,
      } : null,
      calculatedAt: apiUser.score.calculatedAt,
      source: 'api',
    },
  });
}
