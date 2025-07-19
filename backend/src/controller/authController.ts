// src/controllers/AuthController.ts

import { Request, Response, NextFunction } from "express";
import { signatureVerify } from "@polkadot/util-crypto";
import jwt from "jsonwebtoken";
import { User } from "~/models/User";
import { JWT_REFRESH_SECRET } from "~/constant";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";
import { generateAccessToken, generateRefreshToken } from "~/utils/authTokens";
import crypto from "crypto";
import { Challenge } from "~/models/Challenge";
import { Profile } from "~/models/Profile";
import { LoginHistory } from "~/models/LoginHistory";
import { Types } from "mongoose";

// Request a new challenge
export async function requestChallenge(
  req: Request<{}, {}, { address: string }>,
  res: Response,
  next: NextFunction
) {
  const { address } = req.body;
  // create a random nonce
  const nonce = crypto.randomBytes(16).toString("hex");
  // expire in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // build a clear message
  const message = `Login to DotPassport. \nNonce: ${nonce}`;

  try {
    // upsert the challenge
    await Challenge.findOneAndUpdate(
      { address },
      { address, nonce, message, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ message });
  } catch (err: any) {
    logger.error("Error creating challenge", { error: err });
    return next(new HttpError(500, "Could not generate challenge"));
  }
}

// Sign & verify
export async function polkadotLogin(
  req: Request<{}, {}, { address: string; message: string; signature: string }>,
  res: Response,
  next: NextFunction
) {
  const { address, message, signature } = req.body;

  try {
    // Lookup & validate the challenge
    const chal = await Challenge.findOne({ address, used: false });
    if (!chal) throw new HttpError(400, "No challenge found for address");
    if (chal.expiresAt < new Date())
      throw new HttpError(400, "Challenge expired");
    if (chal.message !== message) throw new HttpError(400, "Message mismatch");

    // Verify on‑chain signature
    const { isValid } = signatureVerify(message, signature, address);
    if (!isValid) throw new HttpError(401, "Invalid signature");

    logger.info("Polkadot login successful", { address });

    // Consume challenge (preventing replay)
    chal.used = true;
    chal.usedAt = new Date();
    await chal.save();

    // Upsert user by address
    let user = await User.findOneAndUpdate(
      { addresses: address },
      { $addToSet: { addresses: address } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!user) {
      logger.error("Failed to create or find user", { address });
      return next(new HttpError(500, "User creation failed"));
    }

    // Ensure Profile exists
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({ user: user._id });
    }

    // Stamp lastLogin & record in history
    user.profile = profile._id as Types.ObjectId;
    user.lastLogin = new Date();
    const hist = await LoginHistory.create({
      user: user._id,
      address,
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
      success: true,
    });
    if (hist._id) {
      logger.info("Login history created", {
        user: user._id,
        address,
        historyId: hist._id,
      });
    } else {
      logger.warn("Login history creation failed", { user: user._id, address });
    }

    user.loginHistory.push(hist._id as Types.ObjectId);

    await user.save();

    // Issue JWTs
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, address, profile: profile._id },
    });
  } catch (err: any) {
    logger.error("Error in polkadotLogin", { error: err });
    return next(
      err instanceof HttpError
        ? err
        : new HttpError(500, "Authentication failed")
    );
  }
}

// POST /api/v1/auth/refresh
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn("Refresh token missing");
    return next(new HttpError(401, "Unauthorized"));
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Refresh" || !token) {
    logger.warn("Bad refresh scheme or missing token", { authHeader });
    return next(new HttpError(401, "Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const newAccessToken = generateAccessToken(payload.id);
    return res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      logger.info("Refresh token expired", { error: err });
      return next(new HttpError(401, "TOKEN_EXPIRED"));
    }
    logger.error("Error in refreshToken", { error: err });
    return next(new HttpError(500, "Internal Server Error"));
  }
}

// POST /api/v1/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  // If you maintain a blacklist or store refresh tokens server‑side, revoke it here.
  // For stateless JWT, you can just respond OK and let the frontend drop tokens.
  logger.info("User logged out", { user: req.user?.id });
  return res.status(200).json({ message: "Logged out" });
}
