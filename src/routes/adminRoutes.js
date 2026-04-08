import express from 'express';

import { getDashboardStats, getUsers, updateUserRole } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.get('/stats', protect, authorize('admin'), getDashboardStats);

export default router;
