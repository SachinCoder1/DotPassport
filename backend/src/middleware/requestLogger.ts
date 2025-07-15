import expressWinston from 'express-winston';
import { logger } from '~/utils/logger';

export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,                       // log metadata (req.headers, etc.)
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,             // disable its own formatting
  colorize: false,
});
