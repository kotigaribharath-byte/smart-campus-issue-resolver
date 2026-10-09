import express from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  assignIssue,
  addComment,
  reopenIssue,
} from '../controllers/issueController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Base issue routes (authenticated)
router
  .route('/')
  .get(authenticateUser, getIssues)
  .post(authenticateUser, createIssue);

router
  .route('/:id')
  .get(authenticateUser, getIssueById)
  .put(authenticateUser, authorizeRoles('admin', 'staff'), updateIssue)
  .delete(authenticateUser, authorizeRoles('admin'), deleteIssue);

// Workflow specific routes
router.put('/:id/status', authenticateUser, authorizeRoles('admin', 'staff'), updateIssueStatus);
router.put('/:id/assign', authenticateUser, authorizeRoles('admin'), assignIssue);
router.post('/:id/comments', authenticateUser, addComment);
router.post('/:id/reopen', authenticateUser, reopenIssue);

export default router;
