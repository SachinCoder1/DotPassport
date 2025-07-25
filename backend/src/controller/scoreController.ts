import { Request, Response, NextFunction } from "express";
import { User } from "~/models/User";
import { Score, ICategoryScore } from "~/models/Score";
import { DetailsMap, CategoryKey } from "~/config/scoreReasons";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";
import { calculateScore } from "~/service/score_generator";
import { Category } from "~/models/Category";

enum ScoreRefreshStatus {
  Created = "CREATED",
  Updated = "UPDATED",
  NoChange = "NO_CHANGE",
}

/**
 * Refreshes the score for the authenticated user.
 * If a score exists, it archives the old one and saves the new one.
 * If no score exists, it creates a new one.
 */
function areCategoriesEqual(
  map1: Map<CategoryKey, ICategoryScore>,
  map2: Map<CategoryKey, ICategoryScore>
): boolean {
  if (map1.size !== map2.size) {
    return false;
  }
  // A practical way to deep-compare the content for this structure
  return (
    JSON.stringify(Array.from(map1.entries())) ===
    JSON.stringify(Array.from(map2.entries()))
  );
}

export async function refreshScore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.addresses || user.addresses.length === 0) {
      return next(new HttpError(404, "User or user address not found"));
    }
    const address = user.addresses[0];

    logger.info("Starting score refresh", { userId, address });

    const { total: newTotalScore, categories: newCategories } =
      await calculateScore(address);
    const newCategoriesMap = new Map(Object.entries(newCategories)) as Map<
      CategoryKey,
      ICategoryScore
    >;

    const existingScore = await Score.findOne({ user: userId });

    // No score exists yet. Create it.
    if (!existingScore) {
      const newScore = await Score.create({
        user: userId,
        totalScore: newTotalScore,
        categories: newCategoriesMap,
      });
      user.reputationScore = newTotalScore;
      await user.save();
      logger.info("New score created for user", { userId });

      return res.status(201).json({
        status: ScoreRefreshStatus.Created,
        message: "Score created successfully",
        score: newScore.toObject(),
      });
    }

    // Case 2: Score exists. Compare it to see if there's a change.
    const hasChanged =
      existingScore.totalScore !== newTotalScore ||
      !areCategoriesEqual(existingScore.categories, newCategoriesMap);

    if (!hasChanged) {
      // If nothing changed, just touch the timestamp and report back.
      // Calling .save() on an unmodified document will still update the `updatedAt` timestamp.
      await existingScore.save();
      logger.info("Score refresh checked, no changes detected.", { userId });

      return res.status(200).json({
        status: ScoreRefreshStatus.NoChange,
        message: "Score is already up to date",
        score: existingScore.toObject(),
      });
    }

    // Case 3: Score exists and has changed. Archive the old one and update.
    existingScore.history.push({
      totalScore: existingScore.totalScore,
      categories: existingScore.categories,
      calculatedAt: existingScore.updatedAt,
    });

    existingScore.totalScore = newTotalScore;
    existingScore.categories = newCategoriesMap;
    user.reputationScore = newTotalScore;

    await Promise.all([existingScore.save(), user.save()]);
    logger.info("Score updated and previous version archived", { userId });

    res.status(200).json({
      status: ScoreRefreshStatus.Updated,
      message: "Score refreshed successfully",
      score: existingScore.toObject(),
    });
  } catch (err: any) {
    console.log("Error refreshing score", { error: err });
    logger.error("Error refreshing score", { userId, error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, "Could not refresh score")
    );
  }
}

/**
 * Gets the current score for the authenticated user.
 * Returns a lightweight object with just the total and the achieved reason keys.
 */
export async function getScore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError(401, "User not authenticated"));
  }

  try {
    const scoreDoc = await Score.findOne({ user: userId }).lean();

    if (!scoreDoc) {
      // It's good practice to return a predictable shape even if no score exists
      return res.status(200).json({
        totalScore: 0,
        calculatedAt: null,
        categories: {}, // Return empty object
        score_exists: false,
      });
    }

    res.status(200).json({
      totalScore: scoreDoc.totalScore,
      calculatedAt: scoreDoc.updatedAt,
      categories: scoreDoc.categories,
      score_exists: true,
    });
  } catch (err: any) {
    logger.error("Error getting score", { userId, error: err });
    return next(new HttpError(500, "Could not retrieve score"));
  }
}

/**
 * Gets all active score category definitions.
 * This is static data used by the frontend to build the UI.
 */
export async function getScoreCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Fetch all display and reason data from the Category collection
    const categories = await Category.find({ active: true })
      .sort({ order: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (err: any) {
    logger.error("Error getting score categories", { error: err });
    return next(new HttpError(500, "Could not retrieve score categories"));
  }
}
