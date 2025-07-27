import express from "express";
import { searchProducts,SearchBox } from "../controller/publicContoller.js";


const router = express.Router();

router.get("/search", searchProducts);

router.get("/searchBox", SearchBox);
export default router;