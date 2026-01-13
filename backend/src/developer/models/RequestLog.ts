import { Schema, model, Document, Types } from 'mongoose';

export interface IRequestLog extends Document {
  apiKeyId: Types.ObjectId;
  polkadotAddress?: string; // Denormalized for faster queries
  endpoint: string;
  method: string;
  isWidget: boolean; // True if request came from widget embed, false for API calls
  statusCode: number;
  responseTime: number; // milliseconds
  timestamp: Date;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
}

const RequestLogSchema = new Schema<IRequestLog>(
  {
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: 'ApiKey',
      required: true,
      index: true,
    },
    polkadotAddress: {
      type: String,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    isWidget: {
      type: Boolean,
      required: true,
      default: false,
      index: true, // For filtering widget vs API calls
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    requestHeaders: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    requestBody: {
      type: Schema.Types.Mixed,
      default: null,
    },
    responseBody: {
      type: Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
RequestLogSchema.index({ apiKeyId: 1, timestamp: -1 });
RequestLogSchema.index({ polkadotAddress: 1, timestamp: -1 });
RequestLogSchema.index({ endpoint: 1, timestamp: -1 });

// TTL index - auto-delete logs older than 90 days
RequestLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const RequestLog = model<IRequestLog>('RequestLog', RequestLogSchema);
