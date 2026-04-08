import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient'
    },
    specialty: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    registeredIp: {
      type: String,
      default: ''
    },
    registeredUserAgent: {
      type: String,
      default: ''
    },
    lastLogin: {
      type: Date,
      default: null
    },
    lastLoginIp: {
      type: String,
      default: ''
    },
    lastLoginUserAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
