import { Schema, model, Document, Types } from "mongoose";

export interface ILoginHistory extends Document {
  user: Types.ObjectId; // reference to User
  address: string; // Polkadot address used
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

const LoginHistorySchema = new Schema<ILoginHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    success: { type: Boolean, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { versionKey: false }
);

export const LoginHistory = model<ILoginHistory>(
  "LoginHistory",
  LoginHistorySchema
);
