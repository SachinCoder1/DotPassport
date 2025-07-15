import swaggerJSDoc from 'swagger-jsdoc';
import { BASE_URL } from '~/config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Backend API',
      version: "1.0.0",
      description: 'Auto‑generated API docs',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local server' }
    ],
  },
  apis: ['src/routes/*.ts', 'src/models/*.ts'],  
  // ← looks for JSDoc comments in these files
};

export const swaggerSpec = swaggerJSDoc(options);
