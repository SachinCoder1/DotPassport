import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUI from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import compression from "compression";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { CLIENT_URL, DEFAULT_API_URL, ENV, SANDBOX_URL } from "~/config";
import { requestLogger } from "~/middleware/requestLogger";
import { errorHandler } from "~/middleware/errorHandler";
import userRoutes from "~/routes/userRoutes";
import authRoutes from "~/routes/authRoutes";
import scoreRoutes from "~/routes/scoreRoutes";
import badgeRoutes from "~/routes/badgeRoutes";
import adminApiKeyRoutes from "~/developer/routes/adminRoutes";
import developerRoutes from "~/developer/routes/developerRoutes";
import sandboxRoutes from "~/developer/routes/sandboxRoutes";
import { logApiRequest } from "~/developer/middleware/requestLogger";
import { OpenAPIV3 } from "openapi-types";
import { ENV_TYPE } from "./types/enum";

export function createApp() {
  const app = express();

  // --- Disable ETag for API routes to prevent 304 responses
  app.set('etag', false);

  // --- Third‑party middleware
  app.use(compression());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  // --- Disable caching for API routes
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  // Apply global CORS to all routes EXCEPT /api/v2 (which has its own CORS middleware)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/v2')) {
      return next(); // Skip global CORS for /api/v2
    }
    cors({ origin: [CLIENT_URL, SANDBOX_URL] })(req, res, next);
  });

  // --- Rate limiting for v1 API only (v2 has its own per-key limits)
  app.use(
    "/api/v1",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 350, // limit each IP to 350 requests per window
    })
  );

  // --- Logging
  app.use(requestLogger);

  // --- Swagger UI
  const specPath = path.join(__dirname, "../docs/openapi.yaml");
  const fileContents = fs.readFileSync(specPath, "utf8");
  const swaggerDocument = yaml.load(fileContents) as OpenAPIV3.Document;

  // serve Swagger UI
  app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerDocument, { explorer: true })
  );

  // --- v1 API routes (existing)
  app.use(`${DEFAULT_API_URL}/auth`, authRoutes);
  app.use(`${DEFAULT_API_URL}/user`, userRoutes);
  app.use(`${DEFAULT_API_URL}/score`, scoreRoutes);
  app.use(`${DEFAULT_API_URL}/badge`, badgeRoutes);

  // --- Admin routes for API key management (JWT-protected)
  app.use(`${DEFAULT_API_URL}/admin/api-keys`, adminApiKeyRoutes);

  // --- Sandbox routes for developer testing (public + JWT-protected)
  app.use(`${DEFAULT_API_URL}/sandbox`, sandboxRoutes);

  // --- Add request logging for sandbox users (MUST be before routes)
  app.use("/api/v2", logApiRequest);

  // --- v2 Developer API routes (API key-protected)
  app.use("/api/v2", developerRoutes);

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
