import { Schema, model, Document, Types } from "mongoose";
import { CategoryKey } from "~/config/scoreReasons";

/**
 * Interface for a single category's score and its corresponding reason key.
 */
export interface ICategoryScore {
  score: number;
  reason: string;
}

/**
 * Interface for a historical score record.
 */
export interface IScoreHistory {
  totalScore: number;
  categories: Map<CategoryKey, ICategoryScore>;
  calculatedAt: Date;
}

/**
 * Interface for the main Score document.
 */
export interface IScore extends Document {
  user: Types.ObjectId;
  totalScore: number;
  categories: Map<CategoryKey, ICategoryScore>;
  history: IScoreHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for a single category's score breakdown.
const CategoryScoreSchema = new Schema<ICategoryScore>(
  {
    score: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

// Schema for a historical score entry.
const ScoreHistorySchema = new Schema<IScoreHistory>(
  {
    totalScore: { type: Number, required: true },
    categories: {
      type: Map,
      of: CategoryScoreSchema,
      required: true,
    },
    calculatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main schema for the Score document.
const ScoreSchema = new Schema<IScore>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalScore: {
      type: Number,
      required: true,
      default: 0,
    },
    categories: {
      type: Map,
      of: CategoryScoreSchema,
      required: true,
    },
    history: {
      type: [ScoreHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Score = model<IScore>("Score", ScoreSchema);
