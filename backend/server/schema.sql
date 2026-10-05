CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Operations Manager', 'Account Manager', 'Production', 'Director')),
  capacity_max INTEGER NOT NULL DEFAULT 24 CHECK (capacity_max > 0),
  title TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS capacity_max INTEGER NOT NULL DEFAULT 24;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id UUID NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  account_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  health TEXT NOT NULL DEFAULT 'on_track',
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_code TEXT UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  account_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'Not Started',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL DEFAULT 'Low',
  task_stage TEXT,
  revenue_source NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_source NUMERIC(12, 2) NOT NULL DEFAULT 0,
  start_date DATE,
  target_deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_code TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'Low';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS task_stage TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS revenue_source NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cost_source NUMERIC(12, 2) NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS projects_display_code_idx ON projects(display_code) WHERE display_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  project_name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  deadline DATE,
  attachment_name TEXT,
  message TEXT,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Approved', 'Rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_submissions ADD COLUMN IF NOT EXISTS deliverables JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT NOT NULL DEFAULT '',
  requested_deadline DATE,
  status TEXT NOT NULL DEFAULT 'Pending review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS intakes_created_at_idx ON intakes(created_at DESC);

CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES project_submissions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT,
  main_task TEXT,
  role TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  manual_assignee TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'Not Started',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (assignee_id IS NOT NULL OR manual_assignee IS NOT NULL OR role IS NULL)
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  manual_assignee TEXT,
  assignment_type TEXT NOT NULL DEFAULT 'assigned' CHECK (assignment_type IN ('personal', 'assigned')),
  role TEXT,
  task TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'project' CHECK (task_type IN ('project', 'daily')),
  support TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress',
  approval_status TEXT NOT NULL DEFAULT 'Not Required',
  next_action TEXT,
  stage TEXT,
  priority TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  deadline DATE,
  comment TEXT,
  submission_link TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (assignment_type = 'personal' AND assigned_to IS NULL AND manual_assignee IS NULL)
    OR
    (assignment_type = 'assigned' AND (assigned_to IS NOT NULL OR manual_assignee IS NOT NULL))
  )
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'Not Required';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'project';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS support TEXT;

CREATE TABLE IF NOT EXISTS client_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  summary TEXT NOT NULL,
  meeting_notes TEXT NOT NULL DEFAULT '',
  client_feedback TEXT NOT NULL DEFAULT '',
  satisfaction_score INTEGER NOT NULL DEFAULT 0 CHECK (satisfaction_score BETWEEN 0 AND 10),
  next_client_action TEXT NOT NULL DEFAULT '',
  upsell_opportunity TEXT NOT NULL DEFAULT '',
  referral_asked TEXT NOT NULL DEFAULT 'No' CHECK (referral_asked IN ('No', 'Yes')),
  notes TEXT NOT NULL DEFAULT '',
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS meeting_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS client_feedback TEXT NOT NULL DEFAULT '';
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS satisfaction_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS next_client_action TEXT NOT NULL DEFAULT '';
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS upsell_opportunity TEXT NOT NULL DEFAULT '';
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS referral_asked TEXT NOT NULL DEFAULT 'No';
ALTER TABLE client_updates ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS client_updates_owner_client_idx ON client_updates(created_by, client_id) WHERE client_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS am_kpi_flags (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  payment_received BOOLEAN NOT NULL DEFAULT FALSE,
  project_delivered BOOLEAN NOT NULL DEFAULT FALSE,
  relationship_maintained BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('general', 'project')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Operations Manager', 'Account Manager', 'Production', 'Director')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects(client_id);
CREATE INDEX IF NOT EXISTS projects_account_manager_id_idx ON projects(account_manager_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON project_submissions(status);
CREATE INDEX IF NOT EXISTS deliverables_project_id_idx ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_created_by_idx ON tasks(created_by);
CREATE INDEX IF NOT EXISTS client_updates_project_id_idx ON client_updates(project_id);
CREATE INDEX IF NOT EXISTS audit_events_entity_idx ON audit_events(entity_type, entity_id);
