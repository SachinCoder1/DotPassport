import { ENV } from "~/constant";
import { ENV_TYPE } from "~/types/enum";

const { DEVELOPMENT, TESTING, PRODUCTION } = ENV_TYPE;

const config = {
  [DEVELOPMENT]: {
    BASE_URL: "http://localhost:8080",
    CLIENT_URL: "http://localhost:3000",
    REDIS: {
      HOST: "127.0.0.1",
      PORT: 6379
    }
  },
  [TESTING]: {
    BASE_URL: "",
    CLIENT_URL: "",
    REDIS: {
      HOST: "127.0.0.1",
      PORT: 6379
    }
  },
  [PRODUCTION]: {
    BASE_URL: "",
    CLIENT_URL: "",
    REDIS: {
      HOST: "redis",
      PORT: 6379
    }

  },
};

const envConfig = config[ENV];
export const BASE_URL = envConfig.BASE_URL;
export const CLIENT_URL = envConfig.CLIENT_URL;
export const REDIS_URL = envConfig.REDIS;

export const API_VERSION = "v1";

export const DEFAULT_API_URL = `/api/${API_VERSION}`;
