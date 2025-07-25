import { Router } from "express";
import { getScore, getScoreCategories, refreshScore } from "~/controller/scoreController";
import { authMiddleware } from "~/middleware/auth";

const router = Router();

/**
 * @route   GET /api/v1/scores
 * @desc    Get the authenticated user's current score with detailed breakdown
 * @access  Private
 */
router.get("/", authMiddleware, getScore);


/**
 * @route   GET /api/v1/scores/categories
 * @desc    Get all score category definitions for building UI
 * @access  Public
 */
router.get("/categories", getScoreCategories);


/**
 * @route   POST /api/v1/scores/refresh
 * @desc    Calculate and update the user's score
 * @access  Private
 */
router.post("/refresh", authMiddleware, refreshScore);

export default router;
