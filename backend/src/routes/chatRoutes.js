import express from 'express';
import { chatWithAssistant, getChatCacheStats } from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/chat
// @desc    Interactive AI Chatbot with issue status lookup powered by NVIDIA NIM
// @access  Private
router.post('/', authenticateUser, chatWithAssistant);

// @route   GET /api/chat/stats
// @desc    Get cache metrics and hit/miss rates
// @access  Private
router.get('/stats', authenticateUser, getChatCacheStats);

export default router;
