import { parseUnits } from "~/utils/balanceFormatter";
import { logger } from "~/utils/logger";
import { CategoryKey } from "./scoreDefinitions";
import { HttpError } from "~/errors/HttpError";

import { User } from "~/models/User"; // Adjust paths as needed
import { ICategoryScore, Score } from "~/models/Score";

import { getOwnedNfts, NftItem } from "../kodadot";
import {
  fetchAccountAgeDays,
  fetchTransfersList,
  fetchExtrinsicsList,
  fetchReferendaVotes,
  fetchAccountRewardSlashList,
  fetchVotedValidatorsList,
  fetchStakingRewardSum,
  fetchAccountTokenList,
} from "../subscan";
import type { Transfer, ExtrinsicRecord } from "../subscan/types";
import {
  calculateExtrinsicDepthScore,
  calculateGovernanceScore,
  calculateLongevityScore,
  calculateModulesScore,
  calculateNftActivityScore,
  calculateNftHoldingsScore,
  calculateStakingNominatorsScore,
  calculateStakingRewardsScore,
  calculateStakingSlashScore,
  calculateTokenDiversityScore,
  calculateTxCountScore,
  calculateTxVolumeScore,
} from "./calculateScore";
import { OnChainMetrics, ScoreBreakdown, ScoreRefreshStatus, DataFetchErrorType, ScoreErrorMetadata, ScoreResult } from "./types";
import { Category, CategoryDoc } from "~/models/Category";

type ReturnType = {
  total: number;
  categories: ScoreBreakdown;
};

/**
 * Classifies an error into a specific type for better error reporting
 */
function classifyError(error: any): DataFetchErrorType {
  if (error.statusCode === 404 || error.message?.includes('not found')) {
    return DataFetchErrorType.AccountNotFound;
  }
  if (error.statusCode === 429 || error.message?.includes('rate limit')) {
    return DataFetchErrorType.RateLimited;
  }
  if (error.message?.includes('network') || error.code === 'ECONNREFUSED') {
    return DataFetchErrorType.NetworkError;
  }
  if (error.statusCode >= 500) {
    return DataFetchErrorType.ApiError;
  }
  return DataFetchErrorType.Unknown;
}

/**
 * Fetches all necessary data from various sources and processes it into raw metrics.
 * @param address The user's wallet address.
 * @returns An object containing all the raw metrics for scoring and any errors encountered.
 */
async function fetchAndProcessOnChainData(
  address: string
): Promise<{ metrics: OnChainMetrics; errors: ScoreErrorMetadata[] }> {
  const errors: ScoreErrorMetadata[] = [];

  // Helper to handle errors consistently
  const handleError = (
    category: string,
    error: any,
    fallbackValue: any
  ) => {
    const errorType = classifyError(error);
    logger.warn(`Data fetch failed for ${category}`, {
      address,
      errorType,
      message: error.message,
    });

    errors.push({
      category,
      errorType,
      message: error.message || 'Unknown error',
      usedFallback: true,
    });

    return fallbackValue;
  };

  // 1) Parallel data fetch with individual error handling
  const [
    ageDays,
    transfersRes,
    extrinsicsRes,
    referendaRes,
    slashRes,
    votedValidators,
    stakingRew,
    tokenList,
  ] = await Promise.all([
    fetchAccountAgeDays(address).catch((err) =>
      handleError('accountAge', err, 0)
    ),
    fetchTransfersList({ address }).catch((err) =>
      handleError('transfers', err, { count: 0, transfers: [] })
    ),
    fetchExtrinsicsList({ address }).catch((err) =>
      handleError('extrinsics', err, { count: 0, extrinsics: [] })
    ),
    fetchReferendaVotes({ account: address }).catch((err) =>
      handleError('governance', err, { count: 0, list: [] })
    ),
    fetchAccountRewardSlashList({ address, category: "Slash" }).catch((err) =>
      handleError('slashes', err, { count: 0, list: [] })
    ),
    fetchVotedValidatorsList(address).catch((err) =>
      handleError('validators', err, [])
    ),
    fetchStakingRewardSum({
      address,
      start: "2024-01-01",
      end: new Date().toISOString().slice(0, 10),
    }).catch((err) =>
      handleError('stakingRewards', err, 0)
    ),
    fetchAccountTokenList(address).catch((err) =>
      handleError('tokens', err, [])
    ),
  ]);

  // 2) NFT fetch (non-critical, always use fallback on error)
  let nftRes: { data: NftItem[]; totalCount: number } = {
    data: [],
    totalCount: 0,
  };
  try {
    nftRes = await getOwnedNfts(address);
  } catch (err: any) {
    handleError('nfts', err, { data: [], totalCount: 0 });
  }

  // 3) Process raw metrics with type safety
  const txVolumeDOT = (transfersRes.transfers ?? [])
    .map((t: Transfer) => parseUnits(t.amount_v2 ?? "0", 10))
    .reduce((s: number, v: number) => s + v, 0);
  const nftEvents = (nftRes.data ?? [])
    .map((i: NftItem) => i.events?.length ?? 0)
    .reduce((s: number, v: number) => s + v, 0);
  const distinctMods = new Set(
    (extrinsicsRes.extrinsics ?? []).map((x: ExtrinsicRecord) => x.call_module)
  ).size;

  return {
    metrics: {
      ageDays,
      txCount: transfersRes.count ?? 0,
      txVolumeDOT,
      distinctMods,
      govAvailable: referendaRes.count ?? 0,
      govCast: referendaRes.list?.length ?? 0,
      slashCount: slashRes.count ?? 0,
      numValidators: votedValidators?.length ?? 0,
      stakingRew,
      tokenCount: tokenList?.length ?? 0,
      nftHeld: nftRes.totalCount ?? 0,
      nftEvents,
      extrCount: extrinsicsRes.count ?? 0,
    },
    errors,
  };
}

