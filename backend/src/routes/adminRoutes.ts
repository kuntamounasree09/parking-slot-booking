import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueReports,
  getAllUsers,
  deleteUser,
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// All admin routes protected with both authMiddleware and adminMiddleware
router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReports);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;
