import { Router } from 'express';
import {
  getSlotsByLocation,
  createSlot,
  updateSlot,
  deleteSlot,
} from '../controllers/slotController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Slot query with dynamic availability check
router.get('/locations/:locationId/slots', getSlotsByLocation);

// Admin slot management
router.post('/locations/:locationId/slots', authMiddleware, adminMiddleware, createSlot);
router.put('/slots/:id', authMiddleware, adminMiddleware, updateSlot);
router.delete('/slots/:id', authMiddleware, adminMiddleware, deleteSlot);

export default router;
