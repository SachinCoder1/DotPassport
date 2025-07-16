// src/middleware/validateRequest.ts

import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';

interface Schemas {
  body?: ObjectSchema;
  query?: ObjectSchema;
  params?: ObjectSchema;
}

export const validateRequest =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const errs: string[] = [];

    // validation options: don't stop on first error, allow unknown other fields
    const opts = { abortEarly: false, allowUnknown: false };

    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, opts);
      if (error) errs.push(...error.details.map(d => d.message));
    }
    if (schemas.query) {
      const { error } = schemas.query.validate(req.query, opts);
      if (error) errs.push(...error.details.map(d => d.message));
    }
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, opts);
      if (error) errs.push(...error.details.map(d => d.message));
    }

    if (errs.length) {
      const msg = `Validation error: ${errs.join('; ')}`;
      logger.warn(msg);
      return next(new HttpError(400, msg));
    }

    return next();
  };
