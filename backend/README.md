# PixelEye Backend

The backend is an Express 4 API located in `backend/server`. It currently provides a development REST surface for the frontend and stores data in JavaScript arrays.

## Structure

```text
backend/
  README.md       Backend architecture and implementation plan
  API.md          Endpoint reference and examples
  server/
    index.js      Express app and route handlers
    data.js       In-memory seed data and ID generation
    db.js         PostgreSQL connection pool
    schema.sql    Initial PostgreSQL schema
    migrate.js    Schema migration runner
    check-db.js   Database connectivity check
```

## PostgreSQL Setup

The repository now includes a PostgreSQL foundation. The current Express routes still use the in-memory collections in `server/data.js`; database-backed route migration is the next step.

### Local Docker setup

Docker is the recommended local setup:

```bash
docker compose up -d postgres
cp .env.example .env
npm run db:check
npm run db:migrate
```

The default development connection is:

```text
postgresql://pixeleye:pixeleye_dev_password@localhost:5432/pixeleye
```

For a hosted PostgreSQL provider, set `DATABASE_URL` in `.env` instead. Do not commit `.env` or real credentials. `DATABASE_SSL=true` enables hosted-provider SSL configuration.

Useful database commands:

```bash
npm run db:check
npm run db:migrate
docker compose logs postgres
docker compose down
```

The migration is repeatable: it creates the schema objects only when they do not already exist.

## Run the Server

From the repository root:

```bash
npm run server
```

The server listens on port `4000` by default. Set another port with:

```bash
PORT=4100 npm run server
```

Health check:

```bash
curl http://localhost:4000/api/health
```

Expected response shape:

```json
{
  "ok": true,
  "service": "pixeleye-backend",
  "timestamp": "..."
}
```

## Server Responsibilities Today

`server/index.js` currently owns route handling for:

- Health check.
- Account listing, login, and signup.
- Profile read and update.
- Account Manager listing.
- Client listing, detail, and creation.
- Project listing, detail, creation, updates, and deliverables lookup.
- Operations task-board listing, detail, creation, updates, and deletion.
- Operations intake listing, creation, and updates.
- Account Manager project list.
- Account Manager task progress.
- Account Manager client updates.
- Account Manager KPI flags.
- Account Manager project submissions.
- Invite listing and creation.

See [API.md](API.md) for the current route reference.

## Data Model Today

`server/data.js` exports the mutable collections used by the routes:

- `accounts`
- `invites`
- `profile`
- `ams`
- `clients`
- `projects`
- `projectDeliverables`
- `taskBoard`
- `intakes`
- `amProjectList`
- `amTaskProgress`
- `amClientUpdates`
- `amKpiFlags`
- `amProjectSubmissions`

New records receive IDs from `createId(prefix)`, which uses Node's `randomUUID()`.

This is deliberately simple development storage. There is no database, transaction boundary, migration system, query layer, or persistence across restarts.

The PostgreSQL schema is now available in `server/schema.sql`, but route handlers have not yet been moved to it. Until that migration is complete, the API continues to read and mutate in-memory arrays.

## Request Behavior

The current server:

- Enables CORS for development.
- Parses JSON request bodies.
- Returns JSON for successful requests and errors.
- Uses `201` for successful create operations.
- Uses `401` for invalid login credentials.
- Uses `404` when an item ID is not found.
- Uses `409` for duplicate signup email.
- Adds timestamps to selected new records.

The route handlers currently perform very little validation. Most create and update routes accept arbitrary request fields and merge them into the in-memory object.

## Security Status

This backend is not production-ready authentication:

- Passwords are stored in plaintext in memory.
- Account responses currently include the password field.
- No login token or server session is issued.
- No authentication middleware protects routes.
- No role-based authorization is enforced.
- CORS is open for development.
- No rate limiting, audit log, password reset, email verification, or secret management exists.

These limitations must be resolved before exposing the API to real users or the public network.

## Frontend Integration Status

The frontend Vite server proxies `/api` to this server. The live integration is partial.

Currently exercised by frontend runtime code:

- `GET /api/om/tasks`
- `GET /api/am/project-list`
- `GET /api/am/task-progress`
- `GET /api/am/client-updates`
- `GET /api/am/kpi-flags`
- `POST /api/am/project-submissions`
- Some corresponding update attempts through the shared data layer

Still primarily local or mock-backed in the frontend:

- Login and signup.
- Invites and profile.
- Clients and projects.
- Calendar, reports, workload, and settings.
- Full intake approval flow.
- Deliverable creation and task generation.
- Production-specific data access.

A key migration defect is that the frontend currently sends collection-level `PUT` requests for some saves, while the backend exposes item-level `PUT /:id` routes. The API contract should be made consistent before removing localStorage fallback.

## Intended Backend Architecture

The backend is meant to become the source of truth for the full operating workflow:

```text
Authenticated user
  -> role-authorized API
    -> validated command/query
      -> database transaction
        -> projects, deliverables, tasks, approvals, updates, audit events
```

The target domain model should separate stable entities and relationships:

- Users and roles.
- Teams and assignments.
- Clients.
- Projects.
- Project submissions and approval decisions.
- Deliverables.
- Tasks and task assignments.
- Client updates.
- Calendar events.
- Reports and KPI snapshots.
- Invites and sessions.
- Attachments.
- Audit events.

The approval command should be server-owned. Approving a submission should validate the submission, create or activate the project, persist deliverables, create task records, and record the approving user and timestamp in one transaction.

## Backend Build Plan

### Phase 1: Stabilize the current API

- Define request and response schemas.
- Validate required fields and enum values.
- Standardize IDs, dates, status names, and error responses.
- Fix collection-vs-item update semantics.
- Add API smoke tests for every route group.

### Phase 2: Connect identity securely

- Hash passwords with a suitable password hashing library.
- Stop returning password fields.
- Add login session or token issuance.
- Add authentication middleware.
- Add role and ownership checks to each route.
- Connect frontend sign-in, invite signup, and sign-out to the server.

### Phase 3: Persist the domain

- Select a database.
- Add migrations and seed scripts.
- Replace mutable module arrays with repositories or a data-access layer.
- Add unique constraints and foreign keys.
- Preserve timestamps and audit history.

### Phase 4: Move workflow decisions to the server

- Implement submission review commands.
- Generate project and task records during approval.
- Add assignment endpoints for person or manual assignee.
- Add activity feed and notifications.
- Add attachment upload handling.

### Phase 5: Complete product APIs

- Calendar and availability.
- Reports and KPI snapshots.
- Workload and capacity.
- Settings and profile.
- Team directory and role management.
- Search, pagination, filtering, and sorting.

### Phase 6: Operate it reliably

- Automated unit, integration, and end-to-end tests.
- Structured logs and request IDs.
- Health and readiness checks.
- Error monitoring.
- Secure environment configuration.
- Deployment and backup strategy.

## API Testing Examples

```bash
# Health
curl http://localhost:4000/api/health

# Accounts used during development
curl http://localhost:4000/api/accounts

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"elena@studio.test","password":"pass"}'

# Create a project submission
curl -X POST http://localhost:4000/api/am/project-submissions \
  -H 'Content-Type: application/json' \
  -d '{"client":"Lumina Tech","project":"Q4 Brand Refresh","submittedBy":"Elena Rossi","deliverables":[]}'
```

## Backend Definition of Done

The backend is ready for production use when data survives restarts, every protected route verifies identity and permissions, request validation is enforced, passwords and secrets are handled securely, the approval workflow is transactional, and automated tests cover the API contract and critical workflows.
