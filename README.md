
# Patient Admission Management System

A full-stack web application that helps hospital staff manage admitted patients, maintain patient records, and track admission and discharge status.

## Live Demo

- **Frontend:** https://patient-admission-management-silk.vercel.app/
- **GitHub:** https://github.com/keerthan-777/patient-admission-management

## Technology Stack

### Frontend
- React.js
- CSS

### Backend
- Python
- FastAPI

### Database
- PostgreSQL

## Features

- Add new patient records
- View all registered patients
- Search patients by name
- Filter patients by ward, department, and doctor
- Edit existing patient details
- Delete patients with confirmation
- Mark patients as discharged
- Form validation on frontend and backend
- Responsive user interface

## Validation

- Patient name is required and accepts letters only.
- Age must be between 0 and 120.
- Gender, ward, department, and doctor are required.
- Admission date is required and cannot be a future date.
- Backend independently validates incoming requests.

## Project Structure

patient-admission-management/
├── frontend/
└── backend/

## Setup Instructions

### 1. Clone the repository

git clone https://github.com/keerthan-777/patient-admission-management.git

cd patient-admission-management

### 2. Frontend Setup

cd frontend

npm install

npm run dev

### 3. Backend Setup

Open another terminal:

cd backend

Create and activate a Python virtual environment.

Install dependencies:

pip install -r requirements.txt

Run the FastAPI server using the command configured in your backend.

### 4. Environment Variables

Configure the required database connection URL and frontend API base URL in your local environment.

Do not commit passwords, API keys, or other secrets.

## Screenshots

Add screenshots of:
1. Dashboard
2. Patient registration form
3. Patient list
4. Search and filters
5. Edit patient form

## Author

Keerthan S
