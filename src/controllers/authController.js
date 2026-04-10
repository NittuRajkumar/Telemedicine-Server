import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const VALID_ROLES = ['patient', 'doctor', 'admin'];

const normalizeRole = (role) => (VALID_ROLES.includes(role) ? role : 'patient');

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(String(value || ''));

const verifyPassword = async (plainPassword, user) => {
  const storedPassword = String(user?.password || '');

  if (!storedPassword) {
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  // Backward-compatible fallback for legacy plaintext passwords in older DB records.
  const matchesLegacyPlaintext = plainPassword === storedPassword;

  if (matchesLegacyPlaintext) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    try {
      await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
    } catch (migrationError) {
      console.warn('Password migration skipped for user:', user._id, migrationError.message);
    }
  }

  return matchesLegacyPlaintext;
};

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
      const isSameUserPassword = await verifyPassword(password, existingUser);

      if (!isSameUserPassword) {
        return res.status(409).json({ message: 'Email already registered. Please login instead.' });
      }

      const existingUserRole = normalizeRole(existingUser.role);

      return res.status(200).json({
        message: 'Email already registered. Logged in successfully.',
        token: generateToken(existingUser._id, existingUserRole),
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUserRole,
          specialty: existingUser.specialty,
          phone: existingUser.phone,
          registeredAt: existingUser.registeredAt
        }
      });
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
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already registered. Please login instead.' });
    }

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

    const isMatch = await verifyPassword(password, user);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const safeRole = normalizeRole(user.role);

    try {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            role: safeRole,
            lastLogin: new Date(),
            lastLoginIp: loginIp,
            lastLoginUserAgent: loginUserAgent
          }
        }
      );
    } catch (updateError) {
      console.warn('Login metadata update skipped for user:', user._id, updateError.message);
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(user._id, safeRole),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: safeRole,
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
