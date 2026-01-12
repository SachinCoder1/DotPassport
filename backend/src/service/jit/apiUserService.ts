import { ApiUser, IApiUser } from '~/models/ApiUser';
import { calculateScore } from '~/service/score';
import { checkUserBadges } from '~/service/badge';
import { fetchAccountDetailsByAddress, clearAddressCache } from '~/service/subscan';
import { getOwnedNfts } from '~/service/kodadot';
import { logger } from '~/utils/logger';
import { Badge } from '~/models/Badge';
import { BadgeKey } from '~/service/badge/badgeDefinitions';

// Background job queue (in-memory, simple implementation)
const pendingBackgroundJobs = new Map<string, NodeJS.Timeout>();

/**
 * Queue a background job to fetch full user data.
 * Uses setImmediate to run after the response is sent.
 */
function queueBackgroundDataFetch(address: string, fetchType: 'full' | 'scores' | 'badges') {
  const jobKey = `${address}:${fetchType}`;

  // Don't queue if already pending
  if (pendingBackgroundJobs.has(jobKey)) {
    logger.debug('Background job already queued', { address, fetchType });
    return;
  }

  logger.info('Queueing background data fetch', { address, fetchType });

  // Use setImmediate to run after current event loop completes (response sent)
  const timeoutId = setTimeout(async () => {
    pendingBackgroundJobs.delete(jobKey);

    try {
      logger.info('Starting background data fetch', { address, fetchType });

      if (fetchType === 'full') {
        await fetchFullUserDataBackground(address);
      } else if (fetchType === 'scores') {
        await fetchScoresBackground(address);
      } else if (fetchType === 'badges') {
        await fetchBadgesBackground(address);
      }

      logger.info('Background data fetch completed', { address, fetchType });
    } catch (error) {
      logger.error('Background data fetch failed', {
        address,
        fetchType,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, 100); // Small delay to ensure response is sent first

  pendingBackgroundJobs.set(jobKey, timeoutId);
}

/**
 * Background job: Fetch all remaining data (scores + badges)
 */
async function fetchFullUserDataBackground(address: string): Promise<void> {
  const [scoreResult, checkedBadges, badgeDefinitions] = await Promise.all([
    calculateScore(address),
    checkUserBadges(address),
    Badge.find({ active: true }).lean(),
  ]);

  const earnedBadges = mapBadgesToEarned(checkedBadges, badgeDefinitions, address);

  await ApiUser.findOneAndUpdate(
    { address },
    {
      'score.totalScore': scoreResult.total,
      'score.categories': new Map(Object.entries(scoreResult.categories)),
      'score.calculatedAt': new Date(),
      badges: earnedBadges,
    }
  );
}

/**
 * Background job: Fetch only scores
 */
async function fetchScoresBackground(address: string): Promise<void> {
  const scoreResult = await calculateScore(address);

  await ApiUser.findOneAndUpdate(
    { address },
    {
      'score.totalScore': scoreResult.total,
      'score.categories': new Map(Object.entries(scoreResult.categories)),
      'score.calculatedAt': new Date(),
    }
  );
}

/**
 * Background job: Fetch only badges
 */
async function fetchBadgesBackground(address: string): Promise<void> {
  const [checkedBadges, badgeDefinitions] = await Promise.all([
    checkUserBadges(address),
    Badge.find({ active: true }).lean(),
  ]);

  const earnedBadges = mapBadgesToEarned(checkedBadges, badgeDefinitions, address);

  await ApiUser.findOneAndUpdate(
    { address },
    { badges: earnedBadges }
  );
}

/**
 * Helper: Map badge check results to earned badges array
 */
function mapBadgesToEarned(
  checkedBadges: Record<string, number>,
  badgeDefinitions: any[],
  address: string
) {
  const definitionsMap = new Map(badgeDefinitions.map((def) => [def.key, def]));
  const earnedBadges = [];
  const checkedBadgeKeys = Object.keys(checkedBadges) as BadgeKey[];

  for (const key of checkedBadgeKeys) {
    const achievedLevel = checkedBadges[key];
    const definition = definitionsMap.get(key);
    const levelInfo = definition?.levels.find((l: any) => l.level === achievedLevel);

    if (!levelInfo) {
      logger.warn(`Level info for badge ${key} at level ${achievedLevel} not found. Skipping.`, { address });
      continue;
    }

    earnedBadges.push({
      badgeKey: key,
      achievedLevel: achievedLevel,
      achievedLevelKey: levelInfo.key,
      achievedLevelTitle: levelInfo.title,
      earnedAt: new Date(), // Set to current time when badge is first detected
    });
  }

  return earnedBadges;
}

/**
 * Check if a string is a valid Polkadot address.
 * Polkadot addresses are 47-48 characters, base58 encoded.
 */
export function isValidPolkadotAddress(address: string): boolean {
  const regex = /^[1-9A-HJ-NP-Za-km-z]{47,48}$/;
  return regex.test(address);
}

/**
 * Get or create ApiUser by address.
 * If user exists and data is fresh (< 10 min), return cached.
 * If user exists but data is stale, refetch and update.
 * If user doesn't exist, fetch all data and create.
 */
export async function getOrCreateApiUser(
  address: string,
  forceRefresh = false
): Promise<IApiUser> {
  try {
    // If force refresh, clear all Subscan cache for this address
    if (forceRefresh) {
      logger.info('Force refresh requested, clearing Subscan cache', { address });
      clearAddressCache(address);
    }

    // Check if ApiUser exists
    let apiUser = await ApiUser.findOne({ address });

    // If exists and data is fresh, return cached
    if (apiUser && !forceRefresh) {
      const dataAge = Date.now() - apiUser.score.calculatedAt.getTime();
      const TEN_MINUTES = 10 * 60 * 1000;

      if (dataAge < TEN_MINUTES) {
        logger.debug('Returning cached ApiUser', {
          address,
          ageMinutes: Math.floor(dataAge / 60000),
        });

        // Update metadata: last requested + request count
        apiUser.metadata.lastRequestedAt = new Date();
        apiUser.metadata.requestCount += 1;
        apiUser.ttl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await apiUser.save();

        return apiUser;
      }
    }

    logger.info('Fetching on-chain data for ApiUser', { address, forceRefresh });

    // Fetch all data in parallel
    const [scoreResult, checkedBadges, accountDetails, badgeDefinitions, nftData] =
      await Promise.all([
        calculateScore(address),
        checkUserBadges(address),
        fetchAccountDetailsByAddress(address),
        Badge.find({ active: true }).lean(),
        getOwnedNfts(address).catch(() => ({ totalCount: 0, data: [] })),
      ]);

    // Map badge results to include level details
    const definitionsMap = new Map(
      badgeDefinitions.map((def) => [def.key, def])
    );

    const earnedBadges = [];
    const checkedBadgeKeys = Object.keys(checkedBadges) as BadgeKey[];

    for (const key of checkedBadgeKeys) {
      const achievedLevel = checkedBadges[key];
      const definition = definitionsMap.get(key);

      const levelInfo = definition?.levels.find(
        (l) => l.level === achievedLevel
      );

      if (!levelInfo) {
        logger.warn(
          `Level info for badge ${key} at level ${achievedLevel} not found. Skipping.`,
          { address }
        );
        continue;
      }

      earnedBadges.push({
        badgeKey: key,
        achievedLevel: achievedLevel,
        achievedLevelKey: levelInfo.key,
        achievedLevelTitle: levelInfo.title,
      });
    }

    // Extract account data from Subscan response
    const onChainData = accountDetails.data?.account;

    // Prepare data
    const now = new Date();
    const apiUserData = {
      address,
      profile: {
        displayName: onChainData?.display || undefined,
        polkadotIdentity: onChainData
          ? {
              address: onChainData.address,
              display: onChainData.display ?? undefined,
              legal: onChainData.legal ?? undefined,
              email: onChainData.email ?? undefined,
              web: onChainData.web ?? undefined,
              twitter: onChainData.twitter ?? undefined,
              github: onChainData.github ?? undefined,
              matrix: onChainData.matrix ?? undefined,
              discord: onChainData.discord ?? undefined,
              riot: onChainData.riot ?? undefined,
              judgements: onChainData.judgements ?? [],
              role: onChainData.role ?? undefined,
              nonce: onChainData.nonce ?? undefined,
            }
          : undefined,
        nftCount: nftData.totalCount || 0,
      },
      score: {
        totalScore: scoreResult.total,
        categories: new Map(
          Object.entries(scoreResult.categories)
        ),
        calculatedAt: now,
      },
      badges: earnedBadges,
      metadata: {
        firstRequestedAt: apiUser?.metadata.firstRequestedAt || now,
        lastRequestedAt: now,
        requestCount: (apiUser?.metadata.requestCount || 0) + 1,
        source: 'api' as const,
      },
      ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Upsert ApiUser
    if (apiUser) {
      Object.assign(apiUser, apiUserData);
      await apiUser.save();
      logger.info('Updated existing ApiUser', { address });
    } else {
      apiUser = await ApiUser.create(apiUserData);
      logger.info('Created new ApiUser', { address });
    }

    return apiUser;
  } catch (error) {
    logger.error('Error fetching ApiUser data', {
      address,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get or create ApiUser optimized for PROFILE endpoint.
 * Fast: Only fetches account details + NFTs (no heavy Subscan calls for scores/badges).
 * Queues background job to fetch scores and badges.
 */
export async function getOrCreateApiUserForProfile(
  address: string,
  forceRefresh = false
): Promise<IApiUser> {
  try {
    if (forceRefresh) {
      clearAddressCache(address);
    }

    // Check if ApiUser exists with fresh data
    let apiUser = await ApiUser.findOne({ address });

    if (apiUser && !forceRefresh) {
      const dataAge = Date.now() - (apiUser.metadata?.lastRequestedAt?.getTime() || 0);
      const TEN_MINUTES = 10 * 60 * 1000;

      if (dataAge < TEN_MINUTES) {
        logger.debug('Returning cached ApiUser for profile', { address });
        apiUser.metadata.lastRequestedAt = new Date();
        apiUser.metadata.requestCount += 1;
        apiUser.ttl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await apiUser.save();
        return apiUser;
      }
    }

    logger.info('Fetching profile data for ApiUser (fast path)', { address, forceRefresh });

    // Only fetch account details and NFTs (fast - minimal Subscan calls)
    const [accountDetails, nftData] = await Promise.all([
      fetchAccountDetailsByAddress(address),
      getOwnedNfts(address).catch(() => ({ totalCount: 0, data: [] })),
    ]);

    const onChainData = accountDetails.data?.account;
    const now = new Date();

    // Build minimal profile data
    const profileData = {
      displayName: onChainData?.display || undefined,
      polkadotIdentity: onChainData
        ? {
            address: onChainData.address,
            display: onChainData.display ?? undefined,
            legal: onChainData.legal ?? undefined,
            email: onChainData.email ?? undefined,
            web: onChainData.web ?? undefined,
            twitter: onChainData.twitter ?? undefined,
            github: onChainData.github ?? undefined,
            matrix: onChainData.matrix ?? undefined,
            discord: onChainData.discord ?? undefined,
            riot: onChainData.riot ?? undefined,
            judgements: onChainData.judgements ?? [],
            role: onChainData.role ?? undefined,
            nonce: onChainData.nonce ?? undefined,
          }
        : undefined,
      nftCount: nftData.totalCount || 0,
    };

    if (apiUser) {
      // Update existing user with fresh profile data
      apiUser.profile = profileData;
      apiUser.metadata.lastRequestedAt = now;
      apiUser.metadata.requestCount += 1;
      apiUser.ttl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await apiUser.save();
      logger.info('Updated ApiUser profile (fast path)', { address });
    } else {
      // Create new user with profile only (scores/badges will be fetched in background)
      apiUser = await ApiUser.create({
        address,
        profile: profileData,
        score: {
          totalScore: 0,
          categories: new Map(),
          calculatedAt: now,
        },
        badges: [],
        metadata: {
          firstRequestedAt: now,
          lastRequestedAt: now,
          requestCount: 1,
          source: 'api' as const,
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      logger.info('Created new ApiUser (profile only, fast path)', { address });

      // Queue background job to fetch scores and badges
      queueBackgroundDataFetch(address, 'full');
    }

    return apiUser;
  } catch (error) {
    logger.error('Error in getOrCreateApiUserForProfile', {
      address,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get or create ApiUser optimized for SCORES endpoint.
 * Medium: Fetches account details + scores (8+ Subscan calls).
 * Queues background job to fetch badges.
 */
export async function getOrCreateApiUserForScores(
  address: string,
  forceRefresh = false
): Promise<IApiUser> {
  try {
    if (forceRefresh) {
      clearAddressCache(address);
    }

    // Check if ApiUser exists with fresh scores
    let apiUser = await ApiUser.findOne({ address });

    if (apiUser && !forceRefresh) {
      const dataAge = Date.now() - apiUser.score.calculatedAt.getTime();
      const TEN_MINUTES = 10 * 60 * 1000;

      if (dataAge < TEN_MINUTES && apiUser.score.totalScore > 0) {
        logger.debug('Returning cached ApiUser for scores', { address });
        apiUser.metadata.lastRequestedAt = new Date();
        apiUser.metadata.requestCount += 1;
        apiUser.ttl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await apiUser.save();
        return apiUser;
      }
    }

    logger.info('Fetching scores data for ApiUser', { address, forceRefresh });

    // Fetch account details and scores (skip badges for now)
    const [accountDetails, scoreResult, nftData] = await Promise.all([
      fetchAccountDetailsByAddress(address),
      calculateScore(address),
      getOwnedNfts(address).catch(() => ({ totalCount: 0, data: [] })),
    ]);

    const onChainData = accountDetails.data?.account;
    const now = new Date();

    const apiUserData = {
      address,
      profile: {
        displayName: onChainData?.display || undefined,
        polkadotIdentity: onChainData
          ? {
              address: onChainData.address,
              display: onChainData.display ?? undefined,
              legal: onChainData.legal ?? undefined,
              email: onChainData.email ?? undefined,
              web: onChainData.web ?? undefined,
              twitter: onChainData.twitter ?? undefined,
              github: onChainData.github ?? undefined,
              matrix: onChainData.matrix ?? undefined,
              discord: onChainData.discord ?? undefined,
              riot: onChainData.riot ?? undefined,
              judgements: onChainData.judgements ?? [],
              role: onChainData.role ?? undefined,
              nonce: onChainData.nonce ?? undefined,
            }
          : undefined,
        nftCount: nftData.totalCount || 0,
      },
      score: {
        totalScore: scoreResult.total,
        categories: new Map(Object.entries(scoreResult.categories)),
        calculatedAt: now,
      },
      metadata: {
        firstRequestedAt: apiUser?.metadata.firstRequestedAt || now,
        lastRequestedAt: now,
        requestCount: (apiUser?.metadata.requestCount || 0) + 1,
        source: 'api' as const,
      },
      ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    if (apiUser) {
      // Preserve existing badges
      Object.assign(apiUser, { ...apiUserData, badges: apiUser.badges });
      await apiUser.save();
      logger.info('Updated ApiUser with scores', { address });
    } else {
      apiUser = await ApiUser.create({ ...apiUserData, badges: [] });
      logger.info('Created new ApiUser with scores (no badges yet)', { address });
    }

    // Queue background job to fetch badges if not already present
    if (!apiUser.badges || apiUser.badges.length === 0) {
      queueBackgroundDataFetch(address, 'badges');
    }

    return apiUser;
  } catch (error) {
    logger.error('Error in getOrCreateApiUserForScores', {
      address,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get or create ApiUser optimized for BADGES endpoint.
 * Slower: Fetches account details + badges (requires pagination).
 * Queues background job to fetch scores.
 */
export async function getOrCreateApiUserForBadges(
  address: string,
  forceRefresh = false
): Promise<IApiUser> {
  try {
    if (forceRefresh) {
      clearAddressCache(address);
    }

    // Check if ApiUser exists with badges
    let apiUser = await ApiUser.findOne({ address });

    if (apiUser && !forceRefresh) {
      const dataAge = Date.now() - (apiUser.metadata?.lastRequestedAt?.getTime() || 0);
      const TEN_MINUTES = 10 * 60 * 1000;

      if (dataAge < TEN_MINUTES && apiUser.badges && apiUser.badges.length > 0) {
        logger.debug('Returning cached ApiUser for badges', { address });
        apiUser.metadata.lastRequestedAt = new Date();
        apiUser.metadata.requestCount += 1;
        apiUser.ttl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await apiUser.save();
        return apiUser;
      }
    }

    logger.info('Fetching badges data for ApiUser', { address, forceRefresh });

    // Fetch account details and badges (skip scores for now)
    const [accountDetails, checkedBadges, badgeDefinitions, nftData] = await Promise.all([
      fetchAccountDetailsByAddress(address),
      checkUserBadges(address),
      Badge.find({ active: true }).lean(),
      getOwnedNfts(address).catch(() => ({ totalCount: 0, data: [] })),
    ]);

    const earnedBadges = mapBadgesToEarned(checkedBadges, badgeDefinitions, address);
    const onChainData = accountDetails.data?.account;
    const now = new Date();

    const apiUserData = {
      address,
      profile: {
        displayName: onChainData?.display || undefined,
        polkadotIdentity: onChainData
          ? {
              address: onChainData.address,
              display: onChainData.display ?? undefined,
              legal: onChainData.legal ?? undefined,
              email: onChainData.email ?? undefined,
              web: onChainData.web ?? undefined,
              twitter: onChainData.twitter ?? undefined,
              github: onChainData.github ?? undefined,
              matrix: onChainData.matrix ?? undefined,
              discord: onChainData.discord ?? undefined,
              riot: onChainData.riot ?? undefined,
              judgements: onChainData.judgements ?? [],
              role: onChainData.role ?? undefined,
              nonce: onChainData.nonce ?? undefined,
            }
          : undefined,
        nftCount: nftData.totalCount || 0,
      },
      badges: earnedBadges,
      metadata: {
        firstRequestedAt: apiUser?.metadata.firstRequestedAt || now,
        lastRequestedAt: now,
        requestCount: (apiUser?.metadata.requestCount || 0) + 1,
        source: 'api' as const,
      },
      ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    if (apiUser) {
      // Preserve existing score
      Object.assign(apiUser, { ...apiUserData, score: apiUser.score });
      await apiUser.save();
      logger.info('Updated ApiUser with badges', { address });
    } else {
      apiUser = await ApiUser.create({
        ...apiUserData,
        score: {
          totalScore: 0,
          categories: new Map(),
          calculatedAt: now,
        },
      });
      logger.info('Created new ApiUser with badges (no scores yet)', { address });
    }

    // Queue background job to fetch scores if not already calculated
    if (!apiUser.score || apiUser.score.totalScore === 0) {
      queueBackgroundDataFetch(address, 'scores');
    }

    return apiUser;
  } catch (error) {
    logger.error('Error in getOrCreateApiUserForBadges', {
      address,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
