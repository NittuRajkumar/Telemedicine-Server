import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import net from 'node:net';

import app from './app.js';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MAX_PORT_RETRIES = 10;

const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: 'System Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Default admin account created');
};

const ensureDefaultDoctors = async () => {
  const defaultDoctorPassword = process.env.DEFAULT_DOCTOR_PASSWORD || 'Doctor@123';
  const hashedPassword = await bcrypt.hash(defaultDoctorPassword, 10);

  const demoDoctors = [
    {
      name: 'Dr. Priya Sharma',
      email: 'doctor1@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'General Medicine'
    },
    {
      name: 'Dr. Arjun Rao',
      email: 'doctor2@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Cardiology'
    },
    {
      name: 'Dr. Meera Nair',
      email: 'doctor3@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Dermatology'
    },
    {
      name: 'Dr. Vikram Iyer',
      email: 'doctor4@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Neurology'
    },
    {
      name: 'Dr. Ananya Gupta',
      email: 'doctor5@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Orthopedics'
    },
    {
      name: 'Dr. Rohan Kulkarni',
      email: 'doctor6@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Pulmonology'
    },
    {
      name: 'Dr. Kavya Menon',
      email: 'doctor7@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Endocrinology (Diabetes & Thyroid)'
    },
    {
      name: 'Dr. Suresh Patel',
      email: 'doctor8@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Gastroenterology'
    },
    {
      name: 'Dr. Neha Bhatia',
      email: 'doctor9@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'ENT'
    },
    {
      name: 'Dr. Amit Verma',
      email: 'doctor10@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Nephrology (Kidney)'
    },
    {
      name: 'Dr. Pooja Reddy',
      email: 'doctor11@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Psychiatry'
    },
    {
      name: 'Dr. Harish Narayan',
      email: 'doctor12@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Oncology (Cancer Care)'
    },
    {
      name: 'Dr. Sneha Joshi',
      email: 'doctor13@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Gynecology'
    },
    {
      name: 'Dr. Rahul Deshmukh',
      email: 'doctor14@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Pediatrics'
    },
    {
      name: 'Dr. Ishita Sen',
      email: 'doctor15@telemed.com',
      password: hashedPassword,
      role: 'doctor',
      specialty: 'Rheumatology'
    }
  ];

  const operations = demoDoctors.map((doctor) => ({
    updateOne: {
      filter: { email: doctor.email },
      update: { $setOnInsert: doctor },
      upsert: true
    }
  }));

  const result = await User.bulkWrite(operations, { ordered: false });
  const insertedCount = result.upsertedCount || 0;

  if (insertedCount > 0) {
    console.log(`Added ${insertedCount} default specialist doctor accounts`);
  }
};

const startServer = async () => {
  try {
    console.log('Starting server...');
    await connectDB();
    await ensureDefaultAdmin();
    await ensureDefaultDoctors();

    const basePort = Number(PORT) || 5000;

    const canUsePort = (port) =>
      new Promise((resolve) => {
        const probe = net
          .createServer()
          .once('error', () => resolve(false))
          .once('listening', () => {
            probe.close(() => resolve(true));
          })
          .listen(port);
      });

    const findAvailablePort = async (startPort, retriesLeft) => {
      for (let offset = 0; offset <= retriesLeft; offset += 1) {
        const port = startPort + offset;
        const available = await canUsePort(port);

        if (available) {
          return port;
        }

        if (offset < retriesLeft) {
          console.warn(`Port ${port} is in use. Trying port ${port + 1}...`);
        }
      }

      throw new Error(`No free port found in range ${startPort}-${startPort + retriesLeft}`);
    };

    const portToUse = await findAvailablePort(basePort, MAX_PORT_RETRIES);
    app.listen(portToUse, () => {
      console.log(`Server running on port ${portToUse}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
