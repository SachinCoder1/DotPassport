// src/middleware/validateResource.ts

import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";

/**
 * Middleware to validate request data against a Zod schema.
 * Throws a 400 HttpError with detailed messages if validation fails.
 * @param schema - Zod schema capable of parsing { body, params, query }
 */
export const validateResource =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      return next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        // ZodError contains 'issues' array with detailed error info
        const details = err.issues.map((issue) => {
          const path = issue.path.join(".") || "input";
          return `${path}: ${issue.message}`;
        });
        logger.warn("Validation error", { errors: details });
        return next(new HttpError(400, "Validation error"));
      }
      logger.error("Unknown validation error", { error: err });
      return next(new HttpError(400, "Validation error"));
    }
  };
