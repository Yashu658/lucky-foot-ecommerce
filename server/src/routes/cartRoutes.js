import express from "express"
import {addCart ,getCart, removeProductFromCart,removed} from "../controller/cartController.js"
import { userProtect  } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/addCart",userProtect, addCart);

router.get("/getCart", userProtect ,getCart);

router.post('/remove',userProtect,removed  );

router.delete("/:productId",userProtect, removeProductFromCart);




export default router;