/**
 * This file defines the static configuration for all available badges.
 * It includes their identification keys, descriptive metadata, and the
 * logic for evaluating user achievement against the defined criteria.
 */

// A unique identifier for each badge concept.
export enum BadgeKey {
  RelayChainInitiate = 'RelayChainInitiate',
  PolkadotRegular = 'PolkadotRegular',
  ExtrinsicEngine = 'ExtrinsicEngine',
  ParachainTraveler = 'ParachainTraveler',
  ReferendumVoter = 'ReferendumVoter',
  TreasuryContributor = 'TreasuryContributor',
  NposGuardian = 'NposGuardian',
  TrustedNominator = 'TrustedNominator',
  PolkadotCollector = 'PolkadotCollector',
  CrossChainHolder = 'CrossChainHolder',
  IdentityConfirmed = 'IdentityConfirmed',
  UtilityMaximizer = 'UtilityMaximizer',
}

// Defines the structure for a single level within a badge.
export interface BadgeLevel {
  level: number;
  key: string; // The unique, stable key for this level
  value: number;
  description: string;
}

export type BadgeEvaluator = (metricValue: number, levels: BadgeLevel[]) => number;

// The complete definition for a single badge.
export interface BadgeDefinition {
  key: BadgeKey;
  title: string;
  description: string;
  levels: BadgeLevel[];
  metric: string;
  evaluator: BadgeEvaluator;
}

/**
 * A standard evaluator for badges where a higher metric value is better.
 * @param metricValue The user's current value for the relevant metric.
 * @param levels The sorted array of levels for the badge.
 * @returns The highest achieved level number (e.g., 1, 2, 3), or 0 for none.
 */
export const standardEvaluator: BadgeEvaluator = (metricValue, levels) => {
  let achievedLevel = 0;
  for (const level of levels) {
    if (metricValue >= level.value) {
      achievedLevel = level.level;
    } else {
      break;
    }
  }
  return achievedLevel;
};


