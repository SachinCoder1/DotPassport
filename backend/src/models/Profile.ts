import { Schema, model, Document, Types } from 'mongoose';

export interface IProfile extends Document {
  /** One‑to‑one link back to User */
  user: Types.ObjectId;
  /** User’s chosen display name */
  displayName?: string;
  /** URL to avatar image */
  avatarUrl?: string;
  /** Short bio text */
  bio?: string;
  /** Map of social links, e.g. { twitter: '...', website: '...' } */
  socialLinks?: Map<string, string>;
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
    avatarUrl:   { type: String, default: null },
    bio:         { type: String, default: null },
    socialLinks: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>('Profile', ProfileSchema);
