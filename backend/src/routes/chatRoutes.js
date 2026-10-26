import express from 'express';
import { chatWithAssistant } from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/chat
// @desc    Interactive AI Chatbot with issue status lookup powered by NVIDIA NIM
// @access  Private
router.post('/', authenticateUser, chatWithAssistant);

export default router;
