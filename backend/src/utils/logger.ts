import { createLogger, format, transports } from "winston";
import { ENV_TYPE } from "~/types/enum";

const { combine, timestamp, printf, errors, colorize, splat, metadata } =
  format;

// Helper to summarize metadata
function summarize(meta: any) {
  // Safely handle undefined/null meta
  if (!meta || typeof meta !== "object" || Object.keys(meta).length === 0)
    return "";

  if (meta.metadata && typeof meta.metadata === "object") {
    meta = meta.metadata;
  }
  // if express‑winston put its props under `meta`, unwrap that too
  if (meta.meta && typeof meta.meta === "object") {
    meta = meta.meta;
  }

  let parts: string[] = [];

  // Print all errors, indented
  if (Array.isArray(meta.errors) && meta.errors.length > 0) {
    parts.push("\nErrors:");
    meta.errors.forEach((err: string, i: number) => {
      parts.push(`  [${i + 1}] ${err}`);
    });
  }

  // Print status code
  if ("statusCode" in meta && meta.statusCode) {
    parts.push(`Status: ${meta.statusCode}`);
  }

  // print stack trace if available
  if ("stack" in meta && meta.stack) {
    parts.push("Stack trace:");
    parts.push(meta.stack);
  }

  // Print HTTP info and req.body
  if (meta.req && meta.res) {
    let http = `HTTP ${meta.req.method} ${meta.req.url} ${meta.res.statusCode} ${meta.res.responseTime}ms`;
    parts.push(http);

    // Print body (nicely formatted)

    if (meta.req.body && Object.keys(meta.req.body).length > 0) {
      parts.push("Request Body:");
      parts.push(JSON.stringify(meta.req.body, null, 2));
    }

    // Print query params
    if (meta.req.query && Object.keys(meta.req.query).length > 0) {
      parts.push("Query Params:");
      parts.push(JSON.stringify(meta.req.query, null, 2));
    }
  }

  // Other fields (single line for small stuff)
  Object.entries(meta).forEach(([k, v]) => {
    if (
      ["errors", "statusCode", "req", "res", "stack", "metadata"].includes(k) ||
      typeof v === "object"
    )
      return;
    parts.push(`${k}: ${v}`);
  });

  return parts.length ? "\n" + parts.join("\n") : "";
}

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  splat(),
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  printf(({ level, message, timestamp, metadata }) => {
    // Print summary, not whole metadata
    return `${timestamp} ${level}: ${message}${summarize(metadata)}`;
  })
);

// File: Keep everything, as JSON
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  format.json()
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  silent: process.env.NODE_ENV === ENV_TYPE.TESTING,
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

logger.exceptions.handle(
  new transports.File({ filename: "logs/exceptions.log" })
);

logger.rejections.handle(
  new transports.File({ filename: "logs/rejections.log" })
);
