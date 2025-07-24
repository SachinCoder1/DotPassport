// scoreReasons.ts

/**
 * Generic detail structure for any scoring reason
 */
export interface ReasonDetail {
  /** Numeric points awarded (or penalized if negative) */
  points: number;
  /** Brief title summarizing the tier */
  title: string;
  /** Detailed explanation of why this applies */
  description: string;
  /** The threshold or condition required for this tier */
  threshold: string;
  /** Advice or next steps to reach the next tier */
  advice: string;
}


/**
 * Categories for scoring, matching ScoreBreakdown keys
 */
export enum CategoryKey {
  Longevity = 'longevity',
  TxCount = 'txCount',
  TxVolume = 'txVolume',
  Modules = 'modules',
  Governance = 'governance',
  StakingRewards = 'stakingRewards',
  StakingNominators = 'stakingNominators',
  StakingSlash = 'stakingSlash',
  TokenDiversity = 'tokenDiversity',
  NftHoldings = 'nftHoldings',
  NftActivity = 'nftActivity',
  ExtrinsicDepth = 'extrinsicDepth',
}

/** Longevity Category **/
export enum LongevityReason {
  New = 'New',           // < 7 days
  OneWeek = 'OneWeek',   // ≥ 7 days
  OneMonth = 'OneMonth', // ≥ 30 days
  ThreeMonths = 'ThreeMonths', // ≥ 90 days
  OverYear = 'OverYear', // ≥ 365 days
}
export const LongevityDetails: Record<LongevityReason, ReasonDetail> = {
  [LongevityReason.New]: {
    points: 0,
    title: 'Brand New',
    description: 'Account age is less than one week.',
    threshold: '< 7 days',
    advice: 'Stay active and interact on-chain to grow your reputation.',
  },
  [LongevityReason.OneWeek]: {
    points: 1,
    title: 'One Week Old',
    description: 'Account has at least 7 days of history.',
    threshold: '≥ 7 days',
    advice: 'Keep engaging for a month to unlock more points.',
  },
  [LongevityReason.OneMonth]: {
    points: 3,
    title: 'One Month Milestone',
    description: 'Account has at least 30 days of history.',
    threshold: '≥ 30 days',
    advice: 'Maintain consistent activity for three months to advance.',
  },
  [LongevityReason.ThreeMonths]: {
    points: 6,
    title: 'Seasoned User',
    description: 'Account has at least 90 days of history.',
    threshold: '≥ 90 days',
    advice: 'Continue building history to reach one year for top tier.',
  },
  [LongevityReason.OverYear]: {
    points: 10,
    title: 'Veteran',
    description: 'Account has at least one year of history.',
    threshold: '≥ 365 days',
    advice: 'Excellent tenure—keep diversifying your on-chain activities!',
  },
};

/** Transaction Count Category **/
export enum TxCountReason {
  None = 'None',
  First = 'First',
  TenPlus = 'TenPlus',
  FiftyPlus = 'FiftyPlus',
}
export const TxCountDetails: Record<TxCountReason, ReasonDetail> = {
  [TxCountReason.None]: {
    points: 0,
    title: 'No Transactions',
    description: 'No on-chain transactions found.',
    threshold: '0 transactions',
    advice: 'Make your first transaction to start earning points.',
  },
  [TxCountReason.First]: {
    points: 2,
    title: 'First Steps',
    description: 'Made at least one transaction.',
    threshold: '≥ 1 transaction',
    advice: 'Aim for 10 transactions to gain more reputation.',
  },
  [TxCountReason.TenPlus]: {
    points: 5,
    title: 'Active Trader',
    description: 'Completed 10 or more transactions.',
    threshold: '≥ 10 transactions',
    advice: 'Keep going to reach 50 transactions for top tier.',
  },
  [TxCountReason.FiftyPlus]: {
    points: 10,
    title: 'Transaction Master',
    description: 'Completed 50 or more transactions.',
    threshold: '≥ 50 transactions',
    advice: 'Maintain your activity to keep your rating high.',
  },
};

