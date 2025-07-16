import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUI from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";

import { CLIENT_URL, DEFAULT_API_URL } from "~/config";
import { requestLogger } from "~/middleware/requestLogger";
import { errorHandler } from "~/middleware/errorHandler";
import { swaggerSpec } from "~/utils/swagger";
import userRoutes from "~/routes/userRoutes";
import authRoutes from "~/routes/authRoutes";

export function createApp() {
  const app = express();

  // --- Third‑party middleware
  app.use(compression());

  app.use(express.json());
  app.use(helmet());
  app.use(cors({ origin: [CLIENT_URL] }));

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per window
    })
  );

  // --- Logging
  app.use(requestLogger);

  // --- Swagger UI
  app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, { explorer: true })
  );

  // --- API routes
  app.use(`${DEFAULT_API_URL}/user`, userRoutes);
  app.use(`${DEFAULT_API_URL}/auth`, authRoutes);

  // --- Health & root
  app.get("/", (_req, res) => res.send("Hello World!"));
  app.get("/health", (_req, res) => res.send("OK"));

  // --- 404 handler
  app.use((_req, _res, next) => {
    const err = new Error("Not Found");
    // @ts-ignore
    err.statusCode = 404;
    next(err);
  });

  // --- Centralized error handler
  app.use(errorHandler);

  return app;
}
