# Sift — API Specification

Base path: `/api/v1`

## Endpoints

### Authentication
- `POST /api/v1/auth/register` — Create account with email/password (grants 2 free analyses).
- `POST /api/v1/auth/login` — Sign in and receive session cookie.
- `POST /api/v1/auth/logout` — Terminate session.
- `GET /api/v1/auth/me` — Return authenticated user, active workspace, and remaining free analyses.

### Workspaces & Projects
- `GET /api/v1/workspaces` — List user workspaces.
- `POST /api/v1/workspaces` — Create workspace.
- `GET /api/v1/projects` — List projects in workspace.
- `POST /api/v1/projects` — Create project.
- `GET /api/v1/projects/:id` — Get project details with versioned ideas.

### Idea Decomposition & Normalization
- `POST /api/v1/ideas/normalize` — Normalizes raw text/URL into structured proposedCustomer, problem, solution, pricing, and initial assumptions (PRD §9).

### Opportunity Analyses
- `GET /api/v1/analyses` — List analyses with status, quality gate, and stats.
- `POST /api/v1/analyses` — Create analysis and trigger 8-stage pipeline in background. Enforces 2 free analyses per account lifetime limit.
- `GET /api/v1/analyses/:id` — Retrieve full dossier: ideaVersion, assumptions, claims with evidence & sources, competitors, experiments, reports.
- `POST /api/v1/analyses/:id/cancel` — Cancel active analysis.
- `POST /api/v1/analyses/:id/challenge` — Launch "Challenge the Idea" counter-evidence run (PRD §4, §35).
- `POST /api/v1/analyses/:id/new-version` — Create IdeaVersion N+1 and launch comparative research run.
- `PATCH /api/v1/analyses/:id/assumptions/:assumptionId` — Update assumption criticality, statement, or status.
- `POST /api/v1/analyses/:id/experiments` — Create custom validation experiment.
- `POST /api/v1/analyses/:id/experiments/:experimentId/results` — Record validation outcome and update linked assumption evidence state (North Star Metric PRD §65).
- `GET /api/v1/analyses/:id/export` — Download formatted Markdown report.
- `GET /api/v1/analyses/:id/events` — Server-Sent Events (SSE) stream for live progress updates.

### Billing
- `GET /api/v1/billing/usage` — Return usage ledger count and remaining free analyses.
- `POST /api/v1/billing/checkout` — Upgrade account to ONE_TIME ($49) or PRO ($79/mo).
