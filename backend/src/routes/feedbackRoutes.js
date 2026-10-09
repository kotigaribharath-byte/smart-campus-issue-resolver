import express from 'express';
import { submitFeedback, getFeedback } from '../controllers/feedbackController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateUser, submitFeedback);
router.get('/', authenticateUser, authorizeRoles('admin', 'staff'), getFeedback);

export default router;
