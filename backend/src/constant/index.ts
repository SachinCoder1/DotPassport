import { ENV_TYPE } from "~/types/enum";

export const ENV = process.env.NODE_ENV as ENV_TYPE;
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI as string;