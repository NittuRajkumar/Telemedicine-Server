import express from 'express';

import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getDoctors,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/doctors', protect, getDoctors);
router.post('/', protect, authorize('patient'), createAppointment);
router.get('/', protect, getAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.delete('/:id', protect, deleteAppointment);

export default router;
