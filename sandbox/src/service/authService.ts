import api, { publicApi } from './api';
import type { AuthResponse, ChallengeResponse, RefreshTokenResponse } from '~/types/api';
import type { SandboxUser } from '~/types';

// --- TYPE DEFINITIONS ---

interface AuthenticatePayload {
  polkadotAddress: string;
  message: string;
  signature: string;
  contactEmail: string;
}

/**
 * Requests a challenge message from the server for Polkadot wallet authentication.
 * This is a public route and does not require authentication.
 * @param {string} polkadotAddress The user's Polkadot wallet address.
 * @returns {Promise<ChallengeResponse>} The challenge message to be signed.
 */
export const requestChallenge = async (polkadotAddress: string): Promise<ChallengeResponse> => {
  const response = await publicApi.post<ChallengeResponse>(
    '/sandbox/challenge',
    { polkadotAddress }
  );
  return response.data;
};

/**
 * Authenticates the user with Polkadot wallet signature.
 * Creates a new sandbox account or logs in existing user.
 * @param {AuthenticatePayload} payload The address, message, signature, and email.
 * @returns {Promise<AuthResponse>} Auth tokens and user information (including API key for new users).
 */
export const authenticateWithPolkadot = async (payload: AuthenticatePayload): Promise<AuthResponse> => {
  const response = await publicApi.post<AuthResponse>(
    '/sandbox/auth',
    payload
  );

  // Store tokens in localStorage
  const { accessToken, refreshToken } = response.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  return response.data;
};

/**
 * Refreshes the access token using the refresh token.
 * @param {string} refreshToken The refresh token.
 * @returns {Promise<RefreshTokenResponse>} New access token.
 */
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await publicApi.post<RefreshTokenResponse>(
    '/sandbox/refresh',
    { refreshToken }
  );

  // Update access token in localStorage
  const { accessToken } = response.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
  }

  return response.data;
};

/**
 * Gets the current user's information.
 * Requires authentication (JWT token).
 * @param {string} polkadotAddress The user's Polkadot address.
 * @returns {Promise<SandboxUser>} User information.
 */
export const getMe = async (polkadotAddress: string): Promise<SandboxUser> => {
  const response = await api.get(`/sandbox/me/${polkadotAddress}`);
  return response.data.data; // Extract data from { success: true, data: {...} }
};

/**
 * Logs out the current user.
 * Clears tokens from localStorage.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/sandbox/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear tokens from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};

/**
 * Regenerates the API key for the authenticated user.
 * Requires authentication (JWT token) and signature verification.
 * @param {object} payload The address, message, and signature.
 * @returns {Promise<{ apiKey: string; message: string }>} New API key.
 */
export const regenerateApiKey = async (payload: {
  polkadotAddress: string;
  message: string;
  signature: string;
}): Promise<{ apiKey: string; message: string }> => {
  const response = await api.post('/sandbox/regenerate-key', payload);
  return response.data;
};
