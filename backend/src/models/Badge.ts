import { Schema, model, Document } from "mongoose";

export interface IBadge extends Document {
  slug: string; // unique short identifier, e.g. 'governance-voter'
  name: string; // human‑readable, e.g. 'Governance Voter'
  description: string; // details about the badge
  criteria: string; // text describing requirements to earn it
  iconUrl?: string; // optional icon asset location
  category?: string; // e.g. 'governance', 'staking', 'nft'
  metadata?: Record<string, any>; // free‑form for future fields
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    criteria: { type: String, required: true },
    iconUrl: { type: String, default: null },
    category: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Badge = model<IBadge>("Badge", BadgeSchema);
