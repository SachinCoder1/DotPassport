import mongoose, { Schema, Document } from 'mongoose';
import { ICategoryScore } from './Score';
import { CategoryKey } from '~/service/score/scoreDefinitions';
import { BadgeKey } from '~/service/badge/badgeDefinitions';

export interface IApiUserBadge {
  badgeKey: BadgeKey;
  achievedLevel: number;
  achievedLevelKey: string;
  achievedLevelTitle: string;
}

export interface IApiUserScore {
  totalScore: number;
  categories: Map<CategoryKey, ICategoryScore>;
  calculatedAt: Date;
}

export interface IApiUserProfile {
  displayName?: string;
  polkadotIdentity?: {
    display?: string;
    legal?: string;
    email?: string;
    web?: string;
    twitter?: string;
    github?: string;
    matrix?: string;
    discord?: string;
    judgements?: Array<{ index: number; judgement: string }>;
  };
  nftCount?: number;
}

export interface IApiUser extends Document {
  address: string;
  profile: IApiUserProfile;
  score: IApiUserScore;
  badges: IApiUserBadge[];
  metadata: {
    firstRequestedAt: Date;
    lastRequestedAt: Date;
    requestCount: number;
    source: 'api';
  };
  createdAt: Date;
  updatedAt: Date;
  ttl: Date;
}

const ApiUserSchema = new Schema<IApiUser>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    profile: {
      displayName: String,
      polkadotIdentity: {
        display: String,
        legal: String,
        email: String,
        web: String,
        twitter: String,
        github: String,
        matrix: String,
        discord: String,
        judgements: [
          {
            index: Number,
            judgement: String,
          },
        ],
      },
      nftCount: Number,
    },
    score: {
      totalScore: { type: Number, default: 0 },
      categories: {
        type: Map,
        of: {
          score: Number,
          reason: String,
          title: String,
        },
      },
      calculatedAt: { type: Date, default: Date.now },
    },
    badges: [
      {
        badgeKey: { type: String, required: true },
        achievedLevel: { type: Number, required: true },
        achievedLevelKey: { type: String, required: true },
        achievedLevelTitle: { type: String, required: true },
      },
    ],
    metadata: {
      firstRequestedAt: { type: Date, required: true },
      lastRequestedAt: { type: Date, required: true },
      requestCount: { type: Number, default: 1 },
      source: { type: String, default: 'api' },
    },
    ttl: {
      type: Date,
      required: true,
      // Auto-calculated: 30 days from lastRequestedAt
      // MongoDB TTL index will auto-delete when this date passes
    },
  },
  { timestamps: true }
);

// TTL index: Auto-delete documents after ttl date
ApiUserSchema.index({ ttl: 1 }, { expireAfterSeconds: 0 });

// Index on metadata.lastRequestedAt for query optimization
ApiUserSchema.index({ 'metadata.lastRequestedAt': -1 });

export const ApiUser = mongoose.model<IApiUser>('ApiUser', ApiUserSchema);
