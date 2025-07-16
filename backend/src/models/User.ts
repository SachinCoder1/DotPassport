import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  addresses: string[];
  did?: string;
  /** Reference to that user’s Profile doc */
  profile: Types.ObjectId | null;
  roles: string[];
  reputationScore: number;
  sybilScore: number;
  badges: Types.ObjectId[];
  loginHistory: Types.ObjectId[];
  lastLogin?: Date;
  refreshTokens?: {
    token: string;
    createdAt: Date;
    expiresAt: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    addresses: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length > 0, 'At least one address required'],
    },
    did: { type: String, default: null },

    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      default: null,
    },

    roles: {
      type: [String],
      enum: ['user', 'admin'],
      default: ['user'],
    },

    reputationScore: { type: Number, default: 0 },
    sybilScore:      { type: Number, default: 0 },

    badges:       [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    loginHistory: [{ type: Schema.Types.ObjectId, ref: 'LoginHistory' }],

    lastLogin: { type: Date, default: null },

    refreshTokens: [
      {
        token:     { type: String, required: true },
        createdAt: { type: Date,   required: true, default: () => new Date() },
        expiresAt: { type: Date,   required: true },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// auto‑cleanup expired refreshTokens
UserSchema.index({ 'refreshTokens.expiresAt': 1 }, { expireAfterSeconds: 0 });

export const User = model<IUser>('User', UserSchema);
