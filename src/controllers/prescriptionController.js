import Prescription from '../models/Prescription.js';
import User from '../models/User.js';

export const createPrescription = async (req, res) => {
  try {
    const { patientId, medication, dosage, instructions } = req.body;

    if (!patientId || !medication || !dosage || !instructions) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      medication,
      dosage,
      instructions
    });

    return res.status(201).json({ message: 'Prescription created', prescription });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create prescription', error: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }

    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialty')
      .sort({ createdAt: -1 });

    return res.json({ prescriptions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
};
