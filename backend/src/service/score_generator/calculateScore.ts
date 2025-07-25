import { ExtrinsicDepthReason, GovernanceReason, LongevityReason, ModuleReason, NftActivityReason, NftHoldingsReason, StakingNominatorsReason, StakingRewardsReason, StakingSlashReason, TokenDiversityReason, TxCountReason, TxVolumeReason } from "~/config/scoreReasons";
import { parseUnits } from "~/utils/balanceFormatter";
import { CategoryScore } from "./types";

export function calculateLongevityScore(
  ageDays: number
): CategoryScore<LongevityReason> {
  if (ageDays >= 365) return { score: 10, reason: LongevityReason.OverYear };
  if (ageDays >= 90) return { score: 6, reason: LongevityReason.ThreeMonths };
  if (ageDays >= 30) return { score: 3, reason: LongevityReason.OneMonth };
  if (ageDays >= 7) return { score: 1, reason: LongevityReason.OneWeek };
  return { score: 0, reason: LongevityReason.New };
}

export function calculateTxCountScore(txCount: number): CategoryScore<TxCountReason> {
  if (txCount >= 50) return { score: 10, reason: TxCountReason.FiftyPlus };
  if (txCount >= 10) return { score: 5, reason: TxCountReason.TenPlus };
  if (txCount >= 1) return { score: 2, reason: TxCountReason.First };
  return { score: 0, reason: TxCountReason.None };
}

export function calculateTxVolumeScore(
  txVolumeDOT: number
): CategoryScore<TxVolumeReason> {
  if (txVolumeDOT >= 100)
    return { score: 10, reason: TxVolumeReason.OneHundredDot };
  if (txVolumeDOT >= 10) return { score: 5, reason: TxVolumeReason.TenDot };
  if (txVolumeDOT >= 1) return { score: 2, reason: TxVolumeReason.OneDot };
  return { score: 0, reason: TxVolumeReason.Zero };
}

export function calculateModulesScore(
  distinctMods: number
): CategoryScore<ModuleReason> {
  if (distinctMods >= 5) return { score: 5, reason: ModuleReason.FivePlus };
  if (distinctMods >= 3) return { score: 3, reason: ModuleReason.ThreePlus };
  if (distinctMods >= 1) return { score: 1, reason: ModuleReason.OnePlus };
  return { score: 0, reason: ModuleReason.None };
}

export function calculateGovernanceScore(
  govCast: number,
  govAvailable: number
): CategoryScore<GovernanceReason> {
  if (govCast === 0) return { score: 0, reason: GovernanceReason.None };
  if (govCast === govAvailable)
    return { score: 20, reason: GovernanceReason.Full };
  if (govCast >= 0.5 * govAvailable)
    return { score: 10, reason: GovernanceReason.Majority };
  return { score: 2, reason: GovernanceReason.Partial };
}

export function calculateStakingRewardsScore(
  stakingRew: number
): CategoryScore<StakingRewardsReason> {
  const rewardsInDot = parseUnits(stakingRew.toString(), 10);
  if (rewardsInDot >= 10)
    return { score: 10, reason: StakingRewardsReason.TenDot };
  if (rewardsInDot >= 1)
    return { score: 5, reason: StakingRewardsReason.OneDot };
  if (rewardsInDot >= 0.1)
    return { score: 2, reason: StakingRewardsReason.TenthDot };
  return { score: 0, reason: StakingRewardsReason.Zero };
}

export function calculateStakingNominatorsScore(
  numValidators: number
): CategoryScore<StakingNominatorsReason> {
  if (numValidators >= 10)
    return { score: 5, reason: StakingNominatorsReason.TenPlus };
  if (numValidators >= 5)
    return { score: 3, reason: StakingNominatorsReason.FivePlus };
  if (numValidators >= 1)
    return { score: 1, reason: StakingNominatorsReason.OnePlus };
  return { score: 0, reason: StakingNominatorsReason.None };
}

export function calculateStakingSlashScore(
  slashCount: number
): CategoryScore<StakingSlashReason> {
  if (slashCount >= 5)
    return { score: -5, reason: StakingSlashReason.FiveSlashes };
  if (slashCount > 0)
    return {
      score: Math.min(slashCount, 5) * -1,
      reason: StakingSlashReason.OneSlash,
    };
  return { score: 0, reason: StakingSlashReason.None };
}

export function calculateTokenDiversityScore(
  tokenCount: number
): CategoryScore<TokenDiversityReason> {
  if (tokenCount >= 5) return { score: 5, reason: TokenDiversityReason.FivePlus };
  if (tokenCount >= 3) return { score: 3, reason: TokenDiversityReason.ThreePlus };
  if (tokenCount >= 1) return { score: 1, reason: TokenDiversityReason.OnePlus };
  return { score: 0, reason: TokenDiversityReason.None };
}

export function calculateNftHoldingsScore(
  nftHeld: number
): CategoryScore<NftHoldingsReason> {
  if (nftHeld >= 10) return { score: 5, reason: NftHoldingsReason.TenPlus };
  if (nftHeld >= 5) return { score: 3, reason: NftHoldingsReason.FivePlus };
  if (nftHeld >= 1) return { score: 1, reason: NftHoldingsReason.OnePlus };
  return { score: 0, reason: NftHoldingsReason.None };
}

export function calculateNftActivityScore(
  nftEvents: number
): CategoryScore<NftActivityReason> {
  if (nftEvents >= 50) return { score: 2, reason: NftActivityReason.FiftyPlus };
  if (nftEvents >= 10) return { score: 1, reason: NftActivityReason.TenPlus };
  return { score: 0, reason: NftActivityReason.None };
}

export function calculateExtrinsicDepthScore(
  extrCount: number
): CategoryScore<ExtrinsicDepthReason> {
  if (extrCount >= 100)
    return { score: 10, reason: ExtrinsicDepthReason.HundredPlus };
  if (extrCount >= 50)
    return { score: 5, reason: ExtrinsicDepthReason.FiftyPlus };
  if (extrCount >= 1)
    return { score: 1, reason: ExtrinsicDepthReason.OnePlus };
  return { score: 0, reason: ExtrinsicDepthReason.None };
}