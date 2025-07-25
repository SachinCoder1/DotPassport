// src/models/Badge.ts
import { Schema, model, Document } from "mongoose";
import { BadgeKey } from "~/service/badge/badgeDefinitions";

// Interface for a descriptive constraint
export interface IConstraintDetail {
  label: string; // e.g., "extrinsicCount >= 1"
  description: string; // e.g., "User must have at least one confirmed transaction."
}

// Interface for a single level within a badge's definition
export interface IBadgeLevelDefinition {
  level: number;
  key: string; // Unique key for the level, e.g., "LEVEL_1_INITIATE"
  value: number;
  title: string;
  constraints: IConstraintDetail[];
  advice: string[];
  shortDescription: string; // The short title for this level, e.g., "90+ Days Active"
  longDescription: string; // A more detailed explanation of this level's achievement
}

// Interface for the main Badge document
export interface IBadge extends Document {
  key: BadgeKey;
  title: string;
  shortDescription: string;
  longDescription: string;
  metric: string;
  order: number;
  active: boolean;
  levels: IBadgeLevelDefinition[];
  imageUrl?: string;
  metadata?: Record<string, any>;
}

const ConstraintDetailSchema = new Schema<IConstraintDetail>(
  {
    label: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const BadgeLevelSchema = new Schema<IBadgeLevelDefinition>(
  {
    level: { type: Number, required: true },
    key: { type: String, required: true, unique: true }, // Level keys should be unique
    value: { type: Number, required: true },
    title: { type: String, required: true },
    constraints: { type: [ConstraintDetailSchema], required: true },
    advice: { type: [String], required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
  },
  { _id: false }
);

const BadgeSchema = new Schema<IBadge>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: Object.values(BadgeKey),
    },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    metric: { type: String, required: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    levels: { type: [BadgeLevelSchema], default: [] },
    imageUrl: { type: String, required: false },
    metadata: { type: Schema.Types.Mixed, required: false, default: {} },
  },
  { timestamps: true }
);

export const Badge = model<IBadge>("Badge", BadgeSchema);
