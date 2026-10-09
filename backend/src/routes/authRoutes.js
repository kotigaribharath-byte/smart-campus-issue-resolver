import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateUser, getMe);
router.put('/update-profile', authenticateUser, updateProfile);
router.put('/change-password', authenticateUser, changePassword);

export default router;
