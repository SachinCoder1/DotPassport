// src/models/Category.ts
import { Schema, model, Document } from "mongoose";
import { CategoryKey } from "~/service/score/scoreDefinitions";

export interface ThresholdDetail {
  label: string; // e.g. "≥ 7 days"
  description: string; // e.g. "You must have maintained an account for at least one calendar week..."
}

export interface ReasonDetail {
  key: string; // e.g. "OneWeek"
  points: number; // numeric points
  title: string; // e.g. "One Week Milestone"
  description: string; // long explanation of tier
  thresholds: ThresholdDetail[];
  advices: string[]; // actionable next‑steps
}

export interface CategoryDoc extends Document {
  key: CategoryKey;
  displayName: string;
  description: string;
  order: number;
  active: boolean;
  reasons: ReasonDetail[];
}

const ThresholdSchema = new Schema<ThresholdDetail>(
  {
    label: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const ReasonSchema = new Schema<ReasonDetail>(
  {
    key: { type: String, required: true },
    points: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thresholds: { type: [ThresholdSchema], required: true },
    advices: { type: [String], required: true },
  },
  { _id: false }
);

const CategorySchema = new Schema<CategoryDoc>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: Object.values(CategoryKey),
    },
    displayName: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    reasons: { type: [ReasonSchema], default: [] },
  },
  { timestamps: true }
);

export const Category = model<CategoryDoc>("Category", CategorySchema);