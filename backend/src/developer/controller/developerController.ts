import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { User } from '~/models/User';
import { Profile } from '~/models/Profile';
import { Score } from '~/models/Score';
import { UserBadge } from '~/models/UserBadge';
import { Badge } from '~/models/Badge';
import { Category } from '~/models/Category';
import { getOrCreateApiUser, isValidPolkadotAddress } from '~/service/jit/apiUserService';

/**
 * Get user profile by address
 * GET /api/v2/profiles/:address
 */
export async function getProfileByAddress(
  req: Request<{ address: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const address = req.params.address;

    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      return next(new HttpError(400, 'Invalid Polkadot address format'));
    }

    // Try to find app user first
    const user = await User.findOne({ addresses: address }).populate('profile');

    if (user && user.profile) {
      const profile = await Profile.findById(user.profile);
      if (profile) {
        // Return app user profile
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

    // User not found in app, check/fetch from ApiUser
    logger.info('App user not found, fetching ApiUser', { address });
    const apiUser = await getOrCreateApiUser(address);

    return res.status(200).json({
      success: true,
      data: {
        address,
        displayName: apiUser.profile.displayName,
        polkadotIdentity: apiUser.profile.polkadotIdentity,
        nftCount: apiUser.profile.nftCount,
        source: 'api',
      },
    });
  } catch (err: any) {
    logger.error('Error in getProfileByAddress', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get profile')
    );
  }
}

/**
 * Get user scores by address
 * GET /api/v2/scores/:address
 */
export async function getScoresByAddress(
  req: Request<{ address: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const address = req.params.address;

    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      return next(new HttpError(400, 'Invalid Polkadot address format'));
    }

    // Try to find app user first
    const user = await User.findOne({ addresses: address });

    if (user) {
      const score = await Score.findOne({ user: user._id });

      if (score) {
        // Return app user score
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

    // User not found or no score, check/fetch from ApiUser
    logger.info('App user score not found, fetching ApiUser', { address });
    const apiUser = await getOrCreateApiUser(address);

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
  } catch (err: any) {
    logger.error('Error in getScoresByAddress', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get scores')
    );
  }
}

/**
 * Get a specific category score for a user by address and category key
 * GET /api/v2/scores/:address/:categoryKey
 */
export async function getSpecificCategoryScore(
  req: Request<{ address: string; categoryKey: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { address, categoryKey } = req.params;

    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      return next(new HttpError(400, 'Invalid Polkadot address format'));
    }

    // Try to find app user first
    const user = await User.findOne({ addresses: address });

    if (user) {
      const score = await Score.findOne({ user: user._id });

      if (score) {
        const categoryScore = score.categories.get(categoryKey as any);

        if (categoryScore !== undefined) {
          // Get category definition for additional context
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

    // User not found or category not found, check/fetch from ApiUser
    logger.info('App user category score not found, fetching ApiUser', { address, categoryKey });
    const apiUser = await getOrCreateApiUser(address);

    const categoryScore = apiUser.score.categories?.get(categoryKey as any);
    if (categoryScore === undefined) {
      return next(new HttpError(404, 'Category score not found for this user'));
    }

    // Get category definition for additional context
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
  } catch (err: any) {
    logger.error('Error in getSpecificCategoryScore', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get category score')
    );
  }
}

/**
 * Get user badges by address
 * GET /api/v2/badges/:address
 */
export async function getBadgesByAddress(
  req: Request<{ address: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const address = req.params.address;

    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      return next(new HttpError(400, 'Invalid Polkadot address format'));
    }

    // Try to find app user first
    const user = await User.findOne({ addresses: address });

    if (user) {
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

    // User not found or no badges, check/fetch from ApiUser
    logger.info('App user badges not found, fetching ApiUser', { address });
    const apiUser = await getOrCreateApiUser(address);

    return res.status(200).json({
      success: true,
      data: {
        address,
        badges: apiUser.badges,
        count: apiUser.badges.length,
        source: 'api',
      },
    });
  } catch (err: any) {
    logger.error('Error in getBadgesByAddress', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get badges')
    );
  }
}

/**
 * Get a specific badge for a user by address and badge key
 * GET /api/v2/badges/:address/:badgeKey
 */
export async function getSpecificBadgeByAddress(
  req: Request<{ address: string; badgeKey: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { address, badgeKey } = req.params;

    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      return next(new HttpError(400, 'Invalid Polkadot address format'));
    }

    // Try to find app user first
    const user = await User.findOne({ addresses: address });

    if (user) {
      const userBadge = await UserBadge.findOne({
        user: user._id,
        badgeKey
      }).lean();

      if (userBadge) {
        // Get badge definition for additional context
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
    }

    // User not found or badge not found, check/fetch from ApiUser
    logger.info('App user badge not found, fetching ApiUser', { address, badgeKey });
    const apiUser = await getOrCreateApiUser(address);

    const apiBadge = apiUser.badges.find((b) => b.badgeKey === badgeKey);
    if (!apiBadge) {
      return next(new HttpError(404, 'Badge not found for this user'));
    }

    // Get badge definition for additional context
    const badgeDefinition = await Badge.findOne({ key: badgeKey, active: true }).lean();

    return res.status(200).json({
      success: true,
      data: {
        address,
        badge: {
          badgeKey: apiBadge.badgeKey,
          achievedLevel: apiBadge.achievedLevel,
          achievedLevelKey: apiBadge.achievedLevelKey,
          achievedLevelTitle: apiBadge.achievedLevelTitle,
        },
        definition: badgeDefinition ? {
          title: badgeDefinition.title,
          shortDescription: badgeDefinition.shortDescription,
          longDescription: badgeDefinition.longDescription,
          metric: badgeDefinition.metric,
          imageUrl: badgeDefinition.imageUrl,
          levels: badgeDefinition.levels,
        } : null,
        source: 'api',
      },
    });
  } catch (err: any) {
    logger.error('Error in getSpecificBadgeByAddress', { error: err });
    return next(
      err instanceof HttpError ? err : new HttpError(500, 'Failed to get badge')
    );
  }
}

/**
 * Get badge definitions (metadata)
 * GET /api/v2/metadata/badges
 */
export async function getBadgeDefinitions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const badges = await Badge.find({ active: true }).sort({ order: 1 }).lean();

    res.status(200).json({
      success: true,
      data: {
        badges: badges.map((badge) => ({
          key: badge.key,
          title: badge.title,
          shortDescription: badge.shortDescription,
          longDescription: badge.longDescription,
          metric: badge.metric,
          imageUrl: badge.imageUrl,
          levels: badge.levels,
        })),
      },
    });
  } catch (err: any) {
    logger.error('Error in getBadgeDefinitions', { error: err });
    return next(new HttpError(500, 'Failed to get badge definitions'));
  }
}

/**
 * Get category definitions (metadata)
 * GET /api/v2/metadata/categories
 */
export async function getCategoryDefinitions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await Category.find({ active: true })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        categories: categories.map((category) => ({
          key: category.key,
          displayName: category.displayName,
          short_description: category.short_description,
          long_description: category.long_description,
          order: category.order,
          reasons: category.reasons,
        })),
      },
    });
  } catch (err: any) {
    logger.error('Error in getCategoryDefinitions', { error: err });
    return next(new HttpError(500, 'Failed to get category definitions'));
  }
}
