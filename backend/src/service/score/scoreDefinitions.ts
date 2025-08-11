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
  Longevity = "longevity",
  TxCount = "txCount",
  TxVolume = "txVolume",
  Modules = "modules",
  Governance = "governance",
  StakingRewards = "stakingRewards",
  StakingNominators = "stakingNominators",
  StakingSlash = "stakingSlash",
  NftHoldings = "nftHoldings",
  TokenDiversity = "tokenDiversity",
  NftActivity = "nftActivity",
  ExtrinsicDepth = "extrinsicDepth",
}

/** Longevity Category **/
export enum LongevityReason {
  New = "New", // < 7 days
  OneWeek = "OneWeek", // ≥ 7 days
  OneMonth = "OneMonth", // ≥ 30 days
  ThreeMonths = "ThreeMonths", // ≥ 90 days
  OverYear = "OverYear", // ≥ 365 days
}
export const LongevityDetails: Record<LongevityReason, ReasonDetail> = {
  [LongevityReason.New]: {
    points: 0,
    title: "Brand New",
    description: "Account age is less than one week.",
    threshold: "< 7 days",
    advice: "Stay active and interact on-chain to grow your reputation.",
  },
  [LongevityReason.OneWeek]: {
    points: 1,
    title: "One Week Old",
    description: "Account has at least 7 days of history.",
    threshold: "≥ 7 days",
    advice: "Keep engaging for a month to unlock more points.",
  },
  [LongevityReason.OneMonth]: {
    points: 3,
    title: "One Month Milestone",
    description: "Account has at least 30 days of history.",
    threshold: "≥ 30 days",
    advice: "Maintain consistent activity for three months to advance.",
  },
  [LongevityReason.ThreeMonths]: {
    points: 6,
    title: "Seasoned User",
    description: "Account has at least 90 days of history.",
    threshold: "≥ 90 days",
    advice: "Continue building history to reach one year for top tier.",
  },
  [LongevityReason.OverYear]: {
    points: 10,
    title: "Veteran",
    description: "Account has at least one year of history.",
    threshold: "≥ 365 days",
    advice: "Excellent tenure—keep diversifying your on-chain activities!",
  },
};

/** Transaction Count Category **/
export enum TxCountReason {
  None = "None",
  First = "First",
  TenPlus = "TenPlus",
  FiftyPlus = "FiftyPlus",
}
export const TxCountDetails: Record<TxCountReason, ReasonDetail> = {
  [TxCountReason.None]: {
    points: 0,
    title: "No Transactions",
    description: "No on-chain transactions found.",
    threshold: "0 transactions",
    advice: "Make your first transaction to start earning points.",
  },
  [TxCountReason.First]: {
    points: 2,
    title: "First Steps",
    description: "Made at least one transaction.",
    threshold: "≥ 1 transaction",
    advice: "Aim for 10 transactions to gain more reputation.",
  },
  [TxCountReason.TenPlus]: {
    points: 5,
    title: "Active Trader",
    description: "Completed 10 or more transactions.",
    threshold: "≥ 10 transactions",
    advice: "Keep going to reach 50 transactions for top tier.",
  },
  [TxCountReason.FiftyPlus]: {
    points: 10,
    title: "Transaction Master",
    description: "Completed 50 or more transactions.",
    threshold: "≥ 50 transactions",
    advice: "Maintain your activity to keep your rating high.",
  },
};

/** Transaction Volume Category **/
export enum TxVolumeReason {
  Zero = "Zero",
  OneDot = "OneDot",
  TenDot = "TenDot",
  OneHundredDot = "OneHundredDot",
}
export const TxVolumeDetails: Record<TxVolumeReason, ReasonDetail> = {
  [TxVolumeReason.Zero]: {
    points: 0,
    title: "Minimal Volume",
    description: "Transferred less than 1 DOT total.",
    threshold: "< 1 DOT",
    advice: "Transfer small amounts to begin earning volume points.",
  },
  [TxVolumeReason.OneDot]: {
    points: 2,
    title: "Small Mover",
    description: "Transferred at least 1 DOT total.",
    threshold: "≥ 1 DOT",
    advice: "Increase volume to 10 DOT to unlock more points.",
  },
  [TxVolumeReason.TenDot]: {
    points: 5,
    title: "Moderate Volume",
    description: "Transferred at least 10 DOT total.",
    threshold: "≥ 10 DOT",
    advice: "Aim for 100 DOT to maximize volume score.",
  },
  [TxVolumeReason.OneHundredDot]: {
    points: 10,
    title: "High Roller",
    description: "Transferred 100 DOT or more.",
    threshold: "≥ 100 DOT",
    advice: "Great job! Diversify across modules now.",
  },
};

/** Module Diversity Category **/
export enum ModuleReason {
  None = "None",
  OnePlus = "OnePlus",
  ThreePlus = "ThreePlus",
  FivePlus = "FivePlus",
}
export const ModuleDetails: Record<ModuleReason, ReasonDetail> = {
  [ModuleReason.None]: {
    points: 0,
    title: "No Modules",
    description: "No different modules used.",
    threshold: "0 modules",
    advice: "Try interacting with staking, governance, or utility modules.",
  },
  [ModuleReason.OnePlus]: {
    points: 1,
    title: "Module Explorer",
    description: "Used at least one module.",
    threshold: "≥ 1 module",
    advice: "Engage with additional modules to earn more points.",
  },
  [ModuleReason.ThreePlus]: {
    points: 3,
    title: "Diverse Explorer",
    description: "Used three or more modules.",
    threshold: "≥ 3 modules",
    advice: "Use five modules to reach the top tier here.",
  },
  [ModuleReason.FivePlus]: {
    points: 5,
    title: "Polkadot Power User",
    description: "Used five or more modules.",
    threshold: "≥ 5 modules",
    advice: "Keep discovering new modules and features!",
  },
};

