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
import { OnChainMetrics, ScoreBreakdown, ScoreRefreshStatus } from "./types";
import { Category, CategoryDoc } from "~/models/Category";

type ReturnType = {
  total: number;
  categories: ScoreBreakdown;
};

/**
 * Fetches all necessary data from various sources and processes it into raw metrics.
 * @param address The user's wallet address.
 * @returns An object containing all the raw metrics for scoring.
 */
async function fetchAndProcessOnChainData(
  address: string
): Promise<OnChainMetrics> {
  // 1) Parallel data fetch
  const [
    ageDays = 0,
    transfersRes = { count: 0, transfers: [] },
    extrinsicsRes = { count: 0, extrinsics: [] },
    referendaRes = { count: 0, list: [] },
    slashRes = { count: 0, list: [] },
    votedValidators = [],
    stakingRew = 0,
    tokenList = [],
  ] = await Promise.all([
    fetchAccountAgeDays(address).catch(() => 0),
    fetchTransfersList({ address }).catch(() => ({
      count: 0,
      transfers: [],
    })),
    fetchExtrinsicsList({ address }).catch(() => ({
      count: 0,
      extrinsics: [],
    })),
    fetchReferendaVotes({ account: address }).catch(() => ({
      count: 0,
      list: [],
    })),
    fetchAccountRewardSlashList({ address, category: "Slash" }).catch(() => ({
      count: 0,
      list: [],
    })),
    fetchVotedValidatorsList(address).catch(() => []),
    fetchStakingRewardSum({
      address,
      start: "2024-01-01",
      end: new Date().toISOString().slice(0, 10),
    }).catch(() => 0),
    fetchAccountTokenList(address).catch(() => []),
  ]);

  // 2) NFT fetch
  let nftRes: { data: NftItem[]; totalCount: number } = {
    data: [],
    totalCount: 0,
  };
  try {
    nftRes = await getOwnedNfts(address);
  } catch {
    // ignore NFT fetch errors as it's non-critical
  }

  // 3) Process raw metrics
  const txVolumeDOT = (transfersRes.transfers ?? [])
    .map((t) => parseUnits(t.amount_v2 ?? "0", 10))
    .reduce((s, v) => s + v, 0);
  const nftEvents = nftRes.data
    .map((i) => i.events.length)
    .reduce((s, v) => s + v, 0);
  const distinctMods = new Set(
    extrinsicsRes.extrinsics.map((x) => x.call_module)
  ).size;

  return {
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
  };
}

/**
 * Calculate a friendly, tier‑based reputation score for an address.
 * This function orchestrates fetching data and calculating scores.
 */
export async function calculateScore(address: string): Promise<ReturnType> {
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

    // 1) Fetch and process all data into a clean metrics object
    const metrics = await fetchAndProcessOnChainData(address);

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

    logger.info("Final score breakdown", categories);

    return {
      total,
      categories,
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

  const { total: newTotalScore, categories: newCategories } =
    await calculateScore(address);
  const newCategoriesMap = new Map(Object.entries(newCategories)) as Map<
    CategoryKey,
    ICategoryScore
  >;

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

