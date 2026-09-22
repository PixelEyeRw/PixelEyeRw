# PixelEye Frontend

The frontend is a React 18 application built with Vite, Tailwind CSS, Lucide icons, and Recharts. It provides separate workspaces for the operational roles used by the PixelEye workflow.

## Structure

```text
frontend/
  index.html
  vite.config.js
  src/
    Main.jsx                 Vite entry and development seed bootstrapping
    App.jsx                  Session, invite routing, and role selection
    Index.css                Global styles
    components/              Shared sidebar, topbar, and reusable UI
    pages/                   Screen-level page components
    roles/
      OM/App.jsx             Operations Manager workspace
      AM/App.jsx             Account Manager workspace
      Production/App.jsx     Production workspace
      Director/App.jsx       Director workspace, currently based on OM
    lib/
      teamData.js            Persistence and API access boundary
      mockData.js            Development seed and fallback data
      amWorkbook.js          Client-side KPI and bonus calculations
      theme.js               Shared visual tokens
    dev/seed.js              Development-only localStorage seed data
```

## Application Shell

`src/App.jsx` owns the top-level state:

- Restores the browser session from `pixeleye_session`.
- Shows sign-in when no session exists.
- Detects invite links using the `?invite=` query parameter.
- Maps account roles to the OM, AM, Production, or Director shell.
- Stores a lightweight session containing id, name, email, and role.

Role mapping is currently string-based. Unknown roles default to Production. This must become server-issued authorization rather than a client-side routing decision.

## Role Workspaces

### Operations Manager

`src/roles/OM/App.jsx` currently provides:

- Dashboard
- Intake review
- Team daily tasks
- Deliverables
- Clients
- Projects
- Calendar
- Reports
- Workload
- Settings
- Account-manager reassignment modal

The Director shell reuses this workspace with a company-wide display flag. It does not yet enforce separate Director permissions or filtering.

### Account Manager

`src/roles/AM/App.jsx` currently provides:

- Dashboard
- My daily tasks
- Clients
- Projects
- Calendar
- Reports
- Settings
- Incoming assignments
- New Project submission
- Project List
- Task Progress
- Client Updates
- KPI & Bonus

The Account Manager workflow is the most developed cross-screen flow. Approved project submissions are converted into project rows and one task-progress row per deliverable. This conversion currently occurs in the AM shell after reading submissions.

### Daily Task Ownership

The daily-task form supports two ownership modes:

- **Personal task**: the creator owns the task; no separate role or assignee is required. The record uses `assignmentType: "personal"`, `role: "Personal"`, and the creator as `assignedTo`.
- **Assigned task**: the creator selects a production role and a team member or enters a manual assignee name. The record uses `assignmentType: "assigned"`.

Both modes still require a project in the current form. The backend should preserve this distinction when daily tasks move out of localStorage.

### Production

The Production shell currently provides a focused daily-task workspace plus Reports and Settings. Production-specific permissions, assignments, and server-backed task filtering still need to be implemented.

## New Project Workflow

`src/pages/AMNewProjectPage.jsx` collects:

- Existing client selected from a dropdown.
- Project name and description.
- Objective and priority.
- Overall deadline.
- Optional attachment filename and message to Operations.
- One or more deliverables.
- Deliverable name, description, deadline, role, main task, and assignee.
- Known team member assignment or a manual assignee name.

The form posts to `POST /api/am/project-submissions` and also persists locally. Operations reviews submissions in `IntakePage.jsx`. Approval status is then used by the AM shell to generate project and task-progress rows.

Current limitation: approval and task generation are not an atomic backend operation. A browser refresh, another user, or a server restart can produce inconsistent views.

## Data Access and Persistence

`src/lib/teamData.js` is the frontend persistence boundary.

For selected collections, reads use this order:

1. Request `GET /api/...`.
2. If the request succeeds, use the API response.
3. If the request fails, read the matching browser localStorage key.
4. If no local value exists, return an empty or default value.

Writes attempt an API request and then always write the payload to localStorage. This allows development without the backend but currently hides API failures from the user.

API-connected collection reads currently include:

- OM task board
- AM project list
- AM task progress
- AM client updates
- AM KPI flags
- AM project submissions in the New Project and intake paths

Many other screens still use `mockData.js` or direct localStorage helpers:

- Sign-in and signup
- Invites and profile
- Clients and projects
- Calendar
- Reports
- Workload
- Settings
- Some daily-task and deliverable flows

There is also a route mismatch to resolve: several save helpers send collection-level `PUT` requests such as `PUT /api/om/tasks`, while the backend currently exposes item-level routes such as `PUT /api/om/tasks/:id`. Those failed writes are silently covered by localStorage.

## Frontend Development Commands

Run from the repository root:

```bash
npm run dev
npm run build
npm run preview
```

The Vite proxy in `frontend/vite.config.js` forwards `/api` to `http://localhost:4000` during development.

## Frontend Definition of Done

The frontend migration is complete when:

- Every screen reads from the API or a clearly documented server-owned query.
- Every mutation reports loading and error states to the user.
- No production workflow depends on mock data or localStorage.
- Session and role information come from authenticated server responses.
- Project approval refreshes correctly for both the submitter and Operations users.
- Attachments upload to a real storage service rather than storing only a filename.
- Calendar, reporting, workload, and KPI calculations use consistent server data.
- Component and workflow tests cover the critical role paths.