export const BADGE_DEFINITIONS: Record<BadgeKey, BadgeDefinition> = {
  [BadgeKey.RelayChainInitiate]: {
    key: BadgeKey.RelayChainInitiate,
    title: 'Relay Chain Initiate',
    description: 'Marks your first active participation on the Polkadot Relay Chain, the core of the network.',
    metric: 'extrinsicCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_INITIATE", value: 1, description: 'Completed your first-ever on-chain transaction.' },
    ],
  },

  [BadgeKey.PolkadotRegular]: {
    key: BadgeKey.PolkadotRegular,
    title: 'Polkadot Regular',
    description: 'Recognizes your sustained presence and long-term commitment to the ecosystem.',
    metric: 'accountAgeDays',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_90_DAYS", value: 90, description: 'Account is active for 90+ days.' },
      { level: 2, key: "LEVEL_2_1_YEAR", value: 365, description: 'Account is active for 1+ year.' },
      { level: 3, key: "LEVEL_3_3_YEARS", value: 1095, description: 'Account is active for 3+ years.' },
    ],
  },

  [BadgeKey.ExtrinsicEngine]: {
    key: BadgeKey.ExtrinsicEngine,
    title: 'Extrinsic Engine',
    description: 'Measures your overall activity level on the network. An "extrinsic" is any operation submitted to the chain.',
    metric: 'extrinsicCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_10_EXTRINSICS", value: 10, description: '10+ extrinsics confirmed.' },
      { level: 2, key: "LEVEL_2_50_EXTRINSICS", value: 50, description: '50+ extrinsics confirmed.' },
      { level: 3, key: "LEVEL_3_250_EXTRINSICS", value: 250, description: '250+ extrinsics confirmed.' },
    ],
  },

  [BadgeKey.ParachainTraveler]: {
    key: BadgeKey.ParachainTraveler,
    title: 'Parachain Traveler',
    description: "Highlights your exploration of Polkadot's multi-chain ecosystem by interacting with different specialized blockchains (parachains).",
    metric: 'parachainInteractionCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_1_PARACHAIN", value: 1, description: 'Interacted with at least 1 parachain.' },
      { level: 2, key: "LEVEL_2_3_PARACHAINS", value: 3, description: 'Interacted with 3+ different parachains.' },
      { level: 3, key: "LEVEL_3_5_PARACHAINS", value: 5, description: 'Interacted with 5+ different parachains.' },
    ],
  },

  [BadgeKey.ReferendumVoter]: {
    key: BadgeKey.ReferendumVoter,
    title: 'Referendum Voter',
    description: "Recognizes your participation in Polkadot's on-chain governance by voting on public proposals (referenda).",
    metric: 'referendaVoteCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_FIRST_VOTE", value: 1, description: 'Cast your first vote.' },
      { level: 2, key: "LEVEL_2_5_VOTES", value: 5, description: 'Voted on 5+ different referenda.' },
      { level: 3, key: "LEVEL_3_20_VOTES", value: 20, description: 'Voted on 20+ different referenda.' },
    ],
  },
  
  [BadgeKey.TreasuryContributor]: {
    key: BadgeKey.TreasuryContributor,
    title: 'Treasury Contributor',
    description: 'Awarded for directly influencing the allocation of the on-chain Treasury, a community-governed fund for ecosystem development.',
    metric: 'treasuryVoteCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_TREASURY_VOTE", value: 1, description: 'Voted on a Treasury Proposal.' },
    ],
  },

  [BadgeKey.NposGuardian]: {
    key: BadgeKey.NposGuardian,
    title: 'NPoS Guardian',
    description: "For contributing to the security of Polkadot's Nominated Proof-of-Stake (NPoS) system through consistent staking.",
    metric: 'nominatorActiveMonths',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_FIRST_NOMINATION", value: 0.1, description: 'Nominated a validator for the first time.' },
      { level: 2, key: "LEVEL_2_3_MONTHS_NOMINATING", value: 3, description: 'Remained an active nominator for 3+ consecutive months.' },
      { level: 3, key: "LEVEL_3_1_YEAR_NOMINATING", value: 12, description: 'Remained an active nominator for 1+ consecutive year.' },
    ],
  },
  
  [BadgeKey.TrustedNominator]: {
    key: BadgeKey.TrustedNominator,
    title: 'Trusted Nominator',
    description: 'Rewards your skill in selecting reliable validators, thereby avoiding penalties (slashing).',
    metric: 'nominatorActiveMonthsWithoutSlashes',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_6_MONTHS_SLASH_FREE", value: 6, description: 'Nominated for 6+ months with zero slashing events.' },
    ],
  },

  [BadgeKey.PolkadotCollector]: {
    key: BadgeKey.PolkadotCollector,
    title: 'Polkadot Collector',
    description: 'Measures the scale of your collection of Non-Fungible Tokens (NFTs) from across the Polkadot ecosystem.',
    metric: 'nftCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_5_NFTS", value: 5, description: 'Own 5+ NFTs.' },
      { level: 2, key: "LEVEL_2_25_NFTS", value: 25, description: 'Own 25+ NFTs.' },
      { level: 3, key: "LEVEL_3_100_NFTS", value: 100, description: 'Own 100+ NFTs.' },
    ],
  },
  
  [BadgeKey.CrossChainHolder]: {
    key: BadgeKey.CrossChainHolder,
    title: 'Cross-Chain Holder',
    description: "Showcases your engagement with Polkadot's interoperability by holding assets from different parachains.",
    metric: 'parachainAssetCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_2_ASSETS", value: 2, description: 'Hold native assets from 2+ different parachains.' },
      { level: 2, key: "LEVEL_2_4_ASSETS", value: 4, description: 'Hold native assets from 4+ different parachains.' },
    ],
  },

  [BadgeKey.IdentityConfirmed]: {
    key: BadgeKey.IdentityConfirmed,
    title: 'Identity Confirmed',
    description: 'For cryptographically verifying your account details on-chain, increasing the level of trust associated with your account.',
    metric: 'identityStatus',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_VERIFIED", value: 1, description: 'Identity is confirmed with a "Reasonable" or "KnownGood" judgement.' },
    ],
  },

  [BadgeKey.UtilityMaximizer]: {
    key: BadgeKey.UtilityMaximizer,
    title: 'Utility Maximizer',
    description: 'Recognizes your expertise in using advanced features, like the Utility pallet, to optimize your on-chain actions.',
    metric: 'batchTxCount',
    evaluator: standardEvaluator,
    levels: [
      { level: 1, key: "LEVEL_1_BATCH_TX", value: 1, description: 'Successfully executed a `batch` or `batch_all` transaction.' },
    ],
  },
};
