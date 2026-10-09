import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDepartments); // Public or authenticated
router.post('/', authenticateUser, authorizeRoles('admin'), createDepartment);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteDepartment);

export default router;