/** Transaction Volume Category **/
export enum TxVolumeReason {
  Zero = 'Zero',
  OneDot = 'OneDot',
  TenDot = 'TenDot',
  OneHundredDot = 'OneHundredDot',
}
export const TxVolumeDetails: Record<TxVolumeReason, ReasonDetail> = {
  [TxVolumeReason.Zero]: {
    points: 0,
    title: 'Minimal Volume',
    description: 'Transferred less than 1 DOT total.',
    threshold: '< 1 DOT',
    advice: 'Transfer small amounts to begin earning volume points.',
  },
  [TxVolumeReason.OneDot]: {
    points: 2,
    title: 'Small Mover',
    description: 'Transferred at least 1 DOT total.',
    threshold: '≥ 1 DOT',
    advice: 'Increase volume to 10 DOT to unlock more points.',
  },
  [TxVolumeReason.TenDot]: {
    points: 5,
    title: 'Moderate Volume',
    description: 'Transferred at least 10 DOT total.',
    threshold: '≥ 10 DOT',
    advice: 'Aim for 100 DOT to maximize volume score.',
  },
  [TxVolumeReason.OneHundredDot]: {
    points: 10,
    title: 'High Roller',
    description: 'Transferred 100 DOT or more.',
    threshold: '≥ 100 DOT',
    advice: 'Great job! Diversify across modules now.',
  },
};

/** Module Diversity Category **/
export enum ModuleReason {
  None = 'None',
  OnePlus = 'OnePlus',
  ThreePlus = 'ThreePlus',
  FivePlus = 'FivePlus',
}
export const ModuleDetails: Record<ModuleReason, ReasonDetail> = {
  [ModuleReason.None]: {
    points: 0,
    title: 'No Modules',
    description: 'No different modules used.',
    threshold: '0 modules',
    advice: 'Try interacting with staking, governance, or utility modules.',
  },
  [ModuleReason.OnePlus]: {
    points: 1,
    title: 'Module Explorer',
    description: 'Used at least one module.',
    threshold: '≥ 1 module',
    advice: 'Engage with additional modules to earn more points.',
  },
  [ModuleReason.ThreePlus]: {
    points: 3,
    title: 'Diverse Explorer',
    description: 'Used three or more modules.',
    threshold: '≥ 3 modules',
    advice: 'Use five modules to reach the top tier here.',
  },
  [ModuleReason.FivePlus]: {
    points: 5,
    title: 'Polkadot Power User',
    description: 'Used five or more modules.',
    threshold: '≥ 5 modules',
    advice: 'Keep discovering new modules and features!',
  },
};

/** Governance Participation Category **/
export enum GovernanceReason {
  None = 'None',
  Partial = 'Partial',
  Majority = 'Majority',
  Full = 'Full',
}
export const GovernanceDetails: Record<GovernanceReason, ReasonDetail> = {
  [GovernanceReason.None]: {
    points: 0,
    title: 'No Participation',
    description: 'No referenda votes cast.',
    threshold: '0%',
    advice: 'Vote on a referendum to start participating.',
  },
  [GovernanceReason.Partial]: {
    points: 2,
    title: 'Partial Voter',
    description: 'Voted on less than half of available referenda.',
    threshold: '< 50%',
    advice: 'Cast more votes to reach majority participation.',
  },
  [GovernanceReason.Majority]: {
    points: 10,
    title: 'Majority Voter',
    description: 'Voted on at least 50% of referenda.',
    threshold: '50–99%',
    advice: 'Vote on all to earn full governance points.',
  },
  [GovernanceReason.Full]: {
    points: 20,
    title: 'Governance Champion',
    description: 'Voted on every available referendum.',
    threshold: '100%',
    advice: 'Maintain your engagement to keep this status.',
  },
};

/** Staking Rewards Category **/
export enum StakingRewardsReason {
  Zero = 'Zero',
  TenthDot = 'TenthDot',
  OneDot = 'OneDot',
  TenDot = 'TenDot',
}
export const StakingRewardsDetails: Record<StakingRewardsReason, ReasonDetail> = {
  [StakingRewardsReason.Zero]: {
    points: 0,
    title: 'No Rewards',
    description: 'Less than 0.1 DOT in rewards.',
    threshold: '< 0.1 DOT',
    advice: 'Stake and hold to start earning rewards.',
  },
  [StakingRewardsReason.TenthDot]: {
    points: 2,
    title: 'Tiny Rewards',
    description: 'At least 0.1 DOT in rewards.',
    threshold: '≥ 0.1 DOT',
    advice: 'Increase your stake to earn more.',
  },
  [StakingRewardsReason.OneDot]: {
    points: 5,
    title: 'Steady Earner',
    description: 'At least 1 DOT in rewards.',
    threshold: '≥ 1 DOT',
    advice: 'Stay staked consistently for higher returns.',
  },
  [StakingRewardsReason.TenDot]: {
    points: 10,
    title: 'Reward Master',
    description: 'At least 10 DOT in rewards.',
    threshold: '≥ 10 DOT',
    advice: 'Continue nominating and compounding rewards.',
  },
};

