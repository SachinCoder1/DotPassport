import api from './api';
import type { PaginatedRequestLogs, RequestLogFilters, RequestStats } from '~/types/requestLog';

/**
 * Gets paginated request logs for the authenticated user.
 * Uses JWT authentication - address is derived from the access token.
 * @param {RequestLogFilters} filters Filter and pagination options.
 * @returns {Promise<PaginatedRequestLogs>} Paginated request logs.
 */
export const getRequestLogs = async (
  filters: RequestLogFilters = {}
): Promise<PaginatedRequestLogs> => {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.endpoint) params.append('endpoint', filters.endpoint);
  if (filters.method) params.append('method', filters.method);
  if (filters.statusCode) params.append('statusCode', filters.statusCode.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get<{ success: boolean; data: PaginatedRequestLogs }>(`/sandbox/logs?${params.toString()}`);
  return response.data.data; // Extract nested data
};

/**
 * Gets request statistics for the authenticated user.
 * Uses JWT authentication - address is derived from the access token.
 * @returns {Promise<RequestStats>} Request statistics.
 */
export const getRequestStats = async (): Promise<RequestStats> => {
  const response = await api.get<{ success: boolean; data: RequestStats }>('/sandbox/stats');
  return response.data.data; // Extract nested data
};

/**
 * Gets status code color for display.
 * @param {number} statusCode HTTP status code.
 * @returns {string} Tailwind color class.
 */
export const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) return 'text-green-500';
  if (statusCode >= 400 && statusCode < 500) return 'text-orange-500';
  if (statusCode >= 500) return 'text-red-500';
  return 'text-gray-500';
};

/**
 * Gets status code badge color for display.
 * @param {number} statusCode HTTP status code.
 * @returns {string} Tailwind background color class.
 */
export const getStatusBadgeColor = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) return 'bg-green-500/20 text-green-500';
  if (statusCode >= 400 && statusCode < 500) return 'bg-orange-500/20 text-orange-500';
  if (statusCode >= 500) return 'bg-red-500/20 text-red-500';
  return 'bg-gray-500/20 text-gray-500';
};
