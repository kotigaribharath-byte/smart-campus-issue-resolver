import express from 'express';
import {
  register,
  login,
  sendLoginCode,
  verifyLoginCode,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);
router.post('/send-login-code', sendLoginCode);
router.post('/verify-login-code', verifyLoginCode);
router.get('/me', authenticateUser, getMe);
router.put('/update-profile', authenticateUser, updateProfile);
router.put('/change-password', authenticateUser, changePassword);

export default router;
