import { Router } from "express";
import { challengeSchema, polkadotLoginSchema } from "~/schemas/auth.schema";
import {
  requestChallenge,
  polkadotLogin,
  refreshToken,
  logout,
  polkadotLoginTest,
} from "~/controller/authController";
import { validateRequest } from "~/middleware/validateResource";

const router = Router(); 

// 1. Get a fresh challenge
router.post(
  "/challenge",
  validateRequest({ body: challengeSchema }),
  requestChallenge
);

// 2. Sign & verify
router.post(
  "/polkadot",
  validateRequest({ body: polkadotLoginSchema }),
  polkadotLogin
);

router.post(
  "/polkadot/test",
  polkadotLoginTest
);

// 3. Refresh & logout
// Note: These routes are not protected, as they are used to refresh tokens or log out
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
