# PrayogShala

PrayogShala is a learner-centered full-stack platform for project-based coding education. It combines a modern React frontend with a secure Node.js/Express backend, delivering real-time code execution, practice projects, assessments, and AI-powered learning support.

## Key Features

- Interactive code workspace with Monaco editor integration.
- Real-time problem-solving workflows and submission handling.
- Project and module-based learning navigation.
- Authentication and role-based backend API.
- Dynamic assessment panels including viva and submission review.
- Secure Express/MongoDB backend with token-based auth and validation.

## Architecture

- `src/` — React application, UI components, pages, hooks, and frontend services.
- `backend/` — Express API server, controllers, models, services, and database integration.
- `package.json` — Frontend app scripts and dependencies.
- `backend/package.json` — Backend server scripts and dependencies.

## Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create environment configuration files:
   - `backend/.env`
   - `.env` (if needed for frontend settings)

4. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

5. Start the frontend app:
   ```bash
   npm run dev
   ```

## Usage

- Use the app to browse modules, open projects, and work through guided coding challenges.
- The submission flow sends code to the backend for execution and evaluation.
- The viva and assessment panels support structured review and feedback.

## Notes

- Environment-specific secrets are intentionally kept out of source control.
- The project is designed to support real-time data updates across the UI and backend.

## License

This repository is provided as a working education platform implementation.
