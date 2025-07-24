// dotPassportScoring.ts
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
import { parseUnits } from "~/utils/balanceFormatter";
import { logger } from "~/utils/logger";
import {
  CategoryKey,
  LongevityReason,
  TxCountReason,
  TxVolumeReason,
  ModuleReason,
  GovernanceReason,
  StakingRewardsReason,
  StakingNominatorsReason,
  StakingSlashReason,
  TokenDiversityReason,
  NftHoldingsReason,
  NftActivityReason,
  ExtrinsicDepthReason,
} from "~/config/scoreReasons";
import { HttpError } from "~/errors/HttpError";

/**
 * Generic shape for a sub-score with its reason
 */
export interface CategoryScore<R> {
  score: number;
  reason: R;
}

/**
 * Breakdown of grouped sub‑scores by category, keyed by CategoryKey
 */
export type ScoreBreakdown = {
  [K in CategoryKey]: CategoryScore<
    K extends "longevity"
      ? LongevityReason
      : K extends "txCount"
      ? TxCountReason
      : K extends "txVolume"
      ? TxVolumeReason
      : K extends "modules"
      ? ModuleReason
      : K extends "governance"
      ? GovernanceReason
      : K extends "stakingRewards"
      ? StakingRewardsReason
      : K extends "stakingNominators"
      ? StakingNominatorsReason
      : K extends "stakingSlash"
      ? StakingSlashReason
      : K extends "tokenDiversity"
      ? TokenDiversityReason
      : K extends "nftHoldings"
      ? NftHoldingsReason
      : K extends "nftActivity"
      ? NftActivityReason
      : K extends "extrinsicDepth"
      ? ExtrinsicDepthReason
      : never
  >;
};

type ReturnType = {
  total: number;
  categories: ScoreBreakdown;
};
/**
 * Calculate a friendly, tier‑based reputation score for an address.
 * All primary fetches run in parallel; NFTs fetched separately.
 */
