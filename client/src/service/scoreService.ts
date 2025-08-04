import api, { publicApi } from "@/lib/api"; // Authenticated instance
import axios from "axios"; // For public calls
import { UserScore, ScoreCategory, RefreshScoreResponse } from "@/types/api";

/**
 * (Private) Gets the authenticated user's current score breakdown.
 */
export const getUserScore = async (): Promise<UserScore> => {
  const response = await api.get<UserScore>("/score");
  // if score exist is false then call the refresh endpoint and once it's done, then re call this endpoint
  return response.data;
};

/**
 * (Private) Triggers a recalculation of the user's score on the backend.
 */
export const refreshUserScore = async (): Promise<RefreshScoreResponse> => {
  const response = await api.post<RefreshScoreResponse>("/score/refresh");
  return response.data;
};

/**
 * (Public) Gets the definitions for all score categories to build UI.
 */
export const getScoreCategories = async (): Promise<{
  categories: ScoreCategory[];
}> => {
  const response = await publicApi.get<{ categories: ScoreCategory[] }>(
    "/score/categories"
  );
  return response.data;
};