/**
 * Calculate a friendly, tier‑based reputation score for an address.
 * This function orchestrates fetching data and calculating scores.
 */
export async function calculateScore(address: string): Promise<ScoreResult> {
  try {
    logger.info("Starting score calculation", { address });

    const categoryDetails = await Category.find({ active: true }).lean<
      CategoryDoc[]
    >();

    // Now TypeScript knows categoryDetails is an array, and .map() will work
    const categoryMap = new Map(
      categoryDetails.map((c) => [c.key, { title: c.displayName }])
    );

    // console.log("Category map", categoryMap);

    // 1) Fetch and process all data into a clean metrics object (now returns errors too)
    const { metrics, errors } = await fetchAndProcessOnChainData(address);

    const calculatedScores = {
      [CategoryKey.Longevity]: calculateLongevityScore(metrics.ageDays),
      [CategoryKey.TxCount]: calculateTxCountScore(metrics.txCount),
      [CategoryKey.TxVolume]: calculateTxVolumeScore(metrics.txVolumeDOT),
      [CategoryKey.Modules]: calculateModulesScore(metrics.distinctMods),
      [CategoryKey.Governance]: calculateGovernanceScore(
        metrics.govCast,
        metrics.govAvailable
      ),
      [CategoryKey.StakingRewards]: calculateStakingRewardsScore(
        metrics.stakingRew
      ),
      [CategoryKey.StakingNominators]: calculateStakingNominatorsScore(
        metrics.numValidators
      ),
      [CategoryKey.StakingSlash]: calculateStakingSlashScore(
        metrics.slashCount
      ),
      [CategoryKey.TokenDiversity]: calculateTokenDiversityScore(
        metrics.tokenCount
      ),
      [CategoryKey.NftHoldings]: calculateNftHoldingsScore(metrics.nftHeld),
      [CategoryKey.NftActivity]: calculateNftActivityScore(metrics.nftEvents),
      [CategoryKey.ExtrinsicDepth]: calculateExtrinsicDepthScore(
        metrics.extrCount
      ),
    };

    const categories = Object.fromEntries(
      Object.entries(calculatedScores).map(([key, value]) => {
        // ... (your mapping logic)
        const categoryKey = key as CategoryKey;
        return [
          categoryKey,
          {
            ...value,
            title: categoryMap.get(categoryKey)?.title || categoryKey,
          },
        ];
      })
      // Use 'as unknown as' for a safe and explicit type assertion
    ) as unknown as ScoreBreakdown;

    // console.log("Calculated scores", categories);

    // 3) Aggregate total score from the categories
    const total = Object.values(categories).reduce(
      (sum, category) => sum + category.score,
      0
    );

    logger.info("Final score breakdown", { categories, errors });

    return {
      total,
      categories,
      errors: errors.length > 0 ? errors : undefined,
      isPartial: errors.length > 0,
    };
  } catch (err) {
    console.log("Error calculating score", err);
    logger.error("Error calculating score", { address, error: err });
    throw new HttpError(500, "Score calculation failed");
  }
}

