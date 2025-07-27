import express from "express";
import mongoose from "mongoose";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
  getOrderById,
  getOrderByIdAdmin,
  returnProduct,
    getAllReturns,         
  updateReturnStatus ,
  getMyReturns,
   requestReplacement,
   getAllReplacements,
   updateReplacementStatus,
    getTransactions,
     getTransactionDetails,
     getAllTransactions,
     getFilteredTransactions,
   getOrderStatusForProduct,
} from "../controller/orderController.js";
import {userProtect} from "../middleware/authMiddleware.js"
import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User 

router.post("/", userProtect, placeOrder);
router.get("/user", userProtect, getMyOrders);
router.get("/user/returns", userProtect, getMyReturns);
router.get("/status", userProtect, getOrderStatusForProduct);
router.get("/user/order/:id", userProtect, getOrderById); 
router.patch("/user/cancel/:id", userProtect, cancelMyOrder);

router.post("/user/order/:id/return",userProtect,returnProduct);

// Admin 
router.get("/admin",  userProtect, adminProtect, getAllOrders);

router.get("/admin/getAllReturns", userProtect,  adminProtect, getAllReturns);
router.put("/admin/updateReturnStatus/:returnId", userProtect,  adminProtect, updateReturnStatus);
router.get("/admin/order/:id", userProtect, adminProtect, getOrderByIdAdmin);



router.post("/user/order/:id/replacement", userProtect, requestReplacement);
router.get("/admin/getAllReplacements", userProtect, adminProtect, getAllReplacements);
router.put("/admin/updateReplacementStatus/:replacementId", userProtect, adminProtect, updateReplacementStatus);
// Get all transactions with filters
router.get("/admin/getTransactions", adminProtect,  getTransactions);
router.get("/admin/getAllTransactions", adminProtect, getAllTransactions);
router.get("/admin/getFilteredTransactions", adminProtect,getFilteredTransactions);
// Get transaction details
router.get("/admin/getTransactionDetails/:id",  adminProtect, getTransactionDetails);


router.patch("/:id",  userProtect, adminProtect, updateOrderStatus);

export default router;
