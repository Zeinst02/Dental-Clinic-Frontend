# Dental Clinic Appointment System — Frontend 🦷

A modern React and TypeScript frontend for a Dental Clinic Appointment Management System.

This application provides separate interfaces for Patients, Doctors, and Admins, with role-based access to appointments, profiles, doctor availability, and user management.

## ✨ Features

### 🔐 Authentication
- Secure login using JWT authentication
- Role-based access control
- Separate experiences for Admin, Doctor, and Patient
- Persistent login using browser local storage
- User-friendly login error messages

### 👨‍⚕️ Doctor Features
- Doctor dashboard
- Doctor profile
- Display doctor specialty
- Manage doctor availability
- View and manage appointments

### 🧑‍💼 Patient Features
- Patient dashboard
- Patient profile
- View available doctors
- Book appointments
- Check appointment availability
- View upcoming appointments
- Cancel appointments

### 🛠️ Admin Features
- Admin dashboard
- Manage users
- View appointments
- Manage doctors and patients

### 📅 Appointment Management
- Select a doctor
- Select appointment date and time
- Check availability before booking
- 30-minute appointment duration
- Appointment status tracking
- Appointment cancellation
- Appointment completion

## 🛠️ Technologies

- React
- TypeScript
- Vite
- CSS
- REST API
- JWT Authentication
- Git
- GitHub

## 🔗 Backend API

This frontend communicates with the ASP.NET Core Web API backend.

Backend repository:

https://github.com/Zeinst02/Dental-Clinic-Appointment-System

API base URL:

```text
https://localhost:7231/api


📁 Project Structure
clinic-frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts


🚀 Getting Started
1. Clone the repository
git clone https://github.com/Zeinst02/Dental-Clinic-Frontend.git
2. Navigate to the project
cd Dental-Clinic-Frontend
3. Install dependencies
npm install
4. Start the development server
npm run dev

The application will normally be available at:

http://localhost:5173
⚠️ Backend Requirement

The ASP.NET Core backend must be running for authentication, appointments, doctors, patients, and other API-based features to work correctly.

👤 User Roles
Role	Access
Admin	User and appointment management
Doctor	Profile, availability, and appointments
Patient	Doctors, booking, and appointments
📌 Project Status

The frontend is currently under active development and is connected to the Dental Clinic Appointment System backend.

Built with React, TypeScript, and ASP.NET Core.