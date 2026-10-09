import express from 'express';
import {
  getAdminDashboard,
  getStaffDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/admin', authorizeRoles('admin'), getAdminDashboard);
router.get('/staff', authorizeRoles('staff', 'admin'), getStaffDashboard);
router.get('/student', getStudentDashboard);

export default router;
