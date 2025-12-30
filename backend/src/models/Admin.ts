import { Schema, model, Document, Types } from 'mongoose';

export interface IAdmin extends Document {
  userId?: Types.ObjectId;       // Optional: Reference to User document
  address: string;                // Required: Polkadot address
  role: 'super_admin' | 'admin';  // Future-proof: support role hierarchy
  grantedAt: Date;                // Timestamp when admin status granted
  grantedBy?: Types.ObjectId;     // Audit: who granted admin status
  notes?: string;                 // Optional: reason for admin access
  isActive: boolean;              // Soft delete capability
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'super_admin'],
      default: 'admin',
    },
    grantedAt: {
      type: Date,
      default: () => new Date(),
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }  // Auto-adds createdAt and updatedAt
);

// Indexes for efficient lookups
AdminSchema.index({ userId: 1 }, { sparse: true });  // Lookup by user ID (sparse allows multiple nulls)
AdminSchema.index({ address: 1 }, { unique: true }); // Unique constraint on address
AdminSchema.index({ isActive: 1 });                  // Filter active admins

export const Admin = model<IAdmin>('Admin', AdminSchema);
