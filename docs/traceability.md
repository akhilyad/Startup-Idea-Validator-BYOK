# Sift — Requirement Traceability Matrix (TPRD §95)

| PRD Section | Requirement Description | Engineering Implementation | Database / API Impact | Status |
| :--- | :--- | :--- | :--- | :--- |
| **PRD §8** | Multi-Modal Idea Input | `apps/web/src/components/NewAnalysisView.tsx` | Text, URL, Reddit URL, Paste, Voice | **IMPLEMENTED** |
| **PRD §9** | Idea Normalization & Editable Interpretation | `apps/api/src/routes/ideas.ts`, `packages/ai` | `POST /api/v1/ideas/normalize` | **IMPLEMENTED** |
| **PRD §10, §11** | Assumption Engine & Criticality | `packages/research/src/pipeline/run.ts`, `Assumption` model | `Assumption.criticality`, `evidenceState` | **IMPLEMENTED** |
| **PRD §12** | 11 Modular Research Agents | `packages/research/src/agents/definitions.ts` | Problem, Customer, Competitor, Pricing, etc. | **IMPLEMENTED** |
| **PRD §4, §35** | "Challenge the Idea" Counter-Evidence | `apps/api/src/routes/analyses.ts`, `run-challenge.ts` | `POST /api/v1/analyses/:id/challenge` | **IMPLEMENTED** |
| **PRD §17, §18** | Competitors & Failed Competitor Forensics | `Competitor` model, `apps/web/src/components/AnalysisDetailView.tsx` | `classification: FAILED`, Direct, Indirect | **IMPLEMENTED** |
| **PRD §19** | TAM / SAM / SOM Methodology | `AnalysisDetailView.tsx` Market Tab | Transparent calculations and sources | **IMPLEMENTED** |
| **PRD §21** | Unit Economics & Sensitivity | `AnalysisDetailView.tsx` Economics Tab | Price, CAC, Gross Margin, Payback | **IMPLEMENTED** |
| **PRD §26, §37** | Experiment Design & Validation Workspace | `Experiment` model, `AnalysisDetailView.tsx` | Hypothesis, Method, Success/Failure criteria | **IMPLEMENTED** |
| **PRD §65** | North Star Loop: Record Result & Update Thesis | `apps/api/src/routes/analyses.ts` | `POST /api/v1/analyses/:id/experiments/:expId/results` | **IMPLEMENTED** |
| **PRD §31** | 5-Question Executive Dashboard | `AnalysisDetailView.tsx` Executive Summary | 5 core opportunity questions | **IMPLEMENTED** |
| **PRD §33** | Source Provenance Drawer | `Source` model, `AnalysisDetailView.tsx` Drawer | Canonical URL, publisher, date, tier | **IMPLEMENTED** |
| **PRD §34** | Machine-Readable Research Log | `ResearchLogEntry` model, Research Log Tab | Operational provenance query audit | **IMPLEMENTED** |
| **PRD §36** | Idea Versioning | `IdeaVersion` model, `POST /new-version` | Comparative versions (`v1`, `v2`) | **IMPLEMENTED** |
| **PRD §48, §50** | 2 Free Analyses & Billing Entitlements | `UsageEvent` model, `apps/api/src/routes/billing.ts` | `GET /api/v1/billing/usage`, Checkout | **IMPLEMENTED** |
| **PRD §59, §60** | Quality Gate (COMPLETE vs PARTIAL) | `packages/research/src/pipeline/run-quality.ts` | `qualityStatus: PASSED`, `status` | **IMPLEMENTED** |
| **PRD §73** | Export (Markdown with Citations) | `apps/api/src/routes/analyses.ts` | `GET /api/v1/analyses/:id/export` | **IMPLEMENTED** |
| **PRD §83** | First Killer Demo Seed Dataset | `packages/db/src/seed.ts` | AI Recruiting Agent complete dossier | **IMPLEMENTED** |
