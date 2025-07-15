// src/db/index.ts
import mongoose from 'mongoose';
import { MONGO_URI } from '~/config';
import { logger } from '~/utils/logger';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(MONGO_URI);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection error', err);
    process.exit(1);          // bail out if we can’t talk to the DB
  }
}
