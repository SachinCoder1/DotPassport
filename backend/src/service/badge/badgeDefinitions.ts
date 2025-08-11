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












/*

Stored in DB:

{
    "badges": [
        {
            "key": "RelayChainInitiate",
            "title": "Relay Chain Initiate",
            "shortDescription": "Marks your first active participation on the Polkadot Relay Chain.",
            "longDescription": "This badge is awarded upon the successful confirmation of your very first transaction on the Polkadot network. It signifies your entry into the ecosystem and is the foundational step for all future on-chain activity.",
            "metric": "extrinsicCount",
            "order": 1,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_INITIATE",
                    "value": 1,
                    "title": "Complete 1 On-Chain Transaction",
                    "shortDescription": "Complete 1 On-Chain Transaction",
                    "longDescription": "This level is achieved by successfully executing a single transaction, such as a transfer or a vote, which writes your presence onto the blockchain permanently.",
                    "constraints": [
                        {
                            "label": "extrinsicCount >= 1",
                            "description": "User must have at least one confirmed transaction."
                        }
                    ],
                    "advice": [
                        "Send a small amount of DOT to another address.",
                        "Interact with the staking or governance system for the first time."
                    ]
                }
            ]
        },
        {
            "key": "PolkadotRegular",
            "title": "Polkadot Regular",
            "shortDescription": "Recognizes your sustained presence and long-term commitment to the ecosystem.",
            "longDescription": "Longevity is a key indicator of trust and commitment. This badge celebrates your enduring presence, marking significant milestones in your journey with the Polkadot network.",
            "metric": "accountAgeDays",
            "order": 2,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_90_DAYS",
                    "value": 90,
                    "title": "90+ Days Active",
                    "shortDescription": "90+ Days Active",
                    "longDescription": "Achieved when your account's first transaction is at least 90 days in the past, marking you as a consistent member of the community.",
                    "constraints": [
                        {
                            "label": "accountAgeDays >= 90",
                            "description": "The account's first transaction must be at least 90 days ago."
                        }
                    ],
                    "advice": [
                        "Stay active in the ecosystem.",
                        "Your account's age will naturally increase over time as you hold assets or participate."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_1_YEAR",
                    "value": 365,
                    "title": "1+ Year Active",
                    "shortDescription": "1+ Year Active",
                    "longDescription": "Awarded for maintaining an on-chain presence for over a year. This demonstrates a significant long-term commitment to the Polkadot ecosystem.",
                    "constraints": [
                        {
                            "label": "accountAgeDays >= 365",
                            "description": "The account's first transaction must be at least one year ago."
                        }
                    ],
                    "advice": [
                        "Commit to the long term! This badge is a testament to your enduring presence."
                    ]
                },
                {
                    "level": 3,
                    "key": "LEVEL_3_3_YEARS",
                    "value": 1095,
                    "title": "3+ Years Active",
                    "shortDescription": "3+ Years Active",
                    "longDescription": "This elite level recognizes you as a true veteran of the network. A three-year on-chain history is a powerful testament to your belief in Polkadot's vision.",
                    "constraints": [
                        {
                            "label": "accountAgeDays >= 1095",
                            "description": "The account's first transaction must be at least three years ago."
                        }
                    ],
                    "advice": [
                        "You are a true veteran of the network. Your long-term commitment is highly valued."
                    ]
                }
            ]
        },
        {
            "key": "ExtrinsicEngine",
            "title": "Extrinsic Engine",
            "shortDescription": "Measures your overall activity level on the network.",
            "longDescription": "This badge quantifies your on-chain activity. Every vote, transfer, stake, or interaction is an extrinsic. A high count demonstrates deep and frequent engagement with the network's functionalities.",
            "metric": "extrinsicCount",
            "order": 3,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_10_EXTRINSICS",
                    "value": 10,
                    "title": "10+ Confirmed Extrinsics",
                    "shortDescription": "10+ Confirmed Extrinsics",
                    "longDescription": "This level is achieved by executing at least 10 transactions, showing you are an active and engaged network participant.",
                    "constraints": [
                        {
                            "label": "extrinsicCount >= 10",
                            "description": "User must have at least 10 confirmed transactions."
                        }
                    ],
                    "advice": [
                        "Engage in regular on-chain activities like voting, staking, or transferring assets."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_50_EXTRINSICS",
                    "value": 50,
                    "title": "50+ Confirmed Extrinsics",
                    "shortDescription": "50+ Confirmed Extrinsics",
                    "longDescription": "Executing over 50 transactions demonstrates a strong pattern of interaction and marks you as a power user of the network.",
                    "constraints": [
                        {
                            "label": "extrinsicCount >= 50",
                            "description": "User must have at least 50 confirmed transactions."
                        }
                    ],
                    "advice": [
                        "Become a power user by frequently interacting with different network functions."
                    ]
                },
                {
                    "level": 3,
                    "key": "LEVEL_3_250_EXTRINSICS",
                    "value": 250,
                    "title": "250+ Confirmed Extrinsics",
                    "shortDescription": "250+ Confirmed Extrinsics",
                    "longDescription": "With over 250 transactions, you are in the top tier of on-chain activity, showcasing a deep and consistent integration with the Polkadot ecosystem.",
                    "constraints": [
                        {
                            "label": "extrinsicCount >= 250",
                            "description": "User must have at least 250 confirmed transactions."
                        }
                    ],
                    "advice": [
                        "Your high level of activity demonstrates a deep integration with the Polkadot ecosystem."
                    ]
                }
            ]
        },
        {
            "key": "ParachainTraveler",
            "title": "Parachain Traveler",
            "shortDescription": "Highlights your exploration of Polkadot's multi-chain ecosystem.",
            "longDescription": "This badge is awarded for interacting with Polkadot's specialized blockchains (parachains). It shows you are leveraging the true interoperable power of the network by moving beyond the Relay Chain.",
            "metric": "parachainInteractionCount",
            "order": 4,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_1_PARACHAIN",
                    "value": 1,
                    "title": "Interact with 1+ Parachain",
                    "shortDescription": "Interact with 1+ Parachain",
                    "longDescription": "This level is achieved by making at least one transaction to or from any parachain, demonstrating your first step into the cross-chain ecosystem.",
                    "constraints": [
                        {
                            "label": "parachainInteractionCount >= 1",
                            "description": "User must have at least one transaction to or from a parachain."
                        }
                    ],
                    "advice": [
                        "Use the Polkadot Staking Dashboard to move assets to a parachain like Moonbeam or Astar.",
                        "Try a DeFi application on a parachain."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_3_PARACHAINS",
                    "value": 3,
                    "title": "Interact with 3+ Parachains",
                    "shortDescription": "Interact with 3+ Parachains",
                    "longDescription": "By interacting with three or more different parachains, you show a broad engagement with the diverse applications and communities within Polkadot.",
                    "constraints": [
                        {
                            "label": "parachainInteractionCount >= 3",
                            "description": "User must have transactions involving at least three different parachains."
                        }
                    ],
                    "advice": [
                        "Explore the unique features of different parachains to broaden your on-chain experience."
                    ]
                },
                {
                    "level": 3,
                    "key": "LEVEL_3_5_PARACHAINS",
                    "value": 5,
                    "title": "Interact with 5+ Parachains",
                    "shortDescription": "Interact with 5+ Parachains",
                    "longDescription": "Interacting with five or more parachains marks you as a true cross-chain expert, deeply familiar with the interoperable landscape of Polkadot.",
                    "constraints": [
                        {
                            "label": "parachainInteractionCount >= 5",
                            "description": "User must have transactions involving at least five different parachains."
                        }
                    ],
                    "advice": [
                        "Mastering cross-chain interactions shows a deep understanding of Polkadot's vision."
                    ]
                }
            ]
        },
        {
            "key": "ReferendumVoter",
            "title": "Referendum Voter",
            "shortDescription": "Recognizes your participation in Polkadot's on-chain governance.",
            "longDescription": "This badge is awarded for voting on public proposals (referenda), which determine the future of the network. It signifies your commitment to Polkadot's decentralized, democratic process.",
            "metric": "referendaVoteCount",
            "order": 5,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_FIRST_VOTE",
                    "value": 1,
                    "title": "Cast Your First Vote",
                    "shortDescription": "Cast Your First Vote",
                    "longDescription": "This level is awarded for casting your first vote in any referendum, making your voice heard in the network's collective decision-making.",
                    "constraints": [
                        {
                            "label": "referendaVoteCount >= 1",
                            "description": "User must have voted on at least one referendum."
                        }
                    ],
                    "advice": [
                        "Find an active referendum on Polkassembly or the Polkadot Staking Dashboard and cast your vote."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_5_VOTES",
                    "value": 5,
                    "title": "Vote on 5+ Referenda",
                    "shortDescription": "Vote on 5+ Referenda",
                    "longDescription": "By voting on five or more separate referenda, you demonstrate a consistent commitment to participating in network governance.",
                    "constraints": [
                        {
                            "label": "referendaVoteCount >= 5",
                            "description": "User must have voted on at least five different referenda."
                        }
                    ],
                    "advice": [
                        "Regularly check for new proposals and make your voice heard to help shape the network."
                    ]
                },
                {
                    "level": 3,
                    "key": "LEVEL_3_20_VOTES",
                    "value": 20,
                    "title": "Vote on 20+ Referenda",
                    "shortDescription": "Vote on 20+ Referenda",
                    "longDescription": "Voting on over twenty referenda places you in a dedicated group of governance participants who actively shape the evolution of Polkadot.",
                    "constraints": [
                        {
                            "label": "referendaVoteCount >= 20",
                            "description": "User must have voted on at least twenty different referenda."
                        }
                    ],
                    "advice": [
                        "Your consistent participation makes you a key member of the governance community."
                    ]
                }
            ]
        },
        {
            "key": "TreasuryContributor",
            "title": "Treasury Contributor",
            "shortDescription": "Awarded for directly influencing the allocation of the on-chain Treasury.",
            "longDescription": "The Polkadot Treasury is a community-governed fund for ecosystem projects. This badge recognizes your role in its stewardship by voting on funding proposals.",
            "metric": "treasuryVoteCount",
            "order": 6,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_TREASURY_VOTE",
                    "value": 1,
                    "title": "Vote on a Treasury Proposal",
                    "shortDescription": "Vote on a Treasury Proposal",
                    "longDescription": "This level is achieved by participating in a vote related to a Treasury proposal, directly influencing how community funds are allocated.",
                    "constraints": [
                        {
                            "label": "treasuryVoteCount >= 1",
                            "description": "User must have at least one transaction interacting with the Treasury pallet."
                        }
                    ],
                    "advice": [
                        "Participate in a vote for a Treasury proposal to influence how ecosystem funds are spent.",
                        "Follow Treasury discussions on community forums."
                    ]
                }
            ]
        },
        {
            "key": "NposGuardian",
            "title": "NPoS Guardian",
            "shortDescription": "For contributing to the security of Polkadot's Nominated Proof-of-Stake (NPoS) system.",
            "longDescription": "By staking your DOT and nominating validators, you play a critical role in securing the network. This badge celebrates your contribution to Polkadot's consensus and stability.",
            "metric": "nominatorActiveMonths",
            "order": 7,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_FIRST_NOMINATION",
                    "value": 0.1,
                    "title": "First-Time Nominator",
                    "shortDescription": "First-Time Nominator",
                    "longDescription": "Awarded for making your first nomination, this level marks your entry as a contributor to Polkadot's network security.",
                    "constraints": [
                        {
                            "label": "nominatorActiveMonths > 0",
                            "description": "User must have been an active nominator."
                        }
                    ],
                    "advice": [
                        "Stake your DOT and nominate at least one validator to start securing the network."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_3_MONTHS_NOMINATING",
                    "value": 3,
                    "title": "3+ Months Active Nominator",
                    "shortDescription": "3+ Months Active Nominator",
                    "longDescription": "This level recognizes three months of continuous staking and nomination, highlighting your consistent support for network validators.",
                    "constraints": [
                        {
                            "label": "nominatorActiveMonths >= 3",
                            "description": "User must have been an active nominator for at least 3 months."
                        }
                    ],
                    "advice": [
                        "Keep your nominations active to show your ongoing commitment to network security."
                    ]
                },
                {
                    "level": 3,
                    "key": "LEVEL_3_1_YEAR_NOMINATING",
                    "value": 12,
                    "title": "1+ Year Active Nominator",
                    "shortDescription": "1+ Year Active Nominator",
                    "longDescription": "A full year of active nomination is a significant milestone, proving your long-term dedication to the security and stability of Polkadot.",
                    "constraints": [
                        {
                            "label": "nominatorActiveMonths >= 12",
                            "description": "User must have been an active nominator for at least one year."
                        }
                    ],
                    "advice": [
                        "Your long-term staking is a critical contribution to the stability of Polkadot."
                    ]
                }
            ]
        },
        {
            "key": "TrustedNominator",
            "title": "Trusted Nominator",
            "shortDescription": "Rewards your skill in selecting reliable validators.",
            "longDescription": "This badge is awarded for maintaining a clean staking record. It proves your ability to research and select high-performing, trustworthy validators, which is crucial for the health of the network.",
            "metric": "nominatorActiveMonthsWithoutSlashes",
            "order": 8,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_6_MONTHS_SLASH_FREE",
                    "value": 6,
                    "title": "6+ Months Slash-Free",
                    "shortDescription": "6+ Months Slash-Free",
                    "longDescription": "This level is awarded for actively nominating for over six months without any of your chosen validators being slashed, demonstrating prudent and effective decision-making.",
                    "constraints": [
                        {
                            "label": "nominatorActiveMonths >= 6",
                            "description": "User must have been an active nominator for at least 6 months."
                        },
                        {
                            "label": "slashCount == 0",
                            "description": "User must have received zero slashing penalties during this time."
                        }
                    ],
                    "advice": [
                        "Carefully research and select validators with a strong reputation to maintain a clean record.",
                        "Consider diversifying your nominations across several trusted validators."
                    ]
                }
            ]
        },
        {
            "key": "PolkadotCollector",
            "title": "Polkadot Collector",
            "shortDescription": "Measures the scale of your collection of Non-Fungible Tokens (NFTs).",
            "longDescription": "This badge recognizes your activity in the vibrant world of digital collectibles on Polkadot. The size of your collection reflects your engagement with the ecosystem's artists and creators.",
            "metric": "nftCount",
            "order": 9,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_5_NFTS",
                    "value": 5,
                    "title": "Own 5+ NFTs",
                    "shortDescription": "Own 5+ NFTs",
                    "longDescription": "By owning five or more NFTs, you've started a meaningful collection and are actively participating in the creator economy on Polkadot.",
                    "constraints": [
                        {
                            "label": "nftCount >= 5",
                            "description": "User must own at least 5 NFTs on Polkadot or its parachains."
                        }
                    ],
                    "advice": [
                        "Explore NFT marketplaces on parachains like Moonbeam or Unique Network to start your collection."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_25_NFTS",
                    "value": 25,
                    "title": "Own 25+ NFTs",
                    "shortDescription": "Own 25+ NFTs",
                    "longDescription": "A collection of 25 or more NFTs marks you as a serious collector who is curating a significant portfolio of digital assets.",
                    "constraints": [
                        {
                            "label": "nftCount >= 25",
                            "description": "User must own at least 25 NFTs."
                        }
                    ],
                    "advice": [
                        "Become an avid collector by acquiring a diverse range of NFTs from different artists and projects."
                    ]
                },
                {
                    "level": 3,
                    "key": "LEVEL_3_100_NFTS",
                    "value": 100,
                    "title": "Own 100+ NFTs",
                    "shortDescription": "Own 100+ NFTs",
                    "longDescription": "Owning over 100 NFTs is a remarkable achievement, signifying a deep commitment to supporting artists and collecting on the Polkadot network.",
                    "constraints": [
                        {
                            "label": "nftCount >= 100",
                            "description": "User must own at least 100 NFTs."
                        }
                    ],
                    "advice": [
                        "Your extensive collection marks you as a significant patron of the Polkadot digital art scene."
                    ]
                }
            ]
        },
        {
            "key": "CrossChainHolder",
            "title": "Cross-Chain Holder",
            "shortDescription": "Showcases your engagement with Polkadot's interoperability by holding assets from different parachains.",
            "longDescription": "This badge is awarded for holding a diverse portfolio of native assets from multiple parachains. It demonstrates your belief in and usage of Polkadot's core cross-chain vision.",
            "metric": "parachainAssetCount",
            "order": 10,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_2_ASSETS",
                    "value": 2,
                    "title": "Hold Assets from 2+ Parachains",
                    "shortDescription": "Hold Assets from 2+ Parachains",
                    "longDescription": "This level is achieved by holding the native tokens of at least two different parachains, showcasing your initial exploration of the multi-chain ecosystem.",
                    "constraints": [
                        {
                            "label": "parachainAssetCount >= 2",
                            "description": "User must hold native tokens from at least two different parachains."
                        }
                    ],
                    "advice": [
                        "Acquire tokens like GLMR (Moonbeam) or ASTR (Astar) in addition to your DOT."
                    ]
                },
                {
                    "level": 2,
                    "key": "LEVEL_2_4_ASSETS",
                    "value": 4,
                    "title": "Hold Assets from 4+ Parachains",
                    "shortDescription": "Hold Assets from 4+ Parachains",
                    "longDescription": "Holding assets from four or more parachains demonstrates a deep and diversified investment in the success of the entire Polkadot ecosystem.",
                    "constraints": [
                        {
                            "label": "parachainAssetCount >= 4",
                            "description": "User must hold native tokens from at least four different parachains."
                        }
                    ],
                    "advice": [
                        "Diversify your portfolio across the ecosystem to show your belief in a multi-chain future."
                    ]
                }
            ]
        },
        {
            "key": "IdentityConfirmed",
            "title": "Identity Confirmed",
            "shortDescription": "For cryptographically verifying your account details on-chain.",
            "longDescription": "This badge signifies a higher level of trust. By setting an on-chain identity and having it verified by a registrar, you make your account more reputable within the ecosystem.",
            "metric": "identityStatus",
            "order": 11,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_VERIFIED",
                    "value": 1,
                    "title": "Identity Verified by Registrar",
                    "shortDescription": "Identity Verified by Registrar",
                    "longDescription": "This level is achieved when an on-chain registrar has successfully verified your identity, marking your account with a green check of trust.",
                    "constraints": [
                        {
                            "label": "identityStatus == 1",
                            "description": "User must have a verified on-chain identity with a 'Reasonable' or 'KnownGood' judgement."
                        }
                    ],
                    "advice": [
                        "Use the Polkadot-JS UI or other tools to set your on-chain identity.",
                        "Submit your identity for verification by an on-chain registrar."
                    ]
                }
            ]
        },
        {
            "key": "UtilityMaximizer",
            "title": "Utility Maximizer",
            "shortDescription": "Recognizes your expertise in using advanced features to optimize your on-chain actions.",
            "longDescription": "This badge is for power users who understand how to use advanced functions like the Utility pallet. Executing a batch transaction shows a sophisticated understanding of network efficiency.",
            "metric": "batchTxCount",
            "order": 12,
            "active": true,
            "metadata": {},
            "levels": [
                {
                    "level": 1,
                    "key": "LEVEL_1_BATCH_TX",
                    "value": 1,
                    "title": "Execute a Batch Transaction",
                    "shortDescription": "Execute a Batch Transaction",
                    "longDescription": "This level is achieved by using the 'batch' or 'batch_all' function to combine multiple operations into a single, efficient transaction, saving on fees and network space.",
                    "constraints": [
                        {
                            "label": "batchTxCount >= 1",
                            "description": "User must have successfully executed at least one 'batch' or 'batch_all' transaction."
                        }
                    ],
                    "advice": [
                        "Use the 'batch' or 'batch_all' function via Polkadot-JS UI to combine several actions, like staking and voting, into one efficient transaction."
                    ]
                }
            ]
        }
    ]
}

*/