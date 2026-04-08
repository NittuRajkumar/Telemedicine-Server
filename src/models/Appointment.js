import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
	{
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		doctor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		date: {
			type: Date,
			required: true
		},
		reason: {
			type: String,
			required: true,
			trim: true
		},
		status: {
			type: String,
			enum: ['scheduled', 'completed', 'cancelled'],
			default: 'scheduled'
		}
	},
	{ timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
