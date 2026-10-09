import express from 'express';
import { getStaffMembers, getStaffIssues } from '../controllers/staffController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'staff'), getStaffMembers);
router.get('/:id/issues', authorizeRoles('admin', 'staff'), getStaffIssues);

export default router;
