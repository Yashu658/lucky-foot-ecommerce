import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controller/wishlistController.js";
import { userProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", userProtect, getWishlist);
router.post("/add/:productId", userProtect, addToWishlist);
router.delete("/remove/:productId", userProtect, removeFromWishlist);

export default router;