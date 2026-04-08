import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.json({ message: 'User role updated', user: { id: user._id, role: user.role } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPatients, totalDoctors, totalAppointments, totalRecords, totalPrescriptions] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'patient' }),
        User.countDocuments({ role: 'doctor' }),
        Appointment.countDocuments(),
        MedicalRecord.countDocuments(),
        Prescription.countDocuments()
      ]);

    return res.json({
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRecords,
        totalPrescriptions
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
