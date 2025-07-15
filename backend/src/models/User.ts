import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
}

const UserSchema = new Schema<IUser>({
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
