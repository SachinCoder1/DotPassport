import api, { publicApi } from "@/lib/api"; // Authenticated instance
import { UserBadge, BadgeDefinition, RefreshBadgesResponse, UserBadgeResponse } from "@/types/api";

/**
 * (Private) Gets all badges earned by the authenticated user.
 */
export const getUserBadges = async (): Promise<{ badges: UserBadge[] }> => {
  const response = await api.get<UserBadgeResponse>("/badge");
  // refresh the user badges if no badges are found.. badge_exists will be false
  if (response.data.badge_exists === false) {
    await refreshUserBadges();
  }

  // refetch the badges again to ensure we have the latest
  const updatedResponse = await api.get<UserBadgeResponse>("/badge");

  return updatedResponse.data;
};

/**
 * (Private) Triggers a check for new badge achievements for the user.
 */
export const refreshUserBadges = async (): Promise<RefreshBadgesResponse> => {
  const response = await api.post<RefreshBadgesResponse>("/badge/refresh");
  return response.data;
};

/**
 * (Public) Gets the definitions for all possible badges to build UI.
 */
export const getBadgeDefinitions = async (): Promise<{
  badges: BadgeDefinition[];
}> => {
  const response = await publicApi.get<{ badges: BadgeDefinition[] }>(
    "/badge/definitions"
  );
  return response.data;
};
