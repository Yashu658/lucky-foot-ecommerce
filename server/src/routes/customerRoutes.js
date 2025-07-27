import express from "express";
import {
  getAllUsers,
  createByAdmin,
  updateByAdmin,
  updateStatusByAdmin,
   getCustomerDetails, 
  updateCustomerStatus
} from "../controller/customerController.js";
import { adminProtect } from "../middleware/authMiddleware.js";
import multer from "multer";


//getAllCustomers,
const router = express.Router();

const upload = multer();
// router.get("/", adminProtect, getAllCustomers);

router.get("/getAllUsers", adminProtect, getAllUsers);

router.post("/createByAdmin",adminProtect, createByAdmin);

router.put("/updateByAdmin/:id", adminProtect,updateByAdmin);
router.put("/updateStatusByAdmin/:id", adminProtect, updateStatusByAdmin);


router.get("/:customerId", adminProtect, getCustomerDetails);
router.patch("/:customerId/status", adminProtect, updateCustomerStatus);
export default router;