export async function calculateScore(address: string): Promise<ReturnType> {
  try {
    logger.info("Starting score calculation", { address });

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
      // ignore
    }

    // 3) Raw metrics
    const txCount = transfersRes.count ?? 0;
    const txVolumeDOT = (transfersRes.transfers ?? [])
      .map((t) => parseUnits(t.amount_v2 ?? "0", 10))
      .reduce((s, v) => s + v, 0);
    const distinctMods = new Set(
      extrinsicsRes.extrinsics.map((x) => x.call_module)
    ).size;
    const govAvailable = referendaRes?.count ?? 0;
    const govCast = referendaRes?.list?.length ?? 0;
    const slashCount = slashRes?.count ?? 0;
    const numValidators = votedValidators?.length ?? 0;
    const tokenCount = tokenList?.length ?? 0;
    const nftHeld = nftRes?.totalCount ?? 0;
    const nftEvents = nftRes?.data
      .map((i) => i.events.length)
      .reduce((s, v) => s + v, 0);
    const extrCount = extrinsicsRes?.count ?? 0;

    // 4) Category scores
    const longevity =
      ageDays >= 365
        ? { score: 10, reason: LongevityReason.OverYear }
        : ageDays >= 90
        ? { score: 6, reason: LongevityReason.ThreeMonths }
        : ageDays >= 30
        ? { score: 3, reason: LongevityReason.OneMonth }
        : ageDays >= 7
        ? { score: 1, reason: LongevityReason.OneWeek }
        : { score: 0, reason: LongevityReason.New };

    const txCountScore =
      txCount >= 50
        ? { score: 10, reason: TxCountReason.FiftyPlus }
        : txCount >= 10
        ? { score: 5, reason: TxCountReason.TenPlus }
        : txCount >= 1
        ? { score: 2, reason: TxCountReason.First }
        : { score: 0, reason: TxCountReason.None };

    const txVolumeScore =
      txVolumeDOT >= 100
        ? { score: 10, reason: TxVolumeReason.OneHundredDot }
        : txVolumeDOT >= 10
        ? { score: 5, reason: TxVolumeReason.TenDot }
        : txVolumeDOT >= 1
        ? { score: 2, reason: TxVolumeReason.OneDot }
        : { score: 0, reason: TxVolumeReason.Zero };

    const modulesScore =
      distinctMods >= 5
        ? { score: 5, reason: ModuleReason.FivePlus }
        : distinctMods >= 3
        ? { score: 3, reason: ModuleReason.ThreePlus }
        : distinctMods >= 1
        ? { score: 1, reason: ModuleReason.OnePlus }
        : { score: 0, reason: ModuleReason.None };

    const governanceScore =
      govCast === 0
        ? { score: 0, reason: GovernanceReason.None }
        : govCast < 0.5 * govAvailable
        ? { score: 2, reason: GovernanceReason.Partial }
        : govCast < govAvailable
        ? { score: 10, reason: GovernanceReason.Majority }
        : { score: 20, reason: GovernanceReason.Full };

    const stakingRewardsScore =
      parseUnits(stakingRew.toString(), 10) >= 10
        ? { score: 10, reason: StakingRewardsReason.TenDot }
        : parseUnits(stakingRew.toString(), 10) >= 1
        ? { score: 5, reason: StakingRewardsReason.OneDot }
        : parseUnits(stakingRew.toString(), 10) >= 0.1
        ? { score: 2, reason: StakingRewardsReason.TenthDot }
        : { score: 0, reason: StakingRewardsReason.Zero };

    const stakingNominatorsScore =
      numValidators >= 10
        ? { score: 5, reason: StakingNominatorsReason.TenPlus }
        : numValidators >= 5
        ? { score: 3, reason: StakingNominatorsReason.FivePlus }
        : numValidators >= 1
        ? { score: 1, reason: StakingNominatorsReason.OnePlus }
        : { score: 0, reason: StakingNominatorsReason.None };

    const stakingSlashScore = {
      score: Math.min(slashCount, 5) * -1,
      reason:
        slashCount >= 5
          ? StakingSlashReason.FiveSlashes
          : slashCount >= 1
          ? StakingSlashReason.OneSlash
          : StakingSlashReason.None,
    };

    const tokenDiversityScore =
      tokenCount >= 5
        ? { score: 5, reason: TokenDiversityReason.FivePlus }
        : tokenCount >= 3
        ? { score: 3, reason: TokenDiversityReason.ThreePlus }
        : tokenCount >= 1
        ? { score: 1, reason: TokenDiversityReason.OnePlus }
        : { score: 0, reason: TokenDiversityReason.None };

    const nftHoldingsScore =
      nftHeld >= 10
        ? { score: 5, reason: NftHoldingsReason.TenPlus }
        : nftHeld >= 5
        ? { score: 3, reason: NftHoldingsReason.FivePlus }
        : nftHeld >= 1
        ? { score: 1, reason: NftHoldingsReason.OnePlus }
        : { score: 0, reason: NftHoldingsReason.None };

    const nftActivityScore =
      nftEvents >= 50
        ? { score: 2, reason: NftActivityReason.FiftyPlus }
        : nftEvents >= 10
        ? { score: 1, reason: NftActivityReason.TenPlus }
        : { score: 0, reason: NftActivityReason.None };

    const extrinsicDepthScore =
      extrCount >= 100
        ? { score: 10, reason: ExtrinsicDepthReason.HundredPlus }
        : extrCount >= 50
        ? { score: 5, reason: ExtrinsicDepthReason.FiftyPlus }
        : extrCount >= 1
        ? { score: 1, reason: ExtrinsicDepthReason.OnePlus }
        : { score: 0, reason: ExtrinsicDepthReason.None };

    // 5) Aggregate total & assemble by category key
    const total = [
      longevity.score,
      txCountScore.score,
      txVolumeScore.score,
      modulesScore.score,
      governanceScore.score,
      stakingRewardsScore.score,
      stakingNominatorsScore.score,
      stakingSlashScore.score,
      tokenDiversityScore.score,
      nftHoldingsScore.score,
      nftActivityScore.score,
      extrinsicDepthScore.score,
    ].reduce((s, v) => s + v, 0);

    const categories: ScoreBreakdown = {
      [CategoryKey.Longevity]: longevity,
      [CategoryKey.TxCount]: txCountScore,
      [CategoryKey.TxVolume]: txVolumeScore,
      [CategoryKey.Modules]: modulesScore,
      [CategoryKey.Governance]: governanceScore,
      [CategoryKey.StakingRewards]: stakingRewardsScore,
      [CategoryKey.StakingNominators]: stakingNominatorsScore,
      [CategoryKey.StakingSlash]: stakingSlashScore,
      [CategoryKey.TokenDiversity]: tokenDiversityScore,
      [CategoryKey.NftHoldings]: nftHoldingsScore,
      [CategoryKey.NftActivity]: nftActivityScore,
      [CategoryKey.ExtrinsicDepth]: extrinsicDepthScore,
    };

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
