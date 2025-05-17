import express from "express";
import {
  userRegister,
  userLogin,
  userLogout,
  userUpdate,
  userDelete,
} from "../controller/authController.js";
import {userProtect} from "../middleware/authMiddleware.js"
import multer from "multer";



const router = express.Router();

const upload = multer();


router.post("/register", userRegister);

router.post("/login", userLogin);

router.get("/logout", userLogout);

router.put("/update",userProtect,upload.single('profilePic'), userUpdate);

router.delete("/delete",userProtect, userDelete);

export default router;