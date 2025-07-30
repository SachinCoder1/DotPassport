import { Router } from 'express';
import { getLoggedInUser } from '~/controller/authController';
import { createUser, getUsers } from '~/controller/userController';
import { authMiddleware } from '~/middleware/auth';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);


// get logged in user

router.get('/me', authMiddleware, getLoggedInUser);

export default router;
