// src/middleware/adminAuth.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '~/errors/HttpError';
import { logger } from '~/utils/logger';
import { User } from '~/models/User';
import { Admin } from '~/models/Admin';

/**
 * Middleware to verify that the authenticated user is an admin.
 * Checks the Admin collection for either userId or address match.
 * MUST be used AFTER authMiddleware.
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn('requireAdmin called but no user in request');
    return next(new HttpError(401, 'Unauthorized'));
  }

  try {
    // Get user's addresses from User collection
    const user = await User.findById(userId).select('addresses').lean();

    if (!user) {
      logger.warn('requireAdmin: user not found', { userId });
      return next(new HttpError(401, 'Unauthorized'));
    }

    // Check Admin collection for match by userId OR any of user's addresses
    const admin = await Admin.findOne({
      $or: [
        { userId: userId },
        { address: { $in: user.addresses } }
      ],
      isActive: true,  // Only active admins
    }).lean();

    if (!admin) {
      logger.warn('requireAdmin: user is not admin', {
        userId,
        addresses: user.addresses
      });
      return next(new HttpError(403, 'Forbidden: Admin access required'));
    }

    // User is admin, proceed
    logger.debug('Admin access granted', {
      userId,
      adminId: admin._id,
      matchType: admin.userId ? 'userId' : 'address'
    });
    next();
  } catch (err: any) {
    logger.error('Error in requireAdmin middleware', { error: err, userId });
    return next(new HttpError(500, 'Internal server error'));
  }
}
