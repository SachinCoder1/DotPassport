import { Router } from "express";
import {
  getBadgeDefinitions,
  getUserBadges,
  refreshUserBadges,
} from "~/controller/badgeController";
import { authMiddleware } from "~/middleware/auth"; // Assuming this is your auth middleware

const router = Router();

/**
 * @route   GET /api/v1/badges/definitions
 * @desc    Get all available badge definitions for building the UI.
 * @access  Public
 */
router.get("/definitions", getBadgeDefinitions);

/**
 * @route   GET /api/v1/badges
 * @desc    Get the authenticated user's currently earned badges.
 * @access  Private
 */
router.get("/", authMiddleware, getUserBadges);

/**
 * @route   POST /api/v1/badges/refresh
 * @desc    Check for new achievements and update the user's earned badges.
 * @access  Private
 */
router.post("/refresh", authMiddleware, refreshUserBadges);

export default router;
