import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, reason } = req.body;

    if (!doctorId || !date || !reason) {
      return res.status(400).json({ message: 'doctorId, date and reason are required' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      reason
    });

    return res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }

    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialty')
      .sort({ date: 1 });

    return res.json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwnerPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user._id.toString();
    const isOwnerDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString();

    if (!isOwnerPatient && !isOwnerDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    return res.json({ message: 'Appointment updated', appointment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwnerPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user._id.toString();
    const isOwnerDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString();

    if (!isOwnerPatient && !isOwnerDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this appointment' });
    }

    await appointment.deleteOne();

    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('_id name email specialty');
    return res.json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
};
