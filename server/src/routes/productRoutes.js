import express from "express";
import {
  addProduct,
  updateProductDiscounts,
  getProductsByIds,
  getAllProducts,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getDashboardStats,
  updateProductStatus,
} from "../controller/productController.js";
import {userProtect} from "../middleware/authMiddleware.js"
import { adminProtect } from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer();

const router = express.Router();

router.post(
  "/addProduct",
  adminProtect,
  upload.array("images", 5),
  addProduct
);

router.get("/getAllProducts", getAllProducts);
router.get("/getAllProduct", getAllProduct);
router.get("/product/:id", getProductById); 
router.put(
  "/updateProduct/:id",
  adminProtect,
  upload.array("images", 5),
  updateProduct
);
router.post('/update-product-discounts', adminProtect, updateProductDiscounts);
router.post('/products-by-ids', getProductsByIds);
router.delete("/deleteProduct/:id", adminProtect, deleteProduct);
router.patch("/updateProductStatus/:id", adminProtect, updateProductStatus);

router.get("/dashboard", adminProtect, getDashboardStats);

export default router;