/** Governance Participation Category **/
export enum GovernanceReason {
  None = "None",
  Partial = "Partial",
  Majority = "Majority",
  Full = "Full",
}
export const GovernanceDetails: Record<GovernanceReason, ReasonDetail> = {
  [GovernanceReason.None]: {
    points: 0,
    title: "No Participation",
    description: "No referenda votes cast.",
    threshold: "0%",
    advice: "Vote on a referendum to start participating.",
  },
  [GovernanceReason.Partial]: {
    points: 2,
    title: "Partial Voter",
    description: "Voted on less than half of available referenda.",
    threshold: "< 50%",
    advice: "Cast more votes to reach majority participation.",
  },
  [GovernanceReason.Majority]: {
    points: 10,
    title: "Majority Voter",
    description: "Voted on at least 50% of referenda.",
    threshold: "50–99%",
    advice: "Vote on all to earn full governance points.",
  },
  [GovernanceReason.Full]: {
    points: 20,
    title: "Governance Champion",
    description: "Voted on every available referendum.",
    threshold: "100%",
    advice: "Maintain your engagement to keep this status.",
  },
};

/** Staking Rewards Category **/
export enum StakingRewardsReason {
  Zero = "Zero",
  TenthDot = "TenthDot",
  OneDot = "OneDot",
  TenDot = "TenDot",
}
export const StakingRewardsDetails: Record<StakingRewardsReason, ReasonDetail> =
  {
    [StakingRewardsReason.Zero]: {
      points: 0,
      title: "No Rewards",
      description: "Less than 0.1 DOT in rewards.",
      threshold: "< 0.1 DOT",
      advice: "Stake and hold to start earning rewards.",
    },
    [StakingRewardsReason.TenthDot]: {
      points: 2,
      title: "Tiny Rewards",
      description: "At least 0.1 DOT in rewards.",
      threshold: "≥ 0.1 DOT",
      advice: "Increase your stake to earn more.",
    },
    [StakingRewardsReason.OneDot]: {
      points: 5,
      title: "Steady Earner",
      description: "At least 1 DOT in rewards.",
      threshold: "≥ 1 DOT",
      advice: "Stay staked consistently for higher returns.",
    },
    [StakingRewardsReason.TenDot]: {
      points: 10,
      title: "Reward Master",
      description: "At least 10 DOT in rewards.",
      threshold: "≥ 10 DOT",
      advice: "Continue nominating and compounding rewards.",
    },
  };

/** Nominations Category **/
export enum StakingNominatorsReason {
  None = "None",
  OnePlus = "OnePlus",
  FivePlus = "FivePlus",
  TenPlus = "TenPlus",
}
export const StakingNominatorsDetails: Record<
  StakingNominatorsReason,
  ReasonDetail
> = {
  [StakingNominatorsReason.None]: {
    points: 0,
    title: "No Nominations",
    description: "Currently not nominating any validators.",
    threshold: "0 validators",
    advice: "Nominate a validator to start earning nomination points.",
  },
  [StakingNominatorsReason.OnePlus]: {
    points: 1,
    title: "Single Nominee",
    description: "Nominating at least one validator.",
    threshold: "≥ 1 validator",
    advice: "Nominate multiple validators for better diversification.",
  },
  [StakingNominatorsReason.FivePlus]: {
    points: 3,
    title: "Active Nominator",
    description: "Nominating five or more validators.",
    threshold: "≥ 5 validators",
    advice: "Aim for ten validators to maximize points.",
  },
  [StakingNominatorsReason.TenPlus]: {
    points: 5,
    title: "Nomination Pro",
    description: "Nominating ten or more validators.",
    threshold: "≥ 10 validators",
    advice: "Great diversification! Keep monitoring performance.",
  },
};

/** Slash Penalty Category **/
export enum StakingSlashReason {
  None = "None",
  OneSlash = "OneSlash",
  FiveSlashes = "FiveSlashes",
}
export const StakingSlashDetails: Record<StakingSlashReason, ReasonDetail> = {
  [StakingSlashReason.None]: {
    points: 0,
    title: "Clean Record",
    description: "No slash events detected.",
    threshold: "0 slashes",
    advice: "Keep maintaining good validator choices.",
  },
  [StakingSlashReason.OneSlash]: {
    points: -1,
    title: "Minor Penalty",
    description: "One slash event occurred.",
    threshold: "1 slash",
    advice: "Review validator behavior to avoid future slashes.",
  },
  [StakingSlashReason.FiveSlashes]: {
    points: -5,
    title: "Major Penalty",
    description: "Five or more slashes occurred.",
    threshold: "≥ 5 slashes",
    advice: "Consider changing validators to reduce risk.",
  },
};

