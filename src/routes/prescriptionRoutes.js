import express from 'express';

import { createPrescription, getPrescriptions } from '../controllers/prescriptionController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/', protect, authorize('patient', 'doctor', 'admin'), getPrescriptions);

export default router;
