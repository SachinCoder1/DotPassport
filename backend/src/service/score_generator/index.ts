import { parseUnits } from "~/utils/balanceFormatter";
import { logger } from "~/utils/logger";
import { CategoryKey } from "~/config/scoreReasons";
import { HttpError } from "~/errors/HttpError";

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
import { OnChainMetrics, ScoreBreakdown } from "./types";

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

    // 1) Fetch and process all data into a clean metrics object
    const metrics = await fetchAndProcessOnChainData(address);

    // 2) Calculate score for each category using dedicated functions
    const categories: ScoreBreakdown = {
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
