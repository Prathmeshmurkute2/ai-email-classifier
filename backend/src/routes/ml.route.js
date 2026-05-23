import express from "express";
import { trainModel } from "../controllers/ml.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/train", protect, trainModel);

export default router;
