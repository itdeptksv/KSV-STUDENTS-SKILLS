# KSV Skill Sets — Student Skills Development Portal

## Overview
A full-stack MERN application for managing student skill assessments, competitions, gallery, and reports.

## Architecture
- **client/** — React + Vite + Tailwind CSS frontend
- **server/** — Node.js + Express + MongoDB backend

## Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm 9+

## Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

## Environment Variables

### server/.env
Copy `server/.env.example` to `server/.env` and configure:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: 7d) |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins |
| `UPLOAD_MAX_SIZE_MB` | Max upload size in MB (default: 5) |
| `UPLOAD_DIR` | Upload directory (default: uploads) |
| `ADMIN_SETUP_TOKEN` | Bootstrap token for first admin |
| `PORT` | Server port (default: 5000) |

### client/.env
Copy `client/.env.example` to `client/.env`:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL |

## MongoDB Setup
1. Install MongoDB locally or create a free Atlas cluster
2. Set `MONGODB_URI` in `server/.env`

## Initial Administrator Setup

```bash
cd server
node scripts/setupAdmin.js <ADMIN_SETUP_TOKEN> "Principal Name" admin@school.edu SecurePassword123!
```

The `ADMIN_SETUP_TOKEN` must match the value in `server/.env`.

## Database Initialization (Seed)

```bash
cd server
npm run seed
```

This creates:
- 10 skill areas with sub-skills
- Classes Pre-KG through Class 12 with sections A, B, C
- Academic year 2024-25 with 3 terms

## Running the Application

```bash
# Start backend (from server/)
npm run dev

# Start frontend (from client/)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/api/v1/health

## Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

## Production Build

```bash
cd client && npm run build
```

## API Documentation

Base URL: `/api/v1`

All authenticated endpoints require: `Authorization: Bearer <accessToken>`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/login | No | Login |
| POST | /auth/refresh | No | Refresh token |
| POST | /auth/logout | Yes | Logout |
| GET | /auth/me | Yes | Current user |
| POST | /auth/setup-admin | No | Bootstrap admin |

### Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | /users | List users |
| POST | /users | Create user |
| PUT | /users/:id | Update user |
| POST | /users/:id/reset-password | Reset password |

### Students
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | /students | All auth | List students |
| POST | /students | Admin, Teacher | Create student |
| PUT | /students/:id | Admin, Teacher | Update student |
| GET | /students/template | Admin | Download Excel template |
| POST | /students/import/preview | Admin | Preview import |
| POST | /students/import/save | Admin | Save import |

### Assessments
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | /assessments | All auth | List assessments |
| POST | /assessments | Teachers | Create assessment |
| POST | /assessments/bulk | Teachers | Bulk create |
| POST | /assessments/:id/submit | Teachers | Submit for review |
| POST | /assessments/:id/approve | Admin | Approve |
| POST | /assessments/:id/reject | Admin | Reject |

### Competitions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /competitions | Public | List competitions |
| POST | /competitions | Admin | Create |
| POST | /competitions/:id/status | Admin | Update status |
| POST | /competitions/:id/register | Teachers | Register student |
| POST | /competitions/:id/scores | Admin/Skill Teacher | Enter scores |
| POST | /competitions/:id/calculate-results | Admin | Calculate results |

### Gallery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /gallery/albums | Public | List albums |
| GET | /gallery/albums/:id/items | Public | List items |
| POST | /gallery/albums/:id/items | Teachers | Submit item |
| POST | /gallery/items/:id/approve | Admin | Approve |
| POST | /gallery/items/:id/reject | Admin | Reject |

### Reports
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | /reports/dashboard | Admin | Dashboard stats |
| GET | /reports/student/:id | Auth | Student report (json/pdf/excel) |
| GET | /reports/class-summary | Teachers | Class summary |

## Unresolved School Decisions
1. **Overall skill score formula** — No aggregate score is calculated. School must approve a formula before implementation.
2. **Tie-breaking policy** — Competition ties currently ranked by insertion order. School must define policy.
3. **Assessment approval requirement** — Configurable via app settings (`assessment_approval_required`).
4. **Parent account provisioning** — Currently admin-managed. Self-registration flow pending school approval.
5. **Email notifications** — In-app only. Email provider credentials not configured.
6. **Production file storage** — Local disk storage used. S3 or equivalent recommended for production.

## Troubleshooting
- **MongoDB connection failed**: Check `MONGODB_URI` in `server/.env`
- **CORS errors**: Add frontend origin to `ALLOWED_ORIGINS` in `server/.env`
- **Token expired**: Frontend auto-refreshes; if loop occurs, clear localStorage
- **Upload fails**: Check `UPLOAD_DIR` exists and is writable
