/**
 * A collection of all the raw, on-chain data points needed to evaluate badges for a user.
 */
export interface OnChainBadgeMetrics {
  extrinsicCount: number;
  accountAgeDays: number;
  parachainInteractionCount: number;
  referendaVoteCount: number;
  treasuryVoteCount: number;
  nominatorActiveMonths: number;
  slashCount: number;
  // This new metric is calculated from the two above
  nominatorActiveMonthsWithoutSlashes: number;
  nftCount: number;
  parachainAssetCount: number;
  identityStatus: number; // 0 for none, 1 for confirmed
  batchTxCount: number;
}