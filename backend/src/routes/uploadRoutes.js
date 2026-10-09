import express from 'express';
import { uploadImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { authenticateUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', upload.single('image'), uploadImage);
router.post('/multiple', upload.array('images', 5), uploadMultipleImages);

export default router;
