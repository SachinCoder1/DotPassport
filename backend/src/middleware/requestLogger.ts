import expressWinston from "express-winston";
import { logger } from "~/utils/logger";

export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  expressFormat: false,
  colorize: false,
  requestWhitelist: [
    "url",
    "method",
    "httpVersion",
    "originalUrl",
    "query",
    "body",
    "headers",
    "params",
  ],
  responseWhitelist: ["statusCode", "responseTime", "body"],
});