/** Token Diversity Category **/
export enum TokenDiversityReason {
  None = "None",
  OnePlus = "OnePlus",
  ThreePlus = "ThreePlus",
  FivePlus = "FivePlus",
}
export const TokenDiversityDetails: Record<TokenDiversityReason, ReasonDetail> =
  {
    [TokenDiversityReason.None]: {
      points: 0,
      title: "Mono-Hodl",
      description: "No additional tokens held.",
      threshold: "0 tokens",
      advice: "Explore other tokens to diversify your portfolio.",
    },
    [TokenDiversityReason.OnePlus]: {
      points: 1,
      title: "Diversifier",
      description: "Holding at least one token.",
      threshold: "≥ 1 token",
      advice: "Hold three or more tokens to gain more points.",
    },
    [TokenDiversityReason.ThreePlus]: {
      points: 3,
      title: "Multi-Token Holder",
      description: "Holding three or more tokens.",
      threshold: "≥ 3 tokens",
      advice: "Expand to five tokens for full diversity score.",
    },
    [TokenDiversityReason.FivePlus]: {
      points: 5,
      title: "Token Connoisseur",
      description: "Holding five or more tokens.",
      threshold: "≥ 5 tokens",
      advice: "Great diversification—keep exploring new assets!",
    },
  };

/** NFT Holdings Category **/
export enum NftHoldingsReason {
  None = "None",
  OnePlus = "OnePlus",
  FivePlus = "FivePlus",
  TenPlus = "TenPlus",
}
export const NftHoldingsDetails: Record<NftHoldingsReason, ReasonDetail> = {
  [NftHoldingsReason.None]: {
    points: 0,
    title: "No NFTs",
    description: "No NFTs owned.",
    threshold: "0 NFTs",
    advice: "Collect an NFT to start your collection.",
  },
  [NftHoldingsReason.OnePlus]: {
    points: 1,
    title: "Collector",
    description: "Owns at least one NFT.",
    threshold: "≥ 1 NFT",
    advice: "Acquire five NFTs to earn more points.",
  },
  [NftHoldingsReason.FivePlus]: {
    points: 3,
    title: "Enthusiast",
    description: "Owns five or more NFTs.",
    threshold: "≥ 5 NFTs",
    advice: "Expand to ten NFTs for the top tier.",
  },
  [NftHoldingsReason.TenPlus]: {
    points: 5,
    title: "NFT Aficionado",
    description: "Owns ten or more NFTs.",
    threshold: "≥ 10 NFTs",
    advice: "Continue curating your collection!",
  },
};

/** NFT Activity Category **/
export enum NftActivityReason {
  None = "None", // <10 events
  TenPlus = "TenPlus", // ≥10 events
  FiftyPlus = "FiftyPlus", // ≥50 events
}
export const NftActivityDetails: Record<NftActivityReason, ReasonDetail> = {
  [NftActivityReason.None]: {
    points: 0,
    title: "Inactive",
    description: "Fewer than 10 NFT interactions.",
    threshold: "< 10 events",
    advice: "Interact with NFTs to earn activity points.",
  },
  [NftActivityReason.TenPlus]: {
    points: 1,
    title: "Engaged",
    description: "At least 10 NFT interactions.",
    threshold: "≥ 10 events",
    advice: "Interact more to reach 50 events for full points.",
  },
  [NftActivityReason.FiftyPlus]: {
    points: 2,
    title: "Active Collector",
    description: "At least 50 NFT interactions.",
    threshold: "≥ 50 events",
    advice: "Keep engaging with your NFTs!",
  },
};

