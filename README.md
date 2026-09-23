# SMS Frontend

React SPA for the School Management System. It talks to the Laravel backend in
the sibling `sms-api` directory (Sanctum token auth) and provides two
role-based experiences: an **admin** console for managing students, and a
**student** view of their own record.

## Tech stack

- **React 19** + **TypeScript** (type-checked on every build via `tsc -b`)
- **Vite 8** dev server (port `5173`, pinned so Laravel CORS always matches)
- **Tailwind CSS 4** through `@tailwindcss/vite`
- **react-router-dom 7** (declarative routes + role guards)
- **axios** (Bearer-token request interceptor, automatic logout on `401`)
- **ESLint 10** + typescript-eslint

## Getting started

### 1. Start the API

```bash
cd ../sms-api
php artisan serve        # http://127.0.0.1:8000
```

Make sure the database is migrated and seeded (see
`sms-api/database/seeders` for the demo users).

### 2. Install and run the frontend

```bash
npm install
cp .env.example .env     # then adjust if needed
npm run dev              # http://localhost:5173
```

### Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api` | Laravel API base URL. For a Laragon vhost use `http://sms-api.test/api` instead. |

Restart `npm run dev` after changing `.env`.

## Demo accounts

| Role | Email | Password | Lands on |
| --- | --- | --- | --- |
| Admin | `admin@school.test` | `Admin@12345` | `/students` |
| Student | `student1@school.test` | `password123` | `/profile` |

## Routes and access

| Path | Who | What |
| --- | --- | --- |
| `/` and unknown paths | anyone | Redirect by role (to `/login` when signed out) |
| `/login` | public | Sign-in form |
| `/students` | admin | Student roster: search, class/section filters, pagination, create, edit, delete, CSV import/export, send notice |
| `/students/:id` | admin | Read-only student detail (Account / Academic / Contact / Record) |
| `/profile` | any signed-in user | Admin: account details from `GET /me`; student: own record from `GET /my-profile` |

Access rules live in `src/components/ProtectedRoute.tsx`; a wrong-role visit is
bounced to that role's home path, and `homePathFor(role)` in
`src/auth/session.ts` decides where sign-in lands.

## Features

**Admin**

- Student CRUD with Laravel validation errors mapped onto form fields
- Search by name/roll/email, filter by class and section, page size + pagination
- CSV import (`POST /students/import`) and export (`GET /students/export`).
  Import requires the columns `name,email,roll,class` (optional: `password`,
  `section`, `phone`, `address`); quote any field that contains a comma.
- Send a notice to every student by email (`POST /notices/send`)
- Per-student read-only detail page from the list ("View" button)

**Student**

- Own profile with account, academic (roll/class/section) and contact details

**Shared**

- Token login/logout; token and user cached in `localStorage`
  (`sms.token`, `sms.user`)
- Every request carries `Authorization: Bearer <token>`; a `401` response
  clears the session and returns to `/login`
- Role-aware redirect at `/` and after signing in

## Project structure

```
src/
├── api/          # axios client (client.ts) + endpoint functions
├── auth/         # session storage and role helpers (homePathFor)
├── components/   # AppLayout, ProtectedRoute, StudentForm, NoticeDialog,
│                 # Pagination, Alert
├── pages/        # LoginPage, ProfilePage, StudentsListView, StudentDetailView
└── types/        # API response types (Student, Paginated, ...)
```

## Scripts

| Command | Effect |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 with HMR |
| `npm run build` | Type-check (`tsc -b`) then production bundle into `dist/` |
| `npm run lint` | ESLint over the project |
| `npm run preview` | Serve the production bundle locally |

## Notes and troubleshooting

- **Stale HMR module** - if the browser reports
  `does not provide an export named 'default'` while `npm run build` still
  passes, Vite cached a half-written file: `touch` the changed source file or
  restart `npm run dev`.
- **CORS** - the dev-server port is pinned to `5173` so it always agrees with
  the Laravel CORS configuration.
- **Known cosmetic console notice** - some form inputs lack `id`/`name`
  attributes (accessibility suggestion only, no functional impact).
