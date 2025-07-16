import { Router } from "express";
import {
  logout,
  polkadotLogin,
  refreshToken,
} from "~/controller/authController";
import { authMiddleware } from "~/middleware/auth";
import { validateResource } from "~/middleware/validateResource";
import { polkadotLoginSchema } from "~/schemas/auth.schema";

const router = Router();

router.post("/polkadot", validateResource(polkadotLoginSchema), polkadotLogin);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);

export default router;
