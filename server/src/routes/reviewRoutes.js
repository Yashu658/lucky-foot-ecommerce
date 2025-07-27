import express from 'express';
import {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getAverageRating,
  checkIfUserReviewed,
  checkMultipleReviews,
   likeDislike,
   getallReviewbyadmin,
   reviewdeletebyAdmin,
   addAdminReply,
   removeAdminReply,
} from '../controller/reviewController.js';
import {userProtect} from "../middleware/authMiddleware.js"
import { adminProtect } from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer();

const router = express.Router();

router.post('/', userProtect,upload.array('images'), createReview);
router.get('/product/:productId', getProductReviews);
router.get('/average/:productId', getAverageRating);
router.get('/check-multiple', userProtect, checkMultipleReviews);
router.get('/check', userProtect, checkIfUserReviewed);
router.post('/:id/react', userProtect, likeDislike);
router.get('/admin/all', adminProtect,getallReviewbyadmin);
router.delete('/admin/:id', adminProtect,reviewdeletebyAdmin);
router.post('/:id/reply', adminProtect, addAdminReply);
router.delete('/:id/reply', adminProtect, removeAdminReply);

router.get('/:id', userProtect,getReviewById);
router.put('/:id', userProtect,upload.array('images'), updateReview);
router.delete('/:id', deleteReview);


export default router;