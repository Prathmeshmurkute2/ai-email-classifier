import express from "express";
import {
  syncEmails,
  getEmails,
  relabelEmail,
  getDashboardStats,
} from "../controllers/email.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/sync", protect, syncEmails);
router.get("/", protect, getEmails);
router.put("/:id/label", protect, relabelEmail);
router.get("/stats", protect, getDashboardStats);

export default router;
