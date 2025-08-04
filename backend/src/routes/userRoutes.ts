import { Router } from "express";
import {
  getLoggedInUser,
  getPublicProfileByAddress,
} from "~/controller/userController";
import { authMiddleware } from "~/middleware/auth";

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get the logged-in user's profile, score, and badges
 * @access  Private
 */
router.get("/me", authMiddleware, getLoggedInUser);

/**
 * @route   GET /api/v1/profile/:address
 * @desc    Get a user's public profile, score, and badges by their address
 * @access  Public
 */
router.get("/public/:address", getPublicProfileByAddress);

export default router;
