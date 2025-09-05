import { Request, Response, NextFunction } from "express";
import { HttpError } from "~/errors/HttpError";
import { IProfile } from "~/models/Profile";
import { Score } from "~/models/Score";
import { User } from "~/models/User";
import { UserBadge } from "~/models/UserBadge";
import { logger } from "~/utils/logger";

export async function getLoggedInUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findById(req.user?.id)
      .populate("profile")
      .select("addresses profile reputationScore lastLogin isActive")
      .lean();
    if (!user) {
      return next(new HttpError(404, "User not found"));
    }

    return res.json({
      name: (user?.profile as IProfile | null)?.displayName || "",
      wallet: user.addresses[0],
      profile: user.profile,
      reputationScore: user.reputationScore,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      success: true,
      isTester: user.isTester || false,
    });
  } catch (err: any) {
    logger.error("Error in getLoggedInUser", { error: err });
    return next(new HttpError(500, "Internal Server Error"));
  }
}

export async function getPublicProfileByAddress(
  req: Request<{ address: string }>,
  res: Response,
  next: NextFunction
) {
  const { address } = req.params;

  try {
    const user = await User.findOne({ addresses: address })
      .populate("profile")
      .lean();
    if (!user) {
      return next(new HttpError(404, "User not found"));
    }

    // Fetch score and badges in parallel
    const [score, badges] = await Promise.all([
      Score.findOne({ user: user._id }).lean(),
      UserBadge.find({ user: user._id }).lean(),
    ]);

    res.status(200).json({
      address: user.addresses[0],
      lastLogin: user.lastLogin,
      profile: user.profile, // Contains bio, display name etc.
      score: score
        ? {
            totalScore: score.totalScore,
            calculatedAt: score.updatedAt,
            categories: score.categories,
            score_exists: true,
          }
        : null,
      badges: badges,
    });
  } catch (err: any) {
    logger.error("Error fetching public profile", { address, error: err });
    return next(new HttpError(500, "Could not retrieve public profile"));
  }
}
