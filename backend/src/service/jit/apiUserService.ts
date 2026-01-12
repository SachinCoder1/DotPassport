import { ApiUser, IApiUser } from '~/models/ApiUser';
import { calculateScore } from '~/service/score';
import { checkUserBadges } from '~/service/badge';
import { fetchAccountDetailsByAddress, clearAddressCache } from '~/service/subscan';
import { getOwnedNfts } from '~/service/kodadot';
import { logger } from '~/utils/logger';
import { Badge } from '~/models/Badge';
import { BadgeKey } from '~/service/badge/badgeDefinitions';

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
