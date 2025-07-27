import express from 'express';
import { 
  createOffer,
  getAllOffers,
  getActiveOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus
} from '../controller/offerController.js';
import { adminProtect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer();

const router = express.Router();

router.route('/offers')
  .post(adminProtect, upload.single('image'), createOffer)
  .get(getAllOffers);
router.get('/active', getActiveOffers)
router.route('/:id')
  .get(getOfferById)
  .put(adminProtect, upload.single('image'), updateOffer)
  .delete(adminProtect, deleteOffer);

router.route('/:id/status')
  .patch(adminProtect, toggleOfferStatus);

export default router;