import express from "express";
import { trackProductView, getRecentViews } from "../controller/recentViewController.js";
import { userProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/track/:productId", userProtect, trackProductView);
router.get("/", userProtect, getRecentViews);

export default router;