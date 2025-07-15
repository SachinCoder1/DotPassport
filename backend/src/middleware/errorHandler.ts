// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '~/utils/logger';      // ← import your logger

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // use structured logging here
  logger.error('Unhandled error caught by middleware', {
    message: err.message,
    statusCode: err.statusCode ?? 500,
    stack: err.stack,
  });

  const status = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';
  res.status(status).json({ message });
};
