// src/types/express/index.d.ts

// Import UserMiddlewareType so we can use it in the augmentation
declare namespace Express {
  export interface Request {
    /**
     * Populated by authMiddleware; contains the authenticated user's info
     */
    user?: import('~/types').UserMiddlewareType;
  }
}