/** Nominations Category **/
export enum StakingNominatorsReason {
  None = 'None',
  OnePlus = 'OnePlus',
  FivePlus = 'FivePlus',
  TenPlus = 'TenPlus',
}
export const StakingNominatorsDetails: Record<StakingNominatorsReason, ReasonDetail> = {
  [StakingNominatorsReason.None]: {
    points: 0,
    title: 'No Nominations',
    description: 'Currently not nominating any validators.',
    threshold: '0 validators',
    advice: 'Nominate a validator to start earning nomination points.',
  },
  [StakingNominatorsReason.OnePlus]: {
    points: 1,
    title: 'Single Nominee',
    description: 'Nominating at least one validator.',
    threshold: '≥ 1 validator',
    advice: 'Nominate multiple validators for better diversification.',
  },
  [StakingNominatorsReason.FivePlus]: {
    points: 3,
    title: 'Active Nominator',
    description: 'Nominating five or more validators.',
    threshold: '≥ 5 validators',
    advice: 'Aim for ten validators to maximize points.',
  },
  [StakingNominatorsReason.TenPlus]: {
    points: 5,
    title: 'Nomination Pro',
    description: 'Nominating ten or more validators.',
    threshold: '≥ 10 validators',
    advice: 'Great diversification! Keep monitoring performance.',
  },
};

/** Slash Penalty Category **/
export enum StakingSlashReason {
  None = 'None',
  OneSlash = 'OneSlash',
  FiveSlashes = 'FiveSlashes',
}
export const StakingSlashDetails: Record<StakingSlashReason, ReasonDetail> = {
  [StakingSlashReason.None]: {
    points: 0,
    title: 'Clean Record',
    description: 'No slash events detected.',
    threshold: '0 slashes',
    advice: 'Keep maintaining good validator choices.',
  },
  [StakingSlashReason.OneSlash]: {
    points: -1,
    title: 'Minor Penalty',
    description: 'One slash event occurred.',
    threshold: '1 slash',
    advice: 'Review validator behavior to avoid future slashes.',
  },
  [StakingSlashReason.FiveSlashes]: {
    points: -5,
    title: 'Major Penalty',
    description: 'Five or more slashes occurred.',
    threshold: '≥ 5 slashes',
    advice: 'Consider changing validators to reduce risk.',
  },
};

/** Token Diversity Category **/
export enum TokenDiversityReason {
  None = 'None',
  OnePlus = 'OnePlus',
  ThreePlus = 'ThreePlus',
  FivePlus = 'FivePlus',
}
export const TokenDiversityDetails: Record<TokenDiversityReason, ReasonDetail> = {
  [TokenDiversityReason.None]: {
    points: 0,
    title: 'Mono-Hodl',
    description: 'No additional tokens held.',
    threshold: '0 tokens',
    advice: 'Explore other tokens to diversify your portfolio.',
  },
  [TokenDiversityReason.OnePlus]: {
    points: 1,
    title: 'Diversifier',
    description: 'Holding at least one token.',
    threshold: '≥ 1 token',
    advice: 'Hold three or more tokens to gain more points.',
  },
  [TokenDiversityReason.ThreePlus]: {
    points: 3,
    title: 'Multi-Token Holder',
    description: 'Holding three or more tokens.',
    threshold: '≥ 3 tokens',
    advice: 'Expand to five tokens for full diversity score.',
  },
  [TokenDiversityReason.FivePlus]: {
    points: 5,
    title: 'Token Connoisseur',
    description: 'Holding five or more tokens.',
    threshold: '≥ 5 tokens',
    advice: 'Great diversification—keep exploring new assets!',
  },
};

