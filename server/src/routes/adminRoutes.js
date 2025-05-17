import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controller/adminController.js";
import { adminProtect } from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer();

const router = express.Router();

//product  Management routes
router.post("/addProduct", adminProtect, upload.array("images", 5), addProduct);
router.get("/getAllProducts", adminProtect, getAllProducts);
router.get("/getProductById/:id", adminProtect, getProductById);
router.put( "/updateProduct/:id",adminProtect,upload.array("Productimages", 5),updateProduct);
router.delete("/deleteProduct/:id", adminProtect, deleteProduct);

export default router;
