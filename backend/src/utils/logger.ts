import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, errors, colorize, splat, metadata } = format;

// Helper to summarize metadata
function summarize(meta: any) {
  // Safely handle undefined/null meta
  if (!meta || typeof meta !== 'object' || Object.keys(meta).length === 0) return "";

  // Unwrap .metadata if present
  if (meta.metadata && typeof meta.metadata === 'object') meta = meta.metadata;

  let parts: string[] = [];

  // Print all errors, indented
  if (Array.isArray(meta.errors) && meta.errors.length > 0) {
    parts.push('\nErrors:');
    meta.errors.forEach((err: string, i: number) => {
      parts.push(`  [${i + 1}] ${err}`);
    });
  }

  // Print status code
  if ('statusCode' in meta && meta.statusCode) {
    parts.push(`Status: ${meta.statusCode}`);
  }

  // Print HTTP info and req.body
  if (meta.req && meta.res) {
    let http = `HTTP ${meta.req.method} ${meta.req.url} ${meta.res.statusCode} ${meta.res.responseTime}ms`;
    parts.push(http);

    // Print body (nicely formatted)
    if (meta.req.body && typeof meta.req.body === 'object' && Object.keys(meta.req.body).length > 0) {
      parts.push('Request Body:\n' + JSON.stringify(meta.req.body, null, 2));
    }
  }

  // Other fields (single line for small stuff)
  Object.entries(meta).forEach(([k, v]) => {
    if (
      ['errors', 'statusCode', 'req', 'res', 'stack', 'metadata'].includes(k) ||
      typeof v === 'object'
    ) return;
    parts.push(`${k}: ${v}`);
  });

  return parts.length ? '\n' + parts.join('\n') : '';
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
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});