/** NFT Holdings Category **/
export enum NftHoldingsReason {
  None = 'None',
  OnePlus = 'OnePlus',
  FivePlus = 'FivePlus',
  TenPlus = 'TenPlus',
}
export const NftHoldingsDetails: Record<NftHoldingsReason, ReasonDetail> = {
  [NftHoldingsReason.None]: {
    points: 0,
    title: 'No NFTs',
    description: 'No NFTs owned.',
    threshold: '0 NFTs',
    advice: 'Collect an NFT to start your collection.',
  },
  [NftHoldingsReason.OnePlus]: {
    points: 1,
    title: 'Collector',
    description: 'Owns at least one NFT.',
    threshold: '≥ 1 NFT',
    advice: 'Acquire five NFTs to earn more points.',
  },
  [NftHoldingsReason.FivePlus]: {
    points: 3,
    title: 'Enthusiast',
    description: 'Owns five or more NFTs.',
    threshold: '≥ 5 NFTs',
    advice: 'Expand to ten NFTs for the top tier.',
  },
  [NftHoldingsReason.TenPlus]: {
    points: 5,
    title: 'NFT Aficionado',
    description: 'Owns ten or more NFTs.',
    threshold: '≥ 10 NFTs',
    advice: 'Continue curating your collection!',
  },
};

/** NFT Activity Category **/
export enum NftActivityReason {
  None = 'None',   // <10 events
  TenPlus = 'TenPlus', // ≥10 events
  FiftyPlus = 'FiftyPlus', // ≥50 events
}
export const NftActivityDetails: Record<NftActivityReason, ReasonDetail> = {
  [NftActivityReason.None]: {
    points: 0,
    title: 'Inactive',
    description: 'Fewer than 10 NFT interactions.',
    threshold: '< 10 events',
    advice: 'Interact with NFTs to earn activity points.',
  },
  [NftActivityReason.TenPlus]: {
    points: 1,
    title: 'Engaged',
    description: 'At least 10 NFT interactions.',
    threshold: '≥ 10 events',
    advice: 'Interact more to reach 50 events for full points.',
  },
  [NftActivityReason.FiftyPlus]: {
    points: 2,
    title: 'Active Collector',
    description: 'At least 50 NFT interactions.',
    threshold: '≥ 50 events',
    advice: 'Keep engaging with your NFTs!',
  },
};

/** Extrinsic Depth Category **/
export enum ExtrinsicDepthReason {
  None = 'None',
  OnePlus = 'OnePlus',
  FiftyPlus = 'FiftyPlus',
  HundredPlus = 'HundredPlus',
}
export const ExtrinsicDepthDetails: Record<ExtrinsicDepthReason, ReasonDetail> = {
  [ExtrinsicDepthReason.None]: {
    points: 0,
    title: 'No Calls',
    description: 'No extrinsic calls made.',
    threshold: '0 calls',
    advice: 'Submit an extrinsic to start earning depth points.',
  },
  [ExtrinsicDepthReason.OnePlus]: {
    points: 1,
    title: 'Starter',
    description: 'Made at least one extrinsic call.',
    threshold: '≥ 1 call',
    advice: 'Make 50 calls to earn more points.',
  },
  [ExtrinsicDepthReason.FiftyPlus]: {
    points: 5,
    title: 'Experienced',
    description: 'Made 50 or more extrinsic calls.',
    threshold: '≥ 50 calls',
    advice: 'Reach 100 calls for top-tier recognition.',
  },
  [ExtrinsicDepthReason.HundredPlus]: {
    points: 10,
    title: 'Veteran Caller',
    description: 'Made 100 or more extrinsic calls.',
    threshold: '≥ 100 calls',
    advice: 'Excellent depth—keep interacting!',
  },
};

/**
 * Aggregated map of all detail records keyed by category
 */
export const DetailsMap = {
  longevity: LongevityDetails,
  txCount: TxCountDetails,
  txVolume: TxVolumeDetails,
  modules: ModuleDetails,
  governance: GovernanceDetails,
  stakingRewards: StakingRewardsDetails,
  stakingNominators: StakingNominatorsDetails,
  stakingSlash: StakingSlashDetails,
  tokenDiversity: TokenDiversityDetails,
  nftHoldings: NftHoldingsDetails,
  nftActivity: NftActivityDetails,
  extrinsicDepth: ExtrinsicDepthDetails,
} as const;

/**
 * Retrieve the detailed ReasonDetail for a given category and reason.
 */
export function getReasonDetail<
  K extends CategoryKey,
  R extends keyof typeof DetailsMap[K]
>(
  category: K,
  reason: R
): (typeof DetailsMap)[K][R] {
  return DetailsMap[category][reason];
}

