import api, { publicApi } from "@/lib/api";
import { LoggedInUser, PublicProfile } from "@/types/api";

/**
 * (Public) Gets a user's public profile, score, and badges by their wallet address.
 */
export const getPublicProfile = async (
  address: string
): Promise<PublicProfile> => {
  const response = await publicApi.get<PublicProfile>(
    `/user/public/${address}`
  );
  return response.data;
};

/**
 * Fetches the currently logged-in user's data using the access token.
 * This uses the authenticated 'api' instance, so the token is sent automatically.
 * The interceptor will handle refreshing the token if it's expired.
 * @returns {Promise<LoggedInUser>} The user's profile data.
 */
export const getMe = async (): Promise<LoggedInUser> => {
  const response = await api.get<LoggedInUser>("/user/me");
  return response.data;
};
