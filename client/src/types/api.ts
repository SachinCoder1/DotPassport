export interface LoggedInUser {
  name: string;
  wallet: string;
  profile: any; // Define your Profile type here for better safety
  reputationScore: number;
  lastLogin: Date;
  isActive: boolean;
  success: boolean;
}

export interface Threshold {
  /** e.g. "Daily tx count" */
  label: string;
  /** e.g. "At least 10 transactions per day" */
  description: string;
}

export interface ReasonDetail {
  key: string;
  title: string;
  description: string;
  points: number;
  /** Optional list of requirements you’ve met to get here */
  thresholds?: Threshold[];
  /** Optional tips or advices for the next level */
  advices?: string[];
}

export interface ScoreCategory {
  key: string;
  displayName: string;
  short_description: string;
  long_description: string;
  order: number;
  reasons: ReasonDetail[];
}

export interface CategoryScore {
  score: number;
  reason: string;
  title: string;
}

export interface UserScore {
  totalScore: number;
  calculatedAt: string | null;
  categories: Record<string, CategoryScore>; // Maps are plain objects in JSON
  score_exists: boolean;
}

export interface RefreshScoreResponse {
  status: "CREATED" | "UPDATED" | "NO_CHANGE";
  message: string;
  score: any; // The full score document
}

// --- Badge Types ---

export interface BadgeLevelDefinition {
  level: number;
  key: string;
  value: number;
  title: string;
  shortDescription: string;
  longDescription?: string;
  constraints?: Array<{ description: string }>;
  advice?: string[];
}

export interface BadgeDefinition {
  _id: string;
  key: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  metric: string;
  order: number;
  levels: BadgeLevelDefinition[];
  imageUrl?: string;
}

export interface UserBadge {
  _id: string;
  user: string;
  badgeKey: string;
  achievedLevel: number;
  achievedLevelKey: string;
  achievedLevelTitle: string;
  earnedAt: string;
}

export interface UserBadgeResponse {
  badges: UserBadge[];
  message: string;
  count: number;
  success: boolean;
  badge_exists: boolean;
}
export interface RefreshBadgesResponse {
  message: string;
  created: number;
  updated: number;
  badges: UserBadge[];
}

// --- Public Profile Type ---

export interface PublicProfile {
  address: string;
  lastLogin: string;
  profile: {
    // Define your profile fields here, e.g.,
    displayName?: string;
    bio?: string;
  };
  score: UserScore | null;
  badges: UserBadge[];
}
