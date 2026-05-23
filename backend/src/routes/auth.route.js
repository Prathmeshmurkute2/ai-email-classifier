import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getGoogleAuthUrl,
  googleCallback,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/google/url", getGoogleAuthUrl);
router.get("/google/callback", googleCallback);

export default router;
