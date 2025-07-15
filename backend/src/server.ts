import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
dotenv.config();

import CONNECT_MONGO_DB from "~/db";
import { ENV, PORT } from "~/constant";
import { CLIENT_URL, DEFAULT_API_URL } from "~/config";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from '~/middleware/requestLogger';
import { logger } from '~/utils/logger';
import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from '~/utils/swagger';
import userRoutes from '~/routes/userRoutes';


const app = express();
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, { explorer: true })
);

app.use(requestLogger);


app.set("trust proxy", 1);
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_URL],
  })
);

app.use('/api/users', userRoutes);

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.get('/health', (_req, res) => res.send('OK'));


app.use(errorHandler);


CONNECT_MONGO_DB();
 
app.listen(PORT, () =>{
  logger.info(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
