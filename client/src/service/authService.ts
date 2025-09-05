import axios from "axios";
import api, { publicApi } from "@/lib/api"; // Our authenticated instance from the previous step

// --- TYPE DEFINITIONS ---

interface LoginPayload {
  address: string;
  message: string;
  signature: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    address: string;
    profile: string;
  };
}

/**
 * Requests a sign-in message (challenge) from the server.
 * This is a public route and does not use authentication.
 * @param {string} address The user's Polkadot wallet address.
 * @returns {Promise<{ message: string }>} The challenge message to be signed.
 */
export const requestChallenge = async (address: string) => {
  const response = await publicApi.post<{ message: string }>(
    "/auth/challenge",
    { address }
  );
  return response.data;
};

/**
 * Submits the signed message to log in the user and get tokens.
 * This is a public route that returns auth tokens upon success.
 * @param {LoginPayload} payload The address, original message, and signature.
 * @returns {Promise<LoginResponse>} Auth tokens and basic user information.
 */
export const loginWithPolkadot = async (payload: LoginPayload) => {
  const response = await publicApi.post<LoginResponse>(
    "/auth/polkadot",
    payload
  );

  // After a successful login, we immediately store the tokens
  const { accessToken, refreshToken } = response.data;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  return response.data;
};

/**
 * Submits an address to the test endpoint to mock a login for reviewers.
 * This is a public route that returns auth tokens upon success without a signature.
 * @param {string} address The Polkadot address to log in with.
 * @returns {Promise<LoginResponse>} Auth tokens and basic user information.
 */

export const loginForTest = async (address: string) => {
  const response = await publicApi.post<LoginResponse>("/auth/polkadot/test", {
    address,
  });

  // After a successful login, we also store the tokens
  const { accessToken, refreshToken } = response.data;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  return response.data;
};



/**
 * Logs the current user out.
 * This uses the authenticated 'api' instance because the server needs
 * to know which user is logging out via their access token.
 */
export const logoutUser = async () => {
  const response = await api.post<{ message: string }>("/auth/logout");

  // After a successful logout, clear tokens from storage
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return response.data;
};
