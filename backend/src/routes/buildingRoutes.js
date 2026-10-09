import express from 'express';
import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '../controllers/buildingController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBuildings);
router.post('/', authenticateUser, authorizeRoles('admin'), createBuilding);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateBuilding);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteBuilding);

export default router;