/** Extrinsic Depth Category **/
export enum ExtrinsicDepthReason {
  None = "None",
  OnePlus = "OnePlus",
  FiftyPlus = "FiftyPlus",
  HundredPlus = "HundredPlus",
}
export const ExtrinsicDepthDetails: Record<ExtrinsicDepthReason, ReasonDetail> =
  {
    [ExtrinsicDepthReason.None]: {
      points: 0,
      title: "No Calls",
      description: "No extrinsic calls made.",
      threshold: "0 calls",
      advice: "Submit an extrinsic to start earning depth points.",
    },
    [ExtrinsicDepthReason.OnePlus]: {
      points: 1,
      title: "Starter",
      description: "Made at least one extrinsic call.",
      threshold: "≥ 1 call",
      advice: "Make 50 calls to earn more points.",
    },
    [ExtrinsicDepthReason.FiftyPlus]: {
      points: 5,
      title: "Experienced",
      description: "Made 50 or more extrinsic calls.",
      threshold: "≥ 50 calls",
      advice: "Reach 100 calls for top-tier recognition.",
    },
    [ExtrinsicDepthReason.HundredPlus]: {
      points: 10,
      title: "Veteran Caller",
      description: "Made 100 or more extrinsic calls.",
      threshold: "≥ 100 calls",
      advice: "Excellent depth—keep interacting!",
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
  R extends keyof (typeof DetailsMap)[K]
>(category: K, reason: R): (typeof DetailsMap)[K][R] {
  return DetailsMap[category][reason];
}

/*
Stored in DB: 

{
    "categories": [
        {
            "key": "longevity",
            "active": true,
            "createdAt": "2025-07-24T10:39:23.584Z",
            "description": "Rewards how long an address has been active on‑chain, encouraging sustained engagement over time.",
            "displayName": "Account Longevity",
            "order": 0,
            "reasons": [
                {
                    "key": "New",
                    "points": 0,
                    "title": "Brand New",
                    "description": "Your account is under one week old. This is the starting tier before you build any history.",
                    "thresholds": [
                        {
                            "label": "< 7 days",
                            "description": "Account creation occurred less than seven days ago. At this stage, your on‑chain history is still fresh."
                        }
                    ],
                    "advices": [
                        "Submit your first DOT transfer to start interacting on‑chain.",
                        "Explore a balance query or simple utility call to register activity."
                    ]
                },
                {
                    "key": "OneWeek",
                    "points": 1,
                    "title": "One Week Milestone",
                    "description": "You’ve maintained an account for at least one full week, showing initial commitment.",
                    "thresholds": [
                        {
                            "label": "≥ 7 days",
                            "description": "Your first seven days of activity are complete—this demonstrates basic engagement."
                        },
                        {
                            "label": "< 30 days",
                            "description": "Less than one month—keep going to unlock the next tier."
                        }
                    ],
                    "advices": [
                        "Perform small daily transfers or use the staking module to deepen activity.",
                        "Cast your first governance vote to demonstrate participation."
                    ]
                },
                {
                    "key": "OneMonth",
                    "points": 3,
                    "title": "One Month Veteran",
                    "description": "A full month of on‑chain history shows real dedication to the network.",
                    "thresholds": [
                        {
                            "label": "≥ 30 days",
                            "description": "You’ve been active for at least thirty days—well done on sticking around."
                        },
                        {
                            "label": "< 90 days",
                            "description": "Between one and three months—aim to hit three months for a big boost."
                        }
                    ],
                    "advices": [
                        "Nominate a validator and compound your staking rewards.",
                        "Participate in multiple referenda to show governance activity."
                    ]
                },
                {
                    "key": "ThreeMonths",
                    "points": 6,
                    "title": "Seasoned User",
                    "description": "Three months of continuous activity marks you as a committed participant.",
                    "thresholds": [
                        {
                            "label": "≥ 90 days",
                            "description": "At least three months of consistent on‑chain engagement—this is a strong signal."
                        },
                        {
                            "label": "< 365 days",
                            "description": "Under a year—keep diversifying your interactions to reach the top tier."
                        }
                    ],
                    "advices": [
                        "Interact with at least five different runtime modules.",
                        "Try a cross‑chain transfer via XCMP for advanced usage."
                    ]
                },
                {
                    "key": "OverYear",
                    "points": 10,
                    "title": "Veteran",
                    "description": "Over a year of on‑chain activity—recognized as a Polkadot veteran.",
                    "thresholds": [
                        {
                            "label": "≥ 365 days",
                            "description": "Your account has been active for at least one full year—congratulations on your tenure!"
                        }
                    ],
                    "advices": [
                        "Maintain your status by continuing to vote on every referendum.",
                        "Experiment with parachain interactions to stay on the cutting edge."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T10:39:23.584Z"
        },
        {
            "key": "txCount",
            "active": true,
            "createdAt": "2025-07-24T10:39:23.599Z",
            "description": "Tracks how many extrinsics you’ve submitted, from your first transaction up to power‑user volume.",
            "displayName": "Transaction Count",
            "order": 1,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "No Transactions",
                    "description": "You haven’t submitted any extrinsics yet. Start your on‑chain journey here.",
                    "thresholds": [
                        {
                            "label": "0 tx",
                            "description": "No on‑chain transactions detected—time to make your first move."
                        }
                    ],
                    "advices": [
                        "Send a small DOT transfer to register your first transaction.",
                        "Try a `balances.transferKeepAlive` extrinsic to see how it works."
                    ]
                },
                {
                    "key": "First",
                    "points": 2,
                    "title": "First Steps",
                    "description": "One to nine transactions completed—congratulations on making your first moves.",
                    "thresholds": [
                        {
                            "label": "1–9 tx",
                            "description": "Fewer than ten transactions. You’re getting comfortable with basic calls."
                        }
                    ],
                    "advices": [
                        "Aim for at least 10 total transactions to unlock the next tier.",
                        "Batch multiple calls using `utility.batch` to increase your count efficiently."
                    ]
                },
                {
                    "key": "TenPlus",
                    "points": 5,
                    "title": "Active Trader",
                    "description": "Ten to forty‑nine transactions—established as an active network participant.",
                    "thresholds": [
                        {
                            "label": "10–49 tx",
                            "description": "You’ve completed ten or more extrinsics—strong proof of engagement."
                        }
                    ],
                    "advices": [
                        "Push to 50 transactions for top‐tier status.",
                        "Explore governance or staking calls to diversify beyond transfers."
                    ]
                },
                {
                    "key": "FiftyPlus",
                    "points": 10,
                    "title": "Transaction Master",
                    "description": "Fifty or more transactions—recognized as a high‐volume, power user.",
                    "thresholds": [
                        {
                            "label": "≥ 50 tx",
                            "description": "Fifty-plus extrinsics shows you’re deeply active on‑chain."
                        }
                    ],
                    "advices": [
                        "Maintain your momentum by trying advanced modules like `xcmpallet`.",
                        "Share your experience by helping others submit their first transactions."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T10:39:23.599Z"
        },
        {
            "key": "txVolume",
            "active": true,
            "createdAt": "2025-07-24T10:44:05.662Z",
            "description": "Measures the total DOT you’ve moved on‑chain, rewarding both small and high‑value actors.",
            "displayName": "Transaction Volume",
            "order": 2,
            "reasons": [
                {
                    "key": "Zero",
                    "points": 0,
                    "title": "Minimal Volume",
                    "description": "Your cumulative transfers are under 1 DOT—time to start moving value!",
                    "thresholds": [
                        {
                            "label": "< 1 DOT",
                            "description": "Total amount moved across all balances transfers is less than one DOT."
                        }
                    ],
                    "advices": [
                        "Execute a small DOT transfer to begin building volume.",
                        "Use utility batch calls to batch multiple tiny transfers into one extrinsic."
                    ]
                },
                {
                    "key": "OneDot",
                    "points": 2,
                    "title": "Small Mover",
                    "description": "You’ve transferred at least 1 DOT in total, showing initial on‑chain value movement.",
                    "thresholds": [
                        {
                            "label": "≥ 1 DOT",
                            "description": "Sum of all your DOT transfers has reached one DOT or more."
                        },
                        {
                            "label": "< 10 DOT",
                            "description": "Still under ten DOT—keep sending to unlock the next level."
                        }
                    ],
                    "advices": [
                        "Aim to move at least 10 DOT to unlock more volume points.",
                        "Consider sending DOT to a secondary account you control to boost totals."
                    ]
                },
                {
                    "key": "TenDot",
                    "points": 5,
                    "title": "Moderate Volume",
                    "description": "Your transfers have reached double‑digit DOT amounts—solid engagement!",
                    "thresholds": [
                        {
                            "label": "≥ 10 DOT",
                            "description": "Cumulative DOT moved equals or exceeds ten DOT."
                        },
                        {
                            "label": "< 100 DOT",
                            "description": "Under one hundred DOT—push a bit further for top‑tier volume."
                        }
                    ],
                    "advices": [
                        "Move at least 100 DOT to achieve the highest volume tier.",
                        "Diversify transfers across staking, governance, and utility modules."
                    ]
                },
                {
                    "key": "OneHundredDot",
                    "points": 10,
                    "title": "High Roller",
                    "description": "You’ve moved 100 DOT or more on‑chain. That’s power‑user volume!",
                    "thresholds": [
                        {
                            "label": "≥ 100 DOT",
                            "description": "Total DOT moved across all your transactions is at least one hundred DOT."
                        }
                    ],
                    "advices": [
                        "Maintain high‑volume transfers to keep this ranking.",
                        "Share best practices with the community on batching and fee optimization."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T10:44:05.662Z"
        },
        {
            "key": "modules",
            "active": true,
            "createdAt": "2025-07-24T10:44:05.683Z",
            "description": "Rewards interacting with multiple Polkadot runtime modules—from balances to governance, staking, utility, and beyond.",
            "displayName": "Module Diversity",
            "order": 3,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "No Modules",
                    "description": "You haven’t used any distinct runtime modules yet—stick to the basics.",
                    "thresholds": [
                        {
                            "label": "0 modules",
                            "description": "No different Polkadot modules detected in your extrinsics."
                        }
                    ],
                    "advices": [
                        "Send a DOT transfer to engage the `balances` module.",
                        "Try a staking call to interact with the `staking` module next."
                    ]
                },
                {
                    "key": "OnePlus",
                    "points": 1,
                    "title": "Module Explorer",
                    "description": "You’ve used at least one distinct runtime module—welcome to Polkadot!",
                    "thresholds": [
                        {
                            "label": "≥ 1 module",
                            "description": "Interacted with exactly one type of runtime module."
                        },
                        {
                            "label": "< 3 modules",
                            "description": "Under three modules—time to broaden your toolkit for more points."
                        }
                    ],
                    "advices": [
                        "Cast a referendum vote to add the `governance` module to your profile.",
                        "Nominate or bond to a validator to engage the `staking` module."
                    ]
                },
                {
                    "key": "ThreePlus",
                    "points": 3,
                    "title": "Diverse Explorer",
                    "description": "At least three distinct modules used—your on‑chain toolkit is growing!",
                    "thresholds": [
                        {
                            "label": "≥ 3 modules",
                            "description": "Your extrinsics span three different runtime modules."
                        },
                        {
                            "label": "< 5 modules",
                            "description": "Close to power‑user breadth—just two more modules to go!"
                        }
                    ],
                    "advices": [
                        "Use `utility.batch` to combine actions into a single call.",
                        "Explore cross‑chain transfers via `xcmpallet`."
                    ]
                },
                {
                    "key": "FivePlus",
                    "points": 5,
                    "title": "Polkadot Power User",
                    "description": "Five or more distinct modules used—master of Polkadot’s capabilities!",
                    "thresholds": [
                        {
                            "label": "≥ 5 modules",
                            "description": "Interacted across at least five different runtime modules."
                        }
                    ],
                    "advices": [
                        "Continue exploring emerging modules and advanced features.",
                        "Contribute feedback on new pallets in the Polkadot governance forum."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T10:44:05.683Z"
        },
        {
            "key": "governance",
            "active": true,
            "createdAt": "2025-07-24T11:19:12.675Z",
            "description": "Rewards active engagement in on‑chain referenda voting. More votes → higher influence and reputation.",
            "displayName": "Governance Participation",
            "order": 4,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "No Participation",
                    "description": "You haven’t voted on any referenda yet, missing out on governance influence.",
                    "thresholds": [
                        {
                            "label": "0 %",
                            "description": "You have cast 0 votes out of all referenda you could participate in."
                        }
                    ],
                    "advices": [
                        "Visit the Governance UI to view open referenda.",
                        "Cast your first vote to start shaping the network’s future."
                    ]
                },
                {
                    "key": "Partial",
                    "points": 2,
                    "title": "Partial Voter",
                    "description": "You’ve voted on less than half of all available referenda—showing some engagement.",
                    "thresholds": [
                        {
                            "label": "< 50 %",
                            "description": "You voted on under half of the total referenda."
                        }
                    ],
                    "advices": [
                        "Review past referenda you missed and consider expressing your opinion.",
                        "Set calendar reminders for new referenda openings."
                    ]
                },
                {
                    "key": "Majority",
                    "points": 10,
                    "title": "Majority Voter",
                    "description": "You’ve voted on at least 50 % of referenda—demonstrating strong governance commitment.",
                    "thresholds": [
                        {
                            "label": "50–99 %",
                            "description": "Your vote count is between half and all referenda."
                        }
                    ],
                    "advices": [
                        "Aim to vote on every referendum for full governance points.",
                        "Delegate your voting power if you can’t vote on a referendum directly."
                    ]
                },
                {
                    "key": "Full",
                    "points": 20,
                    "title": "Governance Champion",
                    "description": "You’ve voted on every referendum, maximizing your on‑chain governance reputation.",
                    "thresholds": [
                        {
                            "label": "100 %",
                            "description": "You cast a vote for every referendum open during your account history."
                        }
                    ],
                    "advices": [
                        "Maintain this activity to stay at the top of governance participation.",
                        "Share your voting rationale with the community to encourage others."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:19:12.675Z"
        },
        {
            "key": "stakingRewards",
            "active": true,
            "createdAt": "2025-07-24T11:19:12.695Z",
            "description": "Measures the total DOT you’ve earned through staking—higher rewards mean more points.",
            "displayName": "Staking Rewards",
            "order": 5,
            "reasons": [
                {
                    "key": "Zero",
                    "points": 0,
                    "title": "No Rewards",
                    "description": "You haven’t earned any staking rewards yet—time to nominate and stake!",
                    "thresholds": [
                        {
                            "label": "< 0.1 DOT",
                            "description": "Total staking rewards collected is under one‑tenth of a DOT."
                        }
                    ],
                    "advices": [
                        "Nominate a reliable validator to start earning rewards.",
                        "Ensure your bonded DOT stays above the minimum to avoid unclaimed rewards."
                    ]
                },
                {
                    "key": "TenthDot",
                    "points": 2,
                    "title": "Tiny Rewards",
                    "description": "You’ve earned at least 0.1 DOT but under 1 DOT in total staking rewards.",
                    "thresholds": [
                        {
                            "label": "≥ 0.1 DOT",
                            "description": "Your staking rewards have reached one‑tenth of a DOT."
                        },
                        {
                            "label": "< 1 DOT",
                            "description": "Still under one full DOT—keep staking to grow."
                        }
                    ],
                    "advices": [
                        "Increase your stake amount or staking duration to boost rewards.",
                        "Consider compounding your rewards back into your stake."
                    ]
                },
                {
                    "key": "OneDot",
                    "points": 5,
                    "title": "Steady Earner",
                    "description": "You’ve accumulated between 1 DOT and 10 DOT in staking rewards.",
                    "thresholds": [
                        {
                            "label": "≥ 1 DOT",
                            "description": "Your staking rewards are at least one full DOT."
                        },
                        {
                            "label": "< 10 DOT",
                            "description": "Under ten DOT—push further to hit the top bracket."
                        }
                    ],
                    "advices": [
                        "Monitor validator performance and switch if your returns dip.",
                        "Diversify nominations across multiple validators for stability."
                    ]
                },
                {
                    "key": "TenDot",
                    "points": 10,
                    "title": "Reward Master",
                    "description": "You’ve earned 10 DOT or more in staking rewards—excellent compounding power!",
                    "thresholds": [
                        {
                            "label": "≥ 10 DOT",
                            "description": "Your total staking rewards reach double‑digit DOT amounts."
                        }
                    ],
                    "advices": [
                        "Maintain or increase your stake to sustain high reward rates.",
                        "Share your staking strategy with newer community members."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:19:12.695Z"
        },
        {
            "key": "stakingNominators",
            "active": true,
            "createdAt": "2025-07-24T11:21:16.792Z",
            "description": "Rewards you for nominating a variety of validators—greater diversification reduces risk and boosts your reputation.",
            "displayName": "Staking Nominator Diversity",
            "order": 6,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "No Nominations",
                    "description": "You’re not currently nominating any validators. Without nominations, you won’t earn staking rewards or build staking reputation.",
                    "thresholds": [
                        {
                            "label": "0 validators",
                            "description": "You haven’t nominated any validators yet."
                        }
                    ],
                    "advices": [
                        "Browse the list of active validators in the Governance UI.",
                        "Choose one or more reliable validators to begin nominating."
                    ]
                },
                {
                    "key": "OnePlus",
                    "points": 1,
                    "title": "Single Nominee",
                    "description": "You’re nominating at least one validator. Good start—now diversify!",
                    "thresholds": [
                        {
                            "label": "≥ 1 validator",
                            "description": "You have at least one active nomination."
                        }
                    ],
                    "advices": [
                        "Consider nominating additional validators to spread risk.",
                        "Check each validator’s commission rate and performance history."
                    ]
                },
                {
                    "key": "FivePlus",
                    "points": 3,
                    "title": "Active Nominator",
                    "description": "You’re nominating five or more validators, showing strong diversification.",
                    "thresholds": [
                        {
                            "label": "≥ 5 validators",
                            "description": "You maintain nominations with five different validators."
                        }
                    ],
                    "advices": [
                        "Monitor validator performance monthly to ensure continued rewards.",
                        "Rebalance nominations if any validator’s commission changes unfavorably."
                    ]
                },
                {
                    "key": "TenPlus",
                    "points": 5,
                    "title": "Nomination Pro",
                    "description": "You’re nominating ten or more validators—the peak of diversification best practices.",
                    "thresholds": [
                        {
                            "label": "≥ 10 validators",
                            "description": "You have a broad spread of nominations across ten+ validators."
                        }
                    ],
                    "advices": [
                        "Maintain even stake across all nominees for optimal risk management.",
                        "Engage with validator communities to stay informed on network updates."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:21:16.792Z"
        },
        {
            "key": "stakingSlash",
            "active": true,
            "createdAt": "2025-07-24T11:21:16.805Z",
            "description": "Tracks any slash events on your nominations—slashes reduce reputation and indicate validator misbehavior or downtime.",
            "displayName": "Staking Slash Penalties",
            "order": 7,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "Clean Record",
                    "description": "No slash events have occurred on any of your nominated validators—excellent validator selection!",
                    "thresholds": [
                        {
                            "label": "0 slashes",
                            "description": "You have avoided all slash penalties across your nominations."
                        }
                    ],
                    "advices": [
                        "Continue monitoring validator health to maintain this clean record.",
                        "Set up alerts for any downtime or misbehavior signals from your nominees."
                    ]
                },
                {
                    "key": "OneSlash",
                    "points": -1,
                    "title": "Minor Penalty",
                    "description": "One slash event was recorded on your nominations. A small penalty, but worth attention.",
                    "thresholds": [
                        {
                            "label": "1 slash",
                            "description": "Exactly one slash event detected in your history."
                        }
                    ],
                    "advices": [
                        "Investigate which validator caused the slash and consider switching.",
                        "Reduce your stake with that validator until you trust its stability again."
                    ]
                },
                {
                    "key": "FiveSlashes",
                    "points": -5,
                    "title": "Major Penalty",
                    "description": "Five or more slash events detected—your nomination strategy may need a complete overhaul.",
                    "thresholds": [
                        {
                            "label": "≥ 5 slashes",
                            "description": "Multiple slash events indicate repeated validator issues."
                        }
                    ],
                    "advices": [
                        "Revoke nominations from poorly performing validators immediately.",
                        "Re-delegate to validators with proven uptime and good community reputation."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:21:16.805Z"
        },
        {
            "key": "tokenDiversity",
            "active": true,
            "createdAt": "2025-07-24T11:21:42.977Z",
            "description": "Rewarding you for holding a variety of tokens beyond the native DOT—diversification helps you participate in different ecosystems and manage risk.",
            "displayName": "Token Diversity",
            "order": 8,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "Mono‑Hodl",
                    "description": "You currently hold only the native DOT token. While DOT is central, holding additional tokens broadens your portfolio.",
                    "thresholds": [
                        {
                            "label": "0 tokens",
                            "description": "No additional token balances detected besides DOT."
                        }
                    ],
                    "advices": [
                        "Explore well‑known parachain tokens (e.g. ACA, KAR) to diversify.",
                        "Purchase a small amount of one token to start building diversity."
                    ]
                },
                {
                    "key": "OnePlus",
                    "points": 1,
                    "title": "Diversifier",
                    "description": "You hold at least one non‑DOT token. Good start—more tokens unlock higher scores.",
                    "thresholds": [
                        {
                            "label": "≥ 1 token",
                            "description": "One distinct token balance found in your wallet."
                        }
                    ],
                    "advices": [
                        "Aim to hold at least three distinct tokens to boost your score.",
                        "Research token projects’ fundamentals before diversifying further."
                    ]
                },
                {
                    "key": "ThreePlus",
                    "points": 3,
                    "title": "Multi‑Token Holder",
                    "description": "You hold three or more distinct tokens. Strong diversification across different projects.",
                    "thresholds": [
                        {
                            "label": "≥ 3 tokens",
                            "description": "Three distinct token balances present."
                        }
                    ],
                    "advices": [
                        "Expand to five tokens for full diversification points.",
                        "Periodically rebalance allocations based on market conditions."
                    ]
                },
                {
                    "key": "FivePlus",
                    "points": 5,
                    "title": "Token Connoisseur",
                    "description": "You hold five or more distinct tokens—excellent portfolio diversification.",
                    "thresholds": [
                        {
                            "label": "≥ 5 tokens",
                            "description": "At least five different tokens detected."
                        }
                    ],
                    "advices": [
                        "Continue exploring emerging tokens carefully to maintain edge.",
                        "Use indexing or baskets if you want to automate diversification."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:21:42.977Z"
        },
        {
            "key": "nftHoldings",
            "active": true,
            "createdAt": "2025-07-24T11:21:42.994Z",
            "description": "Recognizes your participation in the NFT space—owning NFTs shows you engage with Web3 culture and digital art.",
            "displayName": "NFT Holdings",
            "order": 9,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "No NFTs",
                    "description": "You don’t own any NFTs on this address. NFTs are a fun way to showcase digital art and membership.",
                    "thresholds": [
                        {
                            "label": "0 NFTs",
                            "description": "No NFT ownership records found for this account."
                        }
                    ],
                    "advices": [
                        "Browse popular NFT collections to discover art and collectibles.",
                        "Mint or buy your first NFT to start building your collection."
                    ]
                },
                {
                    "key": "OnePlus",
                    "points": 1,
                    "title": "Collector",
                    "description": "You own at least one NFT. Welcome to the world of digital collectibles!",
                    "thresholds": [
                        {
                            "label": "≥ 1 NFT",
                            "description": "At least one NFT is held in your wallet."
                        }
                    ],
                    "advices": [
                        "Acquire up to five NFTs across different collections to boost your score.",
                        "Engage with NFT communities for insights on new drops."
                    ]
                },
                {
                    "key": "FivePlus",
                    "points": 3,
                    "title": "Enthusiast",
                    "description": "You own five or more NFTs, demonstrating strong engagement in the NFT ecosystem.",
                    "thresholds": [
                        {
                            "label": "≥ 5 NFTs",
                            "description": "Five or more NFTs detected in your wallet."
                        }
                    ],
                    "advices": [
                        "Expand to ten NFTs to reach the top tier for holdings.",
                        "Consider showcasing your collection in a gallery or profile."
                    ]
                },
                {
                    "key": "TenPlus",
                    "points": 5,
                    "title": "NFT Aficionado",
                    "description": "You own ten or more NFTs—a true connoisseur of digital art and collectibles.",
                    "thresholds": [
                        {
                            "label": "≥ 10 NFTs",
                            "description": "Ten or more NFTs held in this account."
                        }
                    ],
                    "advices": [
                        "Engage in NFT staking or lending for passive benefits.",
                        "Participate in community events or curate exhibitions of your collection."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:21:42.994Z"
        },
        {
            "key": "nftActivity",
            "active": true,
            "createdAt": "2025-07-24T11:30:29.702Z",
            "description": "Rewards how actively you interact with NFTs—buys, sells, transfers, mints and more. Higher event counts reflect deeper participation in the NFT ecosystem.",
            "displayName": "NFT Activity",
            "order": 10,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "Inactive",
                    "description": "You’ve made fewer than 10 NFT interactions (buys, sells, transfers, etc.). Low engagement in the NFT ecosystem limits your on‑chain footprint.",
                    "thresholds": [
                        {
                            "label": "< 10 events",
                            "description": "Total NFT interactions across all activities is under 10."
                        }
                    ],
                    "advices": [
                        "Start with a simple transfer or listing to get your first NFT event logged.",
                        "Explore an auction or swap to increase your interaction count."
                    ]
                },
                {
                    "key": "TenPlus",
                    "points": 1,
                    "title": "Engaged",
                    "description": "You’ve completed at least 10 NFT interactions—showing growing interest in NFTs and digital collectibles.",
                    "thresholds": [
                        {
                            "label": "≥ 10 events",
                            "description": "You have 10 or more NFT interactions in your transaction history."
                        }
                    ],
                    "advices": [
                        "Join a community drop or participate in a new mint to keep your count rising.",
                        "Set a weekly reminder to check and interact with NFT marketplaces."
                    ]
                },
                {
                    "key": "FiftyPlus",
                    "points": 2,
                    "title": "Active Collector",
                    "description": "You’ve made 50 or more NFT interactions—an on‑chain NFT veteran! Your high activity reflects deep participation in minting, trading, and transfers.",
                    "thresholds": [
                        {
                            "label": "≥ 50 events",
                            "description": "Your total NFT interactions reach or exceed 50 events."
                        }
                    ],
                    "advices": [
                        "Diversify across multiple collections to broaden your footprint.",
                        "Share your favorite interactions in community channels to inspire others."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:30:29.702Z"
        },
        {
            "key": "extrinsicDepth",
            "active": true,
            "createdAt": "2025-07-24T11:30:29.718Z",
            "description": "Measures how many on‑chain calls (extrinsics) you’ve submitted. More calls across modules mean deeper network usage and familiarity.",
            "displayName": "Extrinsic Depth",
            "order": 11,
            "reasons": [
                {
                    "key": "None",
                    "points": 0,
                    "title": "No Calls",
                    "description": "You haven’t submitted any extrinsics yet. Interacting with the chain is the core of on‑chain activity.",
                    "thresholds": [
                        {
                            "label": "0 calls",
                            "description": "No extrinsic submissions found for your account."
                        }
                    ],
                    "advices": [
                        "Submit a balance transfer or staking nomination to begin.",
                        "Explore a governance vote or proxy call to increase depth."
                    ]
                },
                {
                    "key": "OnePlus",
                    "points": 1,
                    "title": "Starter",
                    "description": "You’ve made at least one extrinsic call—welcome to on‑chain interactions!",
                    "thresholds": [
                        {
                            "label": "≥ 1 call",
                            "description": "You’ve interacted with the chain at least once."
                        }
                    ],
                    "advices": [
                        "Try a second transaction in a different module (e.g. governance or staking).",
                        "Aim for 50 calls to unlock the next tier."
                    ]
                },
                {
                    "key": "FiftyPlus",
                    "points": 5,
                    "title": "Experienced",
                    "description": "You’ve executed 50 or more extrinsic calls—solid on‑chain experience across modules.",
                    "thresholds": [
                        {
                            "label": "≥ 50 calls",
                            "description": "Your total extrinsic count across all modules is 50 or more."
                        }
                    ],
                    "advices": [
                        "Reach 100 calls for veteran status and deeper network understanding.",
                        "Continue exploring less‑used pallets to diversify your activity."
                    ]
                },
                {
                    "key": "HundredPlus",
                    "points": 10,
                    "title": "Veteran Caller",
                    "description": "100+ extrinsic calls—an on‑chain power user! Your deep activity spans transfers, staking, governance, and beyond.",
                    "thresholds": [
                        {
                            "label": "≥ 100 calls",
                            "description": "You’ve submitted at least 100 extrinsic calls in total."
                        }
                    ],
                    "advices": [
                        "Maintain this level to stay in the veteran tier.",
                        "Share your best practices for on‑chain interactions with newcomers."
                    ]
                }
            ],
            "updatedAt": "2025-07-24T11:30:29.718Z"
        }
    ]
}

*/
