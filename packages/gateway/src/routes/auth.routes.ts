/**
 * Auth route table — HTTP paths mapped to controller handlers.
 *
 * Mounted by `index.ts` under `/auth`:
 *
 *   GET  /auth/google            initiate Google OAuth (PKCE + state + nonce)
 *   GET  /auth/google/callback   validate callback, login-only, set session
 *   GET  /auth/me                validated session -> safe user profile
 *   GET  /auth/providers         provider availability for the sign-in UI
 *   POST /auth/logout            revoke session, clear cookie
 */

import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import {
  requireSession,
  requireSiteOrigin,
} from "../middleware/auth.middleware.ts";

const router: Router = Router();

router.get("/google", authController.startGoogle);
router.get("/google/callback", authController.googleCallback);
router.get("/me", requireSession, authController.me);
router.get("/providers", authController.providers);
router.post("/logout", requireSiteOrigin, authController.logout);

export default router;
