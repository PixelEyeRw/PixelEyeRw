# PixelEye Backend API

> Development reference: this API currently uses in-memory data and does not enforce authentication or authorization. Changes are lost when the Node process restarts. See [README.md](README.md) for the implementation status and production build plan.

Base URL: `http://localhost:4000/api`

## Health & Info

### Health Check
```
GET /api/health
```
Returns the server health status.

**Response:**
```json
{
  "ok": true,
  "service": "pixeleye-backend",
  "timestamp": "2026-09-10T06:57:46.897Z"
}
```

---

## Authentication

### Get All Accounts
```
GET /api/accounts
```
Returns the development list of user accounts. This endpoint is not protected and must not be exposed in production.

### Login
```
POST /api/auth/login
```
Authenticates a user.

**Request Body:**
```json
{
  "email": "elena@studio.test",
  "password": "pass"
}
```

**Current development response:**
```json
{
  "id": "account_am_1",
  "name": "Elena Rossi",
  "email": "elena@studio.test",
  "role": "Account Manager",
  "password": "pass"
}
```

The current implementation includes the plaintext password because it is a development scaffold. The production contract must omit password fields and return an authenticated session or token.

### Sign Up
```
POST /api/auth/signup
```
Creates a new user account.

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@studio.test",
  "password": "secure_password",
  "role": "Account Manager"
}
```

---

## Profile

### Get Profile
```
GET /api/profile
```
Returns the current user profile.

### Update Profile
```
PUT /api/profile
```
Updates the current user profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "phone": "+1 555 0123"
}
```

---

## OM: Account Managers

### List Account Managers
```
GET /api/om/account-managers
```

### Get Account Manager
```
GET /api/om/account-managers/:id
```

---

## OM: Clients

### List Clients
```
GET /api/om/clients
```

### Get Client
```
GET /api/om/clients/:id
```

### Create Client
```
POST /api/om/clients
```

**Request Body:**
```json
{
  "name": "New Client",
  "am": "Elena Rossi",
  "health": "on_track"
}
```

---

## OM: Projects

### List Projects
```
GET /api/om/projects
```

### Get Project
```
GET /api/om/projects/:id
```

### Get Project Deliverables
```
GET /api/om/projects/:id/deliverables
```

### Create Project
```
POST /api/om/projects
```

**Request Body:**
```json
{
  "title": "New Project",
  "client": "Client Name",
  "am": "Elena Rossi",
  "priority": "HIGH",
  "status": "on_track",
  "progress": 0
}
```

### Update Project
```
PUT /api/om/projects/:id
```

---

## OM: Task Board (Daily Tasks)

### List Tasks
```
GET /api/om/tasks
```

### Get Task
```
GET /api/om/tasks/:id
```

### Create Task
```
POST /api/om/tasks
```

**Request Body:**
```json
{
  "projectId": "Q-201",
  "client": "Nebula Forge",
  "project": "Launch Identity Sprint",
  "mainTask": "Stakeholder intake workshop",
  "owner": "Jordan Vance",
  "priority": "High",
  "status": "Not Started",
  "progress": 0,
  "deadline": "2026-09-10"
}
```

### Update Task
```
PUT /api/om/tasks/:id
```

### Delete Task
```
DELETE /api/om/tasks/:id
```

---

## OM: Intakes

### List Intakes
```
GET /api/om/intakes
```

### Create Intake
```
POST /api/om/intakes
```

**Request Body:**
```json
{
  "client": "Client Name",
  "projectName": "Project Name",
  "priority": "high",
  "notes": "Project details",
  "createdBy": "Jordan Vance",
  "status": "Pending review"
}
```

### Update Intake
```
PUT /api/om/intakes/:id
```

---

## AM: Project List

### List AM Projects
```
GET /api/am/project-list
```

### Get AM Project
```
GET /api/am/project-list/:id
```

### Create AM Project
```
POST /api/am/project-list
```

### Update AM Project
```
PUT /api/am/project-list/:id
```

---

## AM: Task Progress

### List Task Progress
```
GET /api/am/task-progress
```

### Get Task Progress
```
GET /api/am/task-progress/:id
```

### Create Task Progress
```
POST /api/am/task-progress
```

**Request Body:**
```json
{
  "projectId": "prj_101",
  "task": "Mood board review",
  "assignee": "Elena Rossi",
  "status": "In Progress",
  "progress": 68
}
```

### Update Task Progress
```
PUT /api/am/task-progress/:id
```

---

## AM: Client Updates

### List Client Updates
```
GET /api/am/client-updates
```

### Create Client Update
```
POST /api/am/client-updates
```

**Request Body:**
```json
{
  "projectId": "prj_101",
  "client": "Lumina Tech",
  "summary": "Client requested motion treatment changes",
  "date": "2026-08-20"
}
```

### Update Client Update
```
PUT /api/am/client-updates/:id
```

---

## AM: KPI Flags

### Get KPI Flags
```
GET /api/am/kpi-flags
```

### Update KPI Flags
```
PUT /api/am/kpi-flags
```

**Request Body:**
```json
{
  "health": "On Track",
  "status": "Eligible",
  "bonus": 8,
  "notes": "Strong delivery pace"
}
```

---

## AM: Project Submissions

### List Submissions
```
GET /api/am/project-submissions
```

### Get Submission
```
GET /api/am/project-submissions/:id
```

### Create Submission
```
POST /api/am/project-submissions
```

**Request Body:**
```json
{
  "client": "Lumina Tech",
  "project": "Q4 Brand Refresh",
  "objective": "Refresh brand identity",
  "description": "Complete rebrand for Q4",
  "priority": "High",
  "deadline": "2026-10-31",
  "deliverables": [
    {
      "name": "Mood boards",
      "deadline": "2026-09-15",
      "role": "Designer",
      "assignee": "Design Team"
    }
  ],
  "submittedBy": "Elena Rossi",
  "status": "Pending Review"
}
```

### Update Submission
```
PUT /api/am/project-submissions/:id
```

---

## Invites

### List Invites
```
GET /api/invites
```

### Create Invite
```
POST /api/invites
```

**Request Body:**
```json
{
  "email": "invitee@studio.test",
  "role": "Account Manager"
}
```

---

## Error Responses

All errors return appropriate HTTP status codes:

- **400 Bad Request** - Missing required fields
- **401 Unauthorized** - Invalid credentials
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource already exists (e.g., duplicate account)
- **500 Internal Server Error** - Server error

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

---

## Testing

Use curl or Postman to test endpoints:

```bash
# Health check
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"elena@studio.test","password":"pass"}'

# List clients
curl http://localhost:4000/api/om/clients

# Create task
curl -X POST http://localhost:4000/api/om/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId":"Q-201",
    "mainTask":"New task",
    "owner":"Elena Rossi",
    "status":"Not Started"
  }'
```

---

## Notes

- All data is stored in memory (no database). Changes are lost on server restart.
- For production, implement a real database (PostgreSQL, MongoDB, etc.)
- Authentication is a development-only email/password comparison with no session or token.
- Passwords are currently plaintext and must be hashed before production use.
- Add authentication middleware and role-based access control (RBAC) for security.
- The frontend currently uses only a subset of these endpoints; see [README.md](README.md).
