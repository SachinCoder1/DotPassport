import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

// Tier enum
export enum ApiKeyTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

// Interface for rate limit configuration
export interface IRateLimitConfig {
  requestsPerHour: number;
  requestsPerDay: number;
  requestsPerMonth: number;
}

// Interface for usage statistics
export interface IUsageStats {
  totalRequests: number;
  lastRequestAt: Date | null;
  currentHourRequests: number;
  currentHourWindowStart: Date;
  currentDayRequests: number;
  currentDayStart: Date;
  currentMonthRequests: number;
  currentMonthStart: Date;
}

// Main ApiKey interface
export interface IApiKey extends Document {
  keyHash: string;
  keyPrefix: string;
  appName: string;
  contactEmail: string;
  tier: ApiKeyTier;
  isActive: boolean;
  allowedOrigins: string[];
  rateLimits: IRateLimitConfig;
  usage: IUsageStats;
  metadata: Map<string, any>;
  lastUsedAt: Date | null;
  createdBy: string;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Default rate limits by tier
export const TIER_RATE_LIMITS: Record<ApiKeyTier, IRateLimitConfig> = {
  [ApiKeyTier.FREE]: {
    requestsPerHour: 100,
    requestsPerDay: 1000,
    requestsPerMonth: 10000,
  },
  [ApiKeyTier.PRO]: {
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    requestsPerMonth: 100000,
  },
  [ApiKeyTier.ENTERPRISE]: {
    requestsPerHour: 10000,
    requestsPerDay: 100000,
    requestsPerMonth: 1000000,
  },
};

// Schema definition for rate limit config
const RateLimitConfigSchema = new Schema<IRateLimitConfig>(
  {
    requestsPerHour: { type: Number, required: true },
    requestsPerDay: { type: Number, required: true },
    requestsPerMonth: { type: Number, required: true },
  },
  { _id: false }
);

// Schema definition for usage stats
const UsageStatsSchema = new Schema<IUsageStats>(
  {
    totalRequests: { type: Number, default: 0 },
    lastRequestAt: { type: Date, default: null },
    currentHourRequests: { type: Number, default: 0 },
    currentHourWindowStart: { type: Date, default: () => new Date() },
    currentDayRequests: { type: Number, default: 0 },
    currentDayStart: { type: Date, default: () => new Date() },
    currentMonthRequests: { type: Number, default: 0 },
    currentMonthStart: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

// Main ApiKey schema
const ApiKeySchema = new Schema<IApiKey>(
  {
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyPrefix: {
      type: String,
      required: true,
      index: true,
    },
    appName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tier: {
      type: String,
      enum: Object.values(ApiKeyTier),
      required: true,
      default: ApiKeyTier.FREE,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    allowedOrigins: {
      type: [String],
      default: [],
    },
    rateLimits: {
      type: RateLimitConfigSchema,
      required: true,
    },
    usage: {
      type: UsageStatsSchema,
      default: () => ({}),
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: () => new Map(),
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: String,
      default: null,
    },
    revokedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ApiKeySchema.index({ isActive: 1, tier: 1 });
ApiKeySchema.index({ createdBy: 1 });
ApiKeySchema.index({ contactEmail: 1 });

// Instance methods
ApiKeySchema.methods.hashApiKey = function (apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

ApiKeySchema.methods.verifyApiKey = function (apiKey: string): boolean {
  const hash = this.hashApiKey(apiKey);
  return this.keyHash === hash;
};

export const ApiKey = model<IApiKey>('ApiKey', ApiKeySchema);
