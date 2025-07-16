import { Schema, model, Document } from "mongoose";

export interface IChallenge extends Document {
  address: string;
  message: string;
  nonce: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    address: { type: String, required: true, index: true },
    message: { type: String, required: true },
    nonce: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL will still remove expired ones
ChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Challenge = model<IChallenge>("Challenge", ChallengeSchema);
