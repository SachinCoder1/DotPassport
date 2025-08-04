import { Request, Response, NextFunction } from "express";
import { Score } from "~/models/Score";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";
import { updateUserScore } from "~/service/score";
import { Category } from "~/models/Category";
import { ScoreRefreshStatus } from "~/service/score/types";

export async function refreshScore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) {
    return next(new HttpError(401, "User not authenticated"));
  }

  try {
    // Call the generic service function
    const { status, score } = await updateUserScore(userId);

    // Map the service status to a user-friendly message and HTTP status
    let httpStatus = 200;
    let message = "Score refreshed successfully";

    if (status === ScoreRefreshStatus.Created) {
      httpStatus = 201;
      message = "Score created successfully";
    } else if (status === ScoreRefreshStatus.NoChange) {
      message = "Score is already up to date";
    }

    res.status(httpStatus).json({
      status,
      message,
      score,
    });
  } catch (err: any) {
    console.error("Error refreshing score", { userId, error: err });
    logger.error("Error in refreshScore handler", { userId, error: err });
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
    let scoreDoc = await Score.findOne({ user: userId });

    // If no score exists, call the service to create it
    if (!scoreDoc) {
      logger.info("No score found for user, initiating creation.", { userId });
      const { score: newScore } = await updateUserScore(userId);
      scoreDoc = newScore;
    }

    res.status(200).json({
      totalScore: scoreDoc.totalScore,
      calculatedAt: scoreDoc.updatedAt,
      categories: scoreDoc.categories,
      score_exists: true, // This will always be true now
    });
  } catch (err: any) {
    logger.error("Error in getScore handler", { userId, error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, "Could not retrieve or create score")
    );
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

    res.status(200).json({
      categories,
      success: true,
      message: "Score categories retrieved successfully.",
    });
  } catch (err: any) {
    logger.error("Error getting score categories", { error: err });
    return next(new HttpError(500, "Could not retrieve score categories"));
  }
}
