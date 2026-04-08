# Telemedicine Platform

A full-stack telemedicine and health record project built with React, Node.js, Express, and MongoDB.

The app supports three roles:

1. Patient
2. Doctor
3. Admin

Patients can book appointments, upload old health records, and view prescriptions. Doctors can review patient data and issue prescriptions. Admins can manage users and monitor platform stats.

## Highlights

1. JWT authentication with role-based route protection
2. Appointment booking and status management
3. Prescription workflow (doctor to patient)
4. Medical record upload with file storage
5. Disease history fields in records (condition and faced date)
6. Modern animated dashboard UI with tags, cards, and health guidance
7. Auto-seeding of admin and multiple specialist doctors on server start

## Tech Stack

### Frontend

1. React 18 + Vite
2. Tailwind CSS
3. React Router
4. Axios

### Backend

1. Node.js + Express
2. MongoDB + Mongoose
3. JWT + bcryptjs
4. Multer for file uploads

## Folder Structure

```text
Telemedicine/
   client/
      src/
         components/
         context/
         pages/
            admin/
            doctor/
            patient/
         services/
   server/
      src/
         config/
         controllers/
         middleware/
         models/
         routes/
   uploads/
   README.md
```

## Quick Start

### Prerequisites

1. Node.js 18+
2. MongoDB (local or Atlas)

### Backend Setup

1. Open terminal and move to server:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
copy .env.example .env
```

4. Configure `.env` values:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=replace_with_secure_secret
CLIENT_URL=http://localhost:5173
DEFAULT_ADMIN_EMAIL=admin@telemed.com
DEFAULT_ADMIN_PASSWORD=Admin@123
DEFAULT_DOCTOR_PASSWORD=Doctor@123
```

5. Start backend:

```bash
npm run dev
```

### Frontend Setup

1. Open another terminal and move to client:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend API base URL currently used by frontend:

```text
http://localhost:5000/api
```

## How Roles Work

### Patient

1. Register and login
2. Book appointment with available doctors
3. Upload old health records (files + disease details)
4. View prescriptions and medical reports
5. See health tips, rules, and first-aid guidance in dashboard

### Doctor

1. View patient appointments
2. Update appointment status
3. Add prescriptions
4. Review patient old health history and uploaded reports

### Admin

1. View dashboard stats
2. Manage users and role updates

## Auto-Seeded Accounts

On server start:

1. Admin is auto-created if `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` are set and not already present.
2. Specialist doctors are auto-added using upsert by email (no duplicates).

Default seeded doctor specialties include:

1. General Medicine
2. Cardiology
3. Dermatology
4. Neurology
5. Orthopedics
6. Pulmonology
7. Endocrinology (Diabetes and Thyroid)
8. Gastroenterology
9. ENT
10. Nephrology
11. Psychiatry
12. Oncology
13. Gynecology
14. Pediatrics
15. Rheumatology

## API Summary

Base:

```text
/api
```

### Auth

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /auth/profile`

### Appointments

1. `GET /appointments/doctors`
2. `POST /appointments`
3. `GET /appointments`
4. `PATCH /appointments/:id/status`
5. `DELETE /appointments/:id`

### Records

1. `POST /records` (multipart form-data)
2. `GET /records`
3. `DELETE /records/:id`

### Prescriptions

1. `POST /prescriptions`
2. `GET /prescriptions`

### Doctor

1. `GET /doctor/patients`
2. `GET /doctor/all-patients`

### Admin

1. `GET /admin/users`
2. `PATCH /admin/users/:id/role`
3. `GET /admin/stats`

## Common Issues and Fixes

### 1) Wrong npm command

Use:

```bash
npm run dev
```

Do not use:

```bash
npm rn dev
```

### 2) Port already in use (`EADDRINUSE`)

The server has fallback logic and will try the next free port (5001, 5002, etc).

If backend is not on 5000, update frontend base URL in `client/src/services/api.js` to match the running backend port.

### 3) Duplicate email key error for admin

This means that admin email already exists in database. Keep the same `DEFAULT_ADMIN_EMAIL` value or remove duplicate user manually.

### 4) Uploaded files are not opening

Check:

1. Backend is running
2. `uploads` folder exists
3. File URL points to backend host and port

## Security Notes

1. Passwords are stored as bcrypt hashes.
2. JWT token is used for authorized API requests.
3. Do not commit real secrets in `.env`.

## Future Improvements

1. Add pagination and filtering in dashboards
2. Add automated tests
3. Add Docker setup for one-command local run
4. Add notifications (email/SMS)
5. Move API URL to environment config on frontend
