// src/models/UserBadge.ts
import { Schema, model, Document, Types } from "mongoose";
import { BadgeKey } from "~/service/badge/badgeDefinitions";

export interface IUserBadge extends Document {
  user: Types.ObjectId;
  badgeKey: BadgeKey;
  achievedLevel: number;
  achievedLevelKey: string; // The unique key for the level, e.g., "LEVEL_1_INITIATE"
  achievedLevelTitle: string;
  earnedAt: Date;
  updatedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeKey: {
      type: String,
      required: true,
      enum: Object.values(BadgeKey),
    },
    achievedLevel: {
      type: Number,
      required: true,
      min: 1,
    },
    achievedLevelKey: {
      type: String,
      required: true,
    },
    achievedLevelTitle: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { timestamps: true }
);

UserBadgeSchema.index({ user: 1, badgeKey: 1 }, { unique: true });

export const UserBadge = model<IUserBadge>("UserBadge", UserBadgeSchema);