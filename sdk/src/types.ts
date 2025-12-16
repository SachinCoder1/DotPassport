/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * User Profile
 */
export interface PolkadotIdentity {
  address: string;
  display?: string;
  web?: string;
  twitter?: string;
  github?: string;
  judgements?: Array<{ index: number; judgement: string }>;
}

export interface UserProfile {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks: Record<string, string>;
  polkadotIdentities: PolkadotIdentity[];
}

/**
 * Scores
 */
export interface CategoryScore {
  score: number;
  reason: string;
  title: string;
}

export interface UserScores {
  address: string;
  totalScore: number;
  calculatedAt: string;
  categories: Record<string, CategoryScore>;
}

export interface SpecificCategoryScore {
  address: string;
  category: {
    key: string;
    score: CategoryScore;
  };
  definition: CategoryDefinition | null;
  calculatedAt: string;
}

/**
 * Badges
 */
export interface UserBadge {
  badgeKey: string;
  achievedLevel: number;
  achievedLevelKey: string;
  achievedLevelTitle: string;
  earnedAt: string;
}

export interface UserBadges {
  address: string;
  badges: UserBadge[];
  count: number;
}

export interface SpecificUserBadge {
  address: string;
  badge: UserBadge;
  definition: BadgeDefinition | null;
}

/**
 * Metadata Definitions
 */
export interface BadgeLevel {
  level: number;
  key: string;
  value: number;
  title: string;
  shortDescription: string;
  longDescription: string;
}

export interface BadgeDefinition {
  key: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  metric: string;
  imageUrl?: string;
  levels: BadgeLevel[];
}

export interface ThresholdDetail {
  label: string;
  description: string;
}

export interface ReasonDetail {
  key: string;
  points: number;
  title: string;
  description: string;
  thresholds: ThresholdDetail[];
  advices: string[];
}

export interface CategoryDefinition {
  key: string;
  displayName: string;
  short_description: string;
  long_description: string;
  order: number;
  reasons: ReasonDetail[];
}

export interface BadgeDefinitions {
  badges: BadgeDefinition[];
}

export interface CategoryDefinitions {
  categories: CategoryDefinition[];
}
