import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, specialty, phone } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const registeredIp = String(req.ip || '');
    const registeredUserAgent = String(req.headers['user-agent'] || '');

    const normalizedRole = role || 'patient';

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!['patient', 'doctor'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      specialty: normalizedRole === 'doctor' ? specialty || '' : '',
      phone: phone || '',
      registeredAt: new Date(),
      registeredIp,
      registeredUserAgent
    });

    return res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        phone: user.phone,
        registeredAt: user.registeredAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const loginIp = String(req.ip || '');
    const loginUserAgent = String(req.headers['user-agent'] || '');

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    user.lastLoginIp = loginIp;
    user.lastLoginUserAgent = loginUserAgent;
    await user.save();

    return res.json({
      message: 'Login successful',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  return res.json({ user: req.user });
};
