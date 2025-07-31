import { Schema, model, Document, Types } from 'mongoose';

// A sub-document for storing on-chain identity info for a single Polkadot address
export interface IPolkadotIdentity {
  address: string;
  display?: string;
  legal?: string;
  email?: string;
  web?: string;
  twitter?: string;
  github?: string;
  matrix?: string;
  discord?: string;
  judgements?: { index: number; judgement: string }[];
  role?: string;
  nonce?: number;
}

export interface IProfile extends Document {
  /** One-to-one link back to User */
  user: Types.ObjectId;
  /** User’s chosen display name */
  displayName?: string;
  /** URL to avatar image */
  avatarUrl?: string;
  /** Short bio text */
  bio?: string;
  /** Map of social links, e.g. { twitter: '...', website: '...' } */
  socialLinks?: Map<string, string>;
  /** Array of on-chain identities fetched from Subscan */
  polkadotIdentities: IPolkadotIdentity[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user
    },
    displayName: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null },
    socialLinks: { type: Map, of: String, default: {} },
    polkadotIdentities: {
      type: [
        {
          address: { type: String, required: true },
          display: { type: String },
          legal: { type: String },
          email: { type: String },
          web: { type: String },
          twitter: { type: String },
          github: { type: String },
          matrix: { type: String },
          discord: { type: String },
          judgements: { type: [{ index: Number, judgement: String }], default: [] },
          role: { type: String },
          nonce: { type: Number },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>('Profile', ProfileSchema);