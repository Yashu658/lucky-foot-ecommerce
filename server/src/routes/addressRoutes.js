import express from "express";
import { addAddress, getAddresses,updateAddress, deleteAddress } from "../controller/addressController.js";
import {userProtect} from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/add", userProtect, addAddress);
router.get("/", userProtect, getAddresses);
router.delete("/:id", userProtect, deleteAddress);
router.put("/:id", userProtect, updateAddress);
export default router;
