import { ApiKey } from '../models/ApiKey';
import { logger } from '~/utils/logger';
import { RateLimitResult } from '../types';

/**
 * Check if API key is within rate limits
 */
export async function checkRateLimit(apiKeyId: string): Promise<RateLimitResult> {
  const apiKey = await ApiKey.findById(apiKeyId);
  if (!apiKey) {
    throw new Error('API key not found');
  }

  const now = new Date();
  const usage = apiKey.usage;
  const limits = apiKey.rateLimits;
  let needsSave = false;

  // Check and reset hour window
  const hoursSinceHourStart =
    (now.getTime() - usage.currentHourWindowStart.getTime()) / (1000 * 60 * 60);
  if (hoursSinceHourStart >= 1) {
    usage.currentHourRequests = 0;
    usage.currentHourWindowStart = now;
    needsSave = true;
  }

  // Check and reset day window
  const daysSinceDayStart =
    (now.getTime() - usage.currentDayStart.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDayStart >= 1) {
    usage.currentDayRequests = 0;
    usage.currentDayStart = now;
    needsSave = true;
  }

  // Check and reset month window (30 days)
  const daysSinceMonthStart =
    (now.getTime() - usage.currentMonthStart.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceMonthStart >= 30) {
    usage.currentMonthRequests = 0;
    usage.currentMonthStart = now;
    needsSave = true;
  }

  // Save if any resets occurred
  if (needsSave) {
    await apiKey.save();
  }

  // Check limits (most restrictive first)
  if (usage.currentHourRequests >= limits.requestsPerHour) {
    const resetAt = new Date(
      usage.currentHourWindowStart.getTime() + 60 * 60 * 1000
    ).getTime();
    return {
      allowed: false,
      limit: limits.requestsPerHour,
      remaining: 0,
      resetAt,
      window: 'hour',
    };
  }

  if (usage.currentDayRequests >= limits.requestsPerDay) {
    const resetAt = new Date(
      usage.currentDayStart.getTime() + 24 * 60 * 60 * 1000
    ).getTime();
    return {
      allowed: false,
      limit: limits.requestsPerDay,
      remaining: 0,
      resetAt,
      window: 'day',
    };
  }

  if (usage.currentMonthRequests >= limits.requestsPerMonth) {
    const resetAt = new Date(
      usage.currentMonthStart.getTime() + 30 * 24 * 60 * 60 * 1000
    ).getTime();
    return {
      allowed: false,
      limit: limits.requestsPerMonth,
      remaining: 0,
      resetAt,
      window: 'month',
    };
  }

  // All checks passed
  const hourResetAt = new Date(
    usage.currentHourWindowStart.getTime() + 60 * 60 * 1000
  ).getTime();
  return {
    allowed: true,
    limit: limits.requestsPerHour,
    remaining: limits.requestsPerHour - usage.currentHourRequests,
    resetAt: hourResetAt,
    window: 'hour',
  };
}

/**
 * Track API key usage (increment counters)
 */
export async function trackApiKeyUsage(apiKeyId: string): Promise<void> {
  try {
    const now = new Date();

    await ApiKey.findByIdAndUpdate(apiKeyId, {
      $inc: {
        'usage.totalRequests': 1,
        'usage.currentHourRequests': 1,
        'usage.currentDayRequests': 1,
        'usage.currentMonthRequests': 1,
      },
      $set: {
        'usage.lastRequestAt': now,
        lastUsedAt: now,
      },
    });

    logger.debug('API key usage tracked', { apiKeyId });
  } catch (err: any) {
    logger.error('Error tracking API key usage', { apiKeyId, error: err });
    // Don't throw - usage tracking should not block requests
  }
}
