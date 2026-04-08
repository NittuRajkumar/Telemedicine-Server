import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const getAssignedPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id }).populate('patient', 'name email phone');

    const uniquePatientsMap = new Map();
    appointments.forEach((appointment) => {
      if (appointment.patient) {
        uniquePatientsMap.set(String(appointment.patient._id), appointment.patient);
      }
    });

    const patients = Array.from(uniquePatientsMap.values());

    return res.json({ patients });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch assigned patients', error: error.message });
  }
};

export const getAllPatientsForDoctor = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('_id name email phone');
    return res.json({ patients });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch patients', error: error.message });
  }
};