/**
 * Refreshes the score for the authenticated user.
 * If a score exists, it archives the old one and saves the new one.
 * If no score exists, it creates a new one.
 */
function areCategoriesEqual(
  map1: Map<CategoryKey, ICategoryScore>,
  map2: Map<CategoryKey, ICategoryScore>
): boolean {
  if (map1.size !== map2.size) {
    return false;
  }
  // A practical way to deep-compare the content for this structure
  return (
    JSON.stringify(Array.from(map1.entries())) ===
    JSON.stringify(Array.from(map2.entries()))
  );
}

/**
 * Refreshes the score for a given user. This function contains the core logic
 * and is decoupled from the Express request/response cycle.
 * @param userId - The ID of the user whose score needs to be refreshed.
 * @returns An object containing the status and the final score document.
 */
export async function updateUserScore(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.addresses || user.addresses.length === 0) {
    throw new HttpError(404, "User or user address not found");
  }
  const address = user.addresses[0];

  logger.info("Starting score refresh", { userId });

  // 1. FETCH CATEGORY DETAILS TO ENRICH OLD DATA IF NEEDED
  const categoryDetails = await Category.find({ active: true }).lean<
    CategoryDoc[]
  >();
  const categoryMap = new Map(
    categoryDetails.map((c) => [c.key, { title: c.displayName }])
  );

  const { total: newTotalScore, categories: newCategories, errors, isPartial } =
    await calculateScore(address);
  const newCategoriesMap = new Map(Object.entries(newCategories)) as Map<
    CategoryKey,
    ICategoryScore
  >;

  // Log if there were any errors during score calculation
  if (isPartial && errors) {
    logger.warn("Score calculation completed with errors", { userId, errors });
  }

  const existingScore = await Score.findOne({ user: userId });

  // Case 1: No score exists. Create it (no changes needed here).
  if (!existingScore) {
    const newScore = await Score.create({
      user: userId,
      totalScore: newTotalScore,
      categories: newCategoriesMap,
    });
    user.reputationScore = newTotalScore;
    await user.save();
    logger.info("New score created for user", { userId });
    return { status: ScoreRefreshStatus.Created, score: newScore };
  }

  // Case 2: Score exists. Check for changes (no changes needed here).
  const hasChanged =
    existingScore.totalScore !== newTotalScore ||
    !areCategoriesEqual(existingScore.categories, newCategoriesMap);

  if (!hasChanged) {
    existingScore.updatedAt = new Date(); // Explicitly update timestamp
    await existingScore.save(); // Just to update the `updatedAt` timestamp
    logger.info("Score refresh checked, no changes detected.", { userId });
    return { status: ScoreRefreshStatus.NoChange, score: existingScore };
  }

  // Case 3: Score exists and has changed. Archive and update.
  
  // 2. CREATE A NEW MAP FOR THE HISTORY WITH TITLES ADDED
  const categoriesForHistory = new Map<CategoryKey, ICategoryScore>();
  for (const [key, scoreData] of existingScore.categories.entries()) {
    categoriesForHistory.set(key, {
      score: scoreData.score,
      reason: scoreData.reason,
      // Add the title if it's missing from the old database entry
      title: scoreData.title || categoryMap.get(key)?.title || key,
    });
  }

  // 3. PUSH THE ENRICHED DATA TO THE HISTORY ARRAY
  existingScore.history.push({
    totalScore: existingScore.totalScore,
    categories: categoriesForHistory, // Use the new, fixed map
    calculatedAt: existingScore.updatedAt,
  });
  
  existingScore.totalScore = newTotalScore;
  existingScore.categories = newCategoriesMap;
  user.reputationScore = newTotalScore;

  await Promise.all([existingScore.save(), user.save()]);
  logger.info("Score updated and previous version archived", { userId });

  return { status: ScoreRefreshStatus.Updated, score: existingScore };
}

