// src/services/badges/badgeService.ts

import { OnChainBadgeMetrics } from "./types";
import { BADGE_DEFINITIONS, BadgeKey } from "./badgeDefinitions";
import { logger } from "~/utils/logger";
import { HttpError } from "~/errors/HttpError";

import {
  fetchAccountAgeDays,
  fetchExtrinsicsList,
  fetchReferendaVotes,
  fetchAccountRewardSlashList,
  fetchAccountTokenList,
} from "~/service/subscan";
import { getOwnedNfts } from "~/service/kodadot";
import { ExtrinsicRecord } from "~/service/subscan/types";

/**
 * Handles pagination to fetch all extrinsics for a given address.
 * @param address The user's wallet address.
 * @returns An object containing the total count and a complete list of all extrinsics.
 */
async function fetchAllExtrinsics(
  address: string
): Promise<{ count: number; extrinsics: ExtrinsicRecord[] }> {
  const ROW_LIMIT = 100;

  const initialResponse = await fetchExtrinsicsList({
    address,
    row: ROW_LIMIT,
    page: 0,
  });
  const { count, extrinsics: firstPageExtrinsics } = initialResponse;

  if (count <= ROW_LIMIT) {
    return { count, extrinsics: firstPageExtrinsics };
  }

  const totalPages = Math.ceil(count / ROW_LIMIT);
  const pagePromises: Promise<{
    count: number;
    extrinsics: ExtrinsicRecord[];
  }>[] = [];

  for (let page = 1; page < totalPages; page++) {
    pagePromises.push(fetchExtrinsicsList({ address, row: ROW_LIMIT, page }));
  }

  const remainingPages = await Promise.all(pagePromises);

  const allExtrinsics = remainingPages.reduce(
    (acc, pageResponse) => acc.concat(pageResponse.extrinsics),
    firstPageExtrinsics
  );

  return { count, extrinsics: allExtrinsics };
}

/**
 * Fetches and processes all on-chain data required for badge evaluation.
 * @param address The user's wallet address.
 * @returns A promise resolving to an OnChainBadgeMetrics object.
 */
async function fetchOnChainBadgeMetrics(
  address: string
): Promise<OnChainBadgeMetrics> {
  // --- Step 1: Fetch all data in parallel ---
  const [
    extrinsicRes,
    ageDays,
    referendaRes,
    slashRes,
    rewardsInfo, // This will now hold the initial rewards call result
    tokenList,
  ] = await Promise.all([
    fetchAllExtrinsics(address).catch(() => ({ count: 0, extrinsics: [] })),
    fetchAccountAgeDays(address).catch(() => 0),
    fetchReferendaVotes({ account: address }).catch(() => ({
      count: 0,
      list: [],
    })),
    fetchAccountRewardSlashList({ address, category: "Slash" }).catch(() => ({
      count: 0,
      list: [],
    })),
    fetchAccountRewardSlashList({ address, category: "Reward", row: 1 }).catch(
      () => ({ count: 0, list: [] })
    ),
    fetchAccountTokenList(address).catch(() => []),
    
  ]);

  const nftRes = await getOwnedNfts(address).catch(() => ({ totalCount: 0, data: [] }));
  logger.info("Fetched NFTs for address", { address, count: nftRes.totalCount });   

  // --- Step 2: Calculate Nominator Active Months (with correct pagination) ---
  let nominatorActiveMonths = 0;
  if (rewardsInfo.count > 0) {
    const ROW_LIMIT = 100; // Default row limit used by the API
    // Calculate the last page index
    const lastPageIndex = Math.floor((rewardsInfo.count - 1) / ROW_LIMIT);
    // Fetch the last page of rewards
    const lastPageRewards = await fetchAccountRewardSlashList({
      address,
      category: "Reward",
      page: lastPageIndex,
    });

    // The last item on the last page is the user's first-ever reward
    const firstReward = lastPageRewards.list?.[lastPageRewards.list.length - 1];

    if (firstReward) {
      const firstRewardTimestamp = firstReward.block_timestamp * 1000;
      const months =
        (Date.now() - firstRewardTimestamp) / (1000 * 60 * 60 * 24 * 30.44);
      nominatorActiveMonths = months;
    }
  }

  // --- Step 3: Process Extrinsics for other metrics ---
  let batchTxCount = 0;
  let treasuryVoteCount = 0;
  let identityStatus = 0;
  let parachainInteractionCount = 0;

  const nominatorActiveMonthsWithoutSlashes =
    slashRes.count === 0 ? nominatorActiveMonths : 0;

  for (const ext of extrinsicRes.extrinsics) {
    const fullCall = `${ext.call_module.toLowerCase()}.${ext.call_module_function.toLowerCase()}`;

    if (fullCall === "utility.batch" || fullCall === "utility.batch_all")
      batchTxCount++;
    if (ext.call_module.toLowerCase() === "treasury") treasuryVoteCount++;
    if (fullCall === "identity.set_identity" && ext.success) identityStatus = 1;
    if (
      ext.call_module.toLowerCase().includes("xcm") ||
      ext.call_module.toLowerCase().includes("dmp")
    )
      parachainInteractionCount++;
  }

  // --- Step 4: Assemble the final metrics object ---
  const metrics: OnChainBadgeMetrics = {
    extrinsicCount: extrinsicRes.count,
    accountAgeDays: ageDays,
    referendaVoteCount: referendaRes.count,
    slashCount: slashRes.count,
    nftCount: nftRes.totalCount,
    parachainAssetCount: tokenList.length,
    batchTxCount,
    treasuryVoteCount,
    identityStatus,
    parachainInteractionCount,
    nominatorActiveMonths,
    nominatorActiveMonthsWithoutSlashes,
  };

  return metrics;
}

/**
 * Checks all defined badges for a given user address and returns the achieved levels.
 * @param address The user's wallet address.
 * @returns A record mapping each earned BadgeKey to its achieved level.
 */
export async function checkUserBadges(
  address: string
): Promise<Record<BadgeKey, number>> {
  try {
    logger.info("Starting badge check for user", { address });

    const metrics = await fetchOnChainBadgeMetrics(address);
    logger.info("Fetched on-chain metrics for badge check", {
      address,
      metrics,
    });

    const earnedBadges: Record<BadgeKey, number> = {} as Record<
      BadgeKey,
      number
    >;

    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      const metricValue = (metrics as any)[badge.metric];

      if (typeof metricValue === "undefined") {
        logger.warn(
          `Metric '${badge.metric}' not found for badge '${badge.key}'`,
          { address }
        );
        continue;
      }

      if (badge.key === BadgeKey.TrustedNominator) {
        if (metrics.nominatorActiveMonths >= 6 && metrics.slashCount === 0) {
          earnedBadges[badge.key] = 1;
        }
        continue;
      }

      const achievedLevel = badge.evaluator(metricValue, badge.levels);

      if (achievedLevel > 0) {
        earnedBadges[badge.key] = achievedLevel;
      }
    }

    logger.info("Badge check completed", { address, earnedBadges });
    return earnedBadges;
  } catch (err) {
    logger.error("Error during badge checking process", {
      address,
      error: err,
    });
    throw new HttpError(500, "Failed to check user badges.");
  }
}
