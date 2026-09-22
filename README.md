# PixelEye

PixelEye is a role-based operations workspace for managing clients, projects, deliverables, tasks, approvals, client updates, workload, and performance reporting.

The repository is split into two application areas:

- `frontend/`: React and Vite user interface.
- `backend/`: Express API and current in-memory data store.

## Current State

The application is a working development build with a hybrid persistence model:

- The frontend has role-specific workspaces for Operations, Account Management, Production, and Director users.
- The backend exposes REST endpoints for the main project and task entities.
- Some screens read and write through the API.
- Other screens still use development seed data and browser `localStorage`.
- Backend data is held in process memory and is lost when the server restarts.
- Authentication is currently a development flow, not production security.

This distinction matters when testing: a successful UI action does not necessarily mean that the data has been persisted by the backend.

## Main Workflow

1. An Account Manager opens **New Project**.
2. The manager selects an existing client, enters project details, and adds deliverables.
3. Each deliverable can include a role, a known team member or manual assignee, a deadline, and a main task.
4. The submission is sent to Operations for review.
5. Operations approves or rejects the submission.
6. Approved deliverables are transformed into Account Manager project and task-progress rows.
7. Operations and Production use task-board views to manage delivery.
8. Account Managers track progress, client updates, KPI flags, and bonus-related summaries.

The approval-to-task flow is currently implemented primarily in frontend state and local persistence. It is not yet a complete backend transaction.

## Run Locally

Install dependencies from the repository root:

```bash
npm install
```

Start only the frontend:

```bash
npm run dev
```

Start only the backend:

```bash
npm run server
```

Start both processes:

```bash
npm run dev:full
```

Start PostgreSQL locally with Docker:

```bash
docker compose up -d postgres
cp .env.example .env
npm run db:check
npm run db:migrate
```

The initial PostgreSQL schema and connection layer are now included. The existing API still uses in-memory data until its route handlers are migrated to database queries.

Build the frontend:

```bash
npm run build
```

Development URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- API health check: `http://localhost:4000/api/health`

The Vite server proxies `/api/*` requests to the backend. See [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for details.

## Smoke Checks

With the backend running:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/om/clients
curl http://localhost:4000/api/om/tasks
curl http://localhost:4000/api/am/project-submissions
```

Use the test accounts seeded by the backend:

- Operations Manager: `jordan@studio.test` / `pass`
- Account Manager: `elena@studio.test` / `pass`
- Production: `sam@studio.test` / `pass`
- Director: `avery@studio.test` / `pass`

The current sign-in screen uses browser seed data, so these accounts may need to be present in localStorage for UI sign-in until authentication is connected end to end.

## Documentation Map

- [Frontend guide](frontend/README.md): UI architecture, role shells, workflows, persistence, and frontend backlog.
- [Backend guide](backend/README.md): API architecture, route ownership, data model, limitations, and backend backlog.
- [API reference](backend/API.md): endpoint-by-endpoint request and response examples.

## Intended Production Direction

The intended system is a shared, authenticated operations platform with:

- A real database and migrations.
- Server-owned projects, clients, deliverables, tasks, approvals, users, and audit history.
- Secure authentication with hashed passwords and session or token management.
- Role-based authorization enforced by the backend.
- A single source of truth rather than frontend mock data and localStorage fallback.
- Atomic approval handling that creates project and task records consistently.
- File upload storage for project attachments.
- API-backed calendar, reporting, workload, and activity data.
- Automated API and component tests.

The recommended delivery sequence is:

1. Connect existing sign-in and invite signup to the API.
2. Replace collection-level localStorage writes with item-level API mutations.
3. Move project submission approval and deliverable-to-task generation to the backend.
4. Add request validation, authentication middleware, and role authorization.
5. Introduce a database and migrations.
6. Migrate remaining clients, projects, calendar, reports, workload, and settings screens.
7. Remove mock data and localStorage fallbacks after parity is verified.
8. Add tests, observability, deployment configuration, and production secrets management.

## Important Development Notes

- Do not treat `frontend/src/lib/mockData.js` as production data. It is development seed content and fallback content.
- Do not expose or reuse the plaintext passwords in the backend seed outside local development.
- Backend mutations currently affect only the running Node process.
- The project currently has no automated test, lint, or type-check command.
- Avoid changing the API shape casually: the frontend and backend are being migrated together toward a real data model.
