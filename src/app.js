import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import recordRoutes from './routes/recordRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const app = express();

const allowedOrigins = [
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : []),
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  'http://localhost:5173'
]
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultAllowedOriginPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/.*\.vercel\.app$/
];

const isOriginAllowed = (origin) => {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return defaultAllowedOriginPatterns.some((pattern) => pattern.test(origin));
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin and non-browser requests without an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ message: 'API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
