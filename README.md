# Patient Admission Management

A responsive patient-admission dashboard built with React and Vite, a FastAPI
backend, and SQLAlchemy. The app supports patient creation, listing, search,
filters, editing, deletion, and discharge status.

## Tech stack

- Frontend: React, Vite, Axios
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite locally; PostgreSQL recommended for production

## Run locally

1. Start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

   The API is at `http://localhost:8000`; interactive API docs are at
   `http://localhost:8000/docs`. Without `DATABASE_URL`, local development uses
   `backend/patients.db`.

2. In a separate terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   The Vite app is at `http://localhost:5173`. To use a non-local API, set
   `VITE_API_URL` in the frontend's local `.env` file to the API base URL.

## Deploy

This layout uses Vercel for the static frontend, Render for FastAPI, and a
managed PostgreSQL database (for example, Neon). Create the database first and
keep its connection URL private.

### Backend (Render)

Create a **Web Service** from this repository:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `DATABASE_URL`: the PostgreSQL connection URL from your database provider
  - `CORS_ORIGINS`: your deployed frontend origin, e.g.
    `https://your-app.vercel.app` (no trailing slash)

The backend accepts standard `postgres://` and `postgresql://` URLs and uses the
PostgreSQL driver declared in `requirements.txt`. Keep the database URL in the
host's environment settings; never commit it.

### Frontend (Vercel)

Import the same repository as a Vercel project:

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable:
  - `VITE_API_URL`: the deployed backend origin, e.g.
    `https://your-api.onrender.com`

Set the backend's `CORS_ORIGINS` to the final Vercel URL, then redeploy the
backend if you changed its environment variables. Set both public URLs below
after deployment.

- Live app: _add the deployed frontend URL_
- Backend API: _add the deployed backend URL_

## Screenshots

Add screenshots of the dashboard and the add/edit patient form before
submission, for example under `docs/screenshots/`, and link them here.

## Before sharing the public repository

- Do not use real patient information in a public demo.
- Remove local virtual environments, caches, and the SQLite database from Git
  tracking. Adding a `.gitignore` does not untrack files that Git already
  tracks. The database and Python virtual environment were already tracked in
  this repository; untrack them before your next push, and check repository
  history for any real patient information before sharing.
- Never commit `.env` files, database URLs, passwords, or other credentials.
