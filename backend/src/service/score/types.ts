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
} from "./scoreDefinitions";

/**
 * A collection of all raw metrics needed for score calculations.
 */
export interface OnChainMetrics {
  ageDays: number;
  txCount: number;
  txVolumeDOT: number;
  distinctMods: number;
  govAvailable: number;
  govCast: number;
  slashCount: number;
  numValidators: number;
  stakingRew: number;
  tokenCount: number;
  nftHeld: number;
  nftEvents: number;
  extrCount: number;
}


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