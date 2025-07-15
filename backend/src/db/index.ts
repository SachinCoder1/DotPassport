import mongoose from "mongoose";
import { MONGO_URI } from "~/constant";
import { logger } from "~/utils/logger";

export default function CONNECT_MONGO_DB() {
  try {
    mongoose.set("strictQuery", true);
    mongoose
      .connect(MONGO_URI)
      .then(() => {
        logger.info('✅ MongoDB connected')
      })
      .catch((err) => {
        logger.error('❌ MongoDB connection error:', err)
        process.exit(1);
      });
  } catch (err) {
    console.log("Error while connecting to DB", err);
    process.exit(1);

  }
}