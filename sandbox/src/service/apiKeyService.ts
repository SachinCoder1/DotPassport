import api from './api';
import type { ApiKeyStats } from '~/types/apiKey';

/**
 * Gets statistics for the authenticated user's API key.
 * The address is determined from the JWT token on the backend.
 * @returns {Promise<ApiKeyStats>} API key statistics.
 */
export const getApiKeyStats = async (): Promise<ApiKeyStats> => {
  const response = await api.get<{ success: boolean; data: ApiKeyStats }>('/sandbox/stats');
  return response.data.data; // Extract nested data
};

/**
 * Masks an API key for display (shows prefix and last 4 characters).
 * @param {string} apiKey The full API key.
 * @returns {string} Masked API key.
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 12) return apiKey;
  const prefix = apiKey.substring(0, 8);
  const suffix = apiKey.substring(apiKey.length - 4);
  return `${prefix}...${suffix}`;
};

/**
 * Copies text to clipboard.
 * @param {string} text The text to copy.
 * @returns {Promise<boolean>} Success status.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
