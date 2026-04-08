import express from 'express';

import { deleteRecord, getRecords, uploadRecord } from '../controllers/recordController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('patient'), upload.single('reportFile'), uploadRecord);
router.get('/', protect, authorize('patient', 'doctor', 'admin'), getRecords);
router.delete('/:id', protect, authorize('patient', 'admin'), deleteRecord);

export default router;
