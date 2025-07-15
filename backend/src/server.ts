// src/server.ts
import dotenv from 'dotenv';


import { createApp } from '~/app';
import { connectDB } from '~/db';
import { logger } from '~/utils/logger';
import mongoose from 'mongoose';
import { PORT } from './config';
dotenv.config();
const app = createApp();

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      logger.info('🛑 Shutting down…');
      // close Mongo connection
      await mongoose.disconnect();
      // stop accepting new requests, then exit
      server.close(() => {
        logger.info('👋 Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((err) => {
    logger.error('❌ Server startup failed', err);
    process.exit(1);
  });
