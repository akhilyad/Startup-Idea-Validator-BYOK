# Sift — Database Architecture

## Dual-Provider Architecture
Sift supports both zero-infrastructure local development (SQLite via `file:./dev.db`) and production deployments (PostgreSQL via `DATABASE_URL=postgresql://...`).

## Core Entities
- **User**: Authentication credentials, name, email verification.
- **Account / Session**: OAuth accounts and session cookies.
- **Workspace / WorkspaceMember**: Multi-tenant isolation boundary with roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **Project**: Workspace-owned container for opportunities.
- **Idea & IdeaVersion**: Falsifiable thesis versions (`v1`, `v2`...) allowing comparative tracking over time.
- **Analysis**: Lifecycle execution state (`CREATED`, `RESEARCHING`, `CHALLENGING`, `SYNTHESIZING`, `QUALITY_CHECK`, `COMPLETE`, `PARTIAL`, `FAILED`).
- **Assumption**: Hypotheses with `category`, `criticality`, qualitative `confidence`, and `evidenceState` (`SUPPORTED`, `MIXED`, `WEAKLY_SUPPORTED`, `CONTRADICTED`, `UNKNOWN`).
- **Claim**: Atomic statements classified as `FACT`, `DERIVED_ANALYSIS`, `ASSUMPTION`, `UNKNOWN`, `COUNTER_EVIDENCE`, or `VALIDATION_RESULT`.
- **Evidence**: Provenance linkage between Claim and Source with excerpt and confidence.
- **Source**: Canonical URL, publisher, date, geography, population, and Tier (`TIER_1_PRIMARY` to `TIER_4_LOW_CONFIDENCE`).
- **Competitor**: Categorized as `DIRECT`, `INDIRECT`, `SUBSTITUTE`, `NON_CONSUMPTION`, or `FAILED`.
- **Experiment**: Validation tests with hypothesis, method, success/failure criteria, status, and recorded result.
- **Report**: Synthesized thesis JSON with quality status.
- **UsageEvent**: Authoritative usage ledger for billing and free analysis enforcement.
