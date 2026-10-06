import { Router } from 'express';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Public routes
router.get('/', getAllLocations);
router.get('/:id', getLocationById);

// Admin-only routes
router.post('/', authMiddleware, adminMiddleware, createLocation);
router.put('/:id', authMiddleware, adminMiddleware, updateLocation);
router.delete('/:id', authMiddleware, adminMiddleware, deleteLocation);

export default router;
