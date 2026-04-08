import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

export const uploadRecord = async (req, res) => {
  try {
    const { title, notes, diseaseName, facedOn } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Record title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File upload is required' });
    }

    const parsedFacedOn = facedOn ? new Date(facedOn) : null;
    if (facedOn && Number.isNaN(parsedFacedOn.getTime())) {
      return res.status(400).json({ message: 'Invalid faced date' });
    }

    const record = await MedicalRecord.create({
      patient: req.user._id,
      uploadedBy: req.user._id,
      title,
      diseaseName: diseaseName || '',
      facedOn: parsedFacedOn,
      notes: notes || '',
      filePath: `/uploads/${req.file.filename}`
    });

    return res.status(201).json({ message: 'Medical report uploaded', record });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to upload record', error: error.message });
  }
};

export const getRecords = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }

    if (req.user.role === 'doctor') {
      const appointments = await Appointment.find({ doctor: req.user._id }).select('patient');
      const assignedPatientIds = appointments
        .map((appointment) => appointment.patient?.toString())
        .filter(Boolean);

      const patientId = req.query.patientId;
      if (patientId) {
        if (!assignedPatientIds.includes(patientId)) {
          return res.status(403).json({ message: 'Not allowed to view this patient records' });
        }
        query.patient = patientId;
      } else {
        query.patient = { $in: assignedPatientIds };
      }
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email')
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    return res.json({ records });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch records', error: error.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    const isOwnerPatient =
      req.user.role === 'patient' && record.patient.toString() === req.user._id.toString();

    if (!isOwnerPatient && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this report' });
    }

    const absoluteFilePath = path.resolve(projectRoot, `.${record.filePath}`);
    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    await record.deleteOne();

    return res.json({ message: 'Medical report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
};
