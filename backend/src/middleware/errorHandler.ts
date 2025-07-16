// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "~/utils/logger"; // ← import your logger

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // use structured logging here
  logger.error(err.message, {
    stack: err.stack,
    statusCode: err.status || 500,

    req: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      cookies: req.cookies || null,
      user: req?.user ? req.user : null,
    },
    res: {
      statusCode: res.statusCode,
      responseTime: res.getHeader("X-Response-Time") || 0,
      body: res.locals.body || null, // if you set response body in middleware
    },
  });

  const status = err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";
  res.status(status).json({ message });
};
