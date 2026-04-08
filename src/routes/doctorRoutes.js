import express from 'express';

import { getAllPatientsForDoctor, getAssignedPatients } from '../controllers/doctorController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/patients', protect, authorize('doctor'), getAssignedPatients);
router.get('/all-patients', protect, authorize('doctor'), getAllPatientsForDoctor);

export default router;
