import { ENV_TYPE } from "~/types/enum";
import { logger } from "~/utils/logger";
import dotenv from "dotenv";

dotenv.config();
const { DEVELOPMENT, TESTING, PRODUCTION } = ENV_TYPE;

export const ENV = process.env.NODE_ENV as ENV_TYPE;
export const PORT = process.env.PORT;
export const MONGO_URI =
  ENV === DEVELOPMENT
    ? (process.env.MONGO_URI as string)
    : (process.env.MONGO_URI_PROD as string);

const config = {
  [DEVELOPMENT]: {
    BASE_URL: "http://localhost:8080",
    CLIENT_URL: "http://localhost:3000",
  },
  [TESTING]: {
    BASE_URL: "",
    CLIENT_URL: "",
  },
  [PRODUCTION]: {
    BASE_URL: "https://backend.dotpassport.io",
    CLIENT_URL: "https://dotpassport.io",
  },
};

const envConfig = config[ENV];
logger.info(`Environment: ${ENV}`);
export const BASE_URL = envConfig.BASE_URL;
export const CLIENT_URL = envConfig.CLIENT_URL;

export const API_VERSION = "v1";

export const DEFAULT_API_URL = `/api/${API_VERSION}`;
