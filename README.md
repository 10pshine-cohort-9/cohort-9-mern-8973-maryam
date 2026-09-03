# Notes App — MERN Virtual SHINE Internship (10Pearls, Cohort 9)

A full-stack notes application built with the MERN stack, developed as part of the 10Pearls SHINE MERN Virtual Internship program.

## Overview

Notes App lets authenticated users create, edit, delete, and organize personal notes — including simple notes, checklists, to-do lists, and weekly/monthly goals — with a colorful, responsive dashboard and a rich text editor.

## Tech Stack

**Backend**
- Node.js / Express
- MongoDB with Mongoose (MongoDB Atlas)
- JWT-based authentication, bcrypt password hashing
- Pino logging (with `pino-http` request/response logging)
- Global exception handling middleware
- Mocha, Chai, Supertest, mongodb-memory-server (backend testing)

**Frontend**
- React (Vite)
- React Router
- Axios
- Tailwind CSS / custom CSS
- Jest, React Testing Library (frontend testing)

**Quality & Tooling**
- SonarQube — static code analysis
- CodeRabbit — automated PR review
- Git branching strategy: `main` / `develop` / `feature` / `bugfix` branches, PR-based workflow

## Features

- User signup, login, and logout (JWT-based)
- Notes are private per user
- Create, edit, and delete notes
- Note types: Simple Note, Checklist, To-do, Weekly/Monthly Goal
- Per-note color and pin/unpin
- Rich text note editor with formatting toolbar
- Responsive dashboard with loading, empty, and error states
- Application logging (Pino) and centralized error handling
- Automated backend and frontend unit tests

## Project Structure

```
backend/
├── src/
│   ├── config/         # logger, database connection
│   ├── controllers/    # auth, notes
│   ├── middleware/      # auth, error handler
│   ├── models/          # User, Note
│   └── routes/           # auth, notes, health
├── test/                 # Mocha/Chai/Supertest tests
└── server.js

frontend/
├── src/
│   ├── api/               # axios instance
│   ├── context/          # AuthContext
│   ├── pages/             # Login, Signup, Dashboard, NoteEditor
│   └── styles/
```

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
npm run dev
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite default).

## Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Branching Strategy

- `main` — production-ready code
- `develop` — integration branch
- `feature/<frontend|backend>/<name>` — new features
- `bugfix/<frontend|backend>/<name>` — bug fixes

All changes go through pull requests into `develop`, reviewed by CodeRabbit and the mentor before merging.