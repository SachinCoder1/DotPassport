// src/controllers/badgeController.ts
import { Request, Response, NextFunction } from "express";
import { User } from "~/models/User";
import { Badge } from "~/models/Badge";
import { UserBadge } from "~/models/UserBadge";
import { checkUserBadges } from "~/service/badge";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";
import { BadgeKey } from "~/service/badge/badgeDefinitions";

/**
 * Gets all active badge definitions from the database.
 * This is used by the frontend to display all possible badges and how to earn them.
 * @access Public
 */
export async function getBadgeDefinitions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const badges = await Badge.find({ active: true }).sort({ order: 1 }).lean();
    res.status(200).json({
      badges,
      message: "Badge definitions retrieved successfully.",
      success: true,
    });
  } catch (err: any) {
    logger.error("Error getting badge definitions", { error: err });
    return next(new HttpError(500, "Could not retrieve badge definitions"));
  }
}

/**
 * Gets all badges earned by the currently authenticated user.
 * @access Private
 */
export async function getUserBadges(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError(401, "User not authenticated"));
  }

  try {
    const userBadges = await UserBadge.find({ user: userId }).lean();
    res.status(200).json({
      badges: userBadges,
      message: "User badges retrieved successfully.",
      count: userBadges.length,
      success: true,
      needs_refresh: userBadges.length === 0,
    });
  } catch (err: any) {
    logger.error("Error getting user badges", { userId, error: err });
    return next(new HttpError(500, "Could not retrieve user badges"));
  }
}

/**
 * Refreshes the badges for the authenticated user, storing the specific level title achieved.
 * @access Private
 */
export async function refreshUserBadges(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError(401, "User not authenticated"));
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.addresses || user.addresses.length === 0) {
      return next(new HttpError(404, "User or user address not found"));
    }
    const address = user.addresses[0];

    // 1. Fetch all necessary data in parallel
    const [checkedBadges, currentBadges, allBadgeDefinitions] =
      await Promise.all([
        checkUserBadges(address),
        UserBadge.find({ user: userId }),
        Badge.find({ active: true }).lean(),
      ]);

    // 2. Create lookup maps for efficient access
    const checkedBadgeKeys = Object.keys(checkedBadges) as BadgeKey[];
    const currentBadgesMap = new Map(currentBadges.map((b) => [b.badgeKey, b]));
    const definitionsMap = new Map(
      allBadgeDefinitions.map((def) => [def.key, def])
    );

    const operations: Promise<any>[] = [];
    let badgesCreated = 0;
    let badgesUpdated = 0;

    // 3. Compare checked badges with current badges and prepare DB operations
    for (const key of checkedBadgeKeys) {
      const achievedLevel = checkedBadges[key];
      const existingBadge = currentBadgesMap.get(key);
      const definition = definitionsMap.get(key);

      const levelInfo = definition?.levels.find(
        (l) => l.level === achievedLevel
      );
      if (!levelInfo) {
        logger.warn(
          `Level info for badge ${key} at level ${achievedLevel} not found in DB. Skipping.`
        );
        continue;
      }

      // Destructure both the key and title from the level definition
      const { key: achievedLevelKey, title: achievedLevelTitle } = levelInfo;

      if (existingBadge) {
        // If badge exists and the new level is higher, update it
        if (existingBadge.achievedLevel < achievedLevel) {
          existingBadge.achievedLevel = achievedLevel;
          existingBadge.achievedLevelKey = achievedLevelKey; // Update key
          existingBadge.achievedLevelTitle = achievedLevelTitle; // Update title
          operations.push(existingBadge.save());
          badgesUpdated++;
        }
      } else {
        // If badge doesn't exist, create a new one
        operations.push(
          UserBadge.create({
            user: userId,
            badgeKey: key,
            achievedLevel: achievedLevel,
            achievedLevelKey: achievedLevelKey, // Add key
            achievedLevelTitle: achievedLevelTitle, // Add title
          })
        );
        badgesCreated++;
      }
    }

    // 4. Execute all database operations in parallel
    if (operations.length > 0) {
      await Promise.all(operations);
      logger.info("User badges refreshed", {
        userId,
        created: badgesCreated,
        updated: badgesUpdated,
      });
    } else {
      logger.info("User badges checked, no new achievements or level-ups.", {
        userId,
      });
    }

    // 5. Return the latest set of the user's badges
    const latestBadges = await UserBadge.find({ user: userId }).lean();
    res.status(200).json({
      message: "Badges refreshed successfully.",
      created: badgesCreated,
      updated: badgesUpdated,
      badges: latestBadges,
    });
  } catch (err: any) {
    logger.error("Error refreshing user badges", { userId, error: err });
    return next(new HttpError(500, "Could not refresh user badges"));
  }
}
