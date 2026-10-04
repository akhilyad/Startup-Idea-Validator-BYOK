# Sift — System Architecture

## Overview
Sift is an evidence-first startup opportunity reasoning and validation system. It turns raw, unstructured business concepts into falsifiable theses, hunts for disconfirming signals, and designs high-yield experiments before code is written.

## High-Level Topology
```text
                         ┌─────────────────────┐
                         │   Browser Client    │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
              ┌─────────────────────┐┌─────────────────────┐
              │   apps/web (UI)     ││   apps/api (REST)   │
              │ React / Tailwind    ││ Fastify / Node.js   │
              │ Port: 3000          ││ Port: 4000          │
              └─────────────────────┘└──────────┬──────────┘
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                                PostgreSQL    Redis    apps/worker
                                (or SQLite)   (Queue)  (Pipeline)
```

## Monorepo Architecture
```text
sift/
├── apps/
│   ├── web/        # React + Vite + Tailwind frontend application
│   ├── api/        # Fastify API service (/api/v1)
│   └── worker/     # Research execution & queue runner
├── packages/
│   ├── ai/             # Schema-validated LLM provider abstractions
│   ├── config/         # Environment & feature flags
│   ├── db/             # Prisma client, migrations & seed scripts
│   ├── observability/  # Structured logging & metrics
│   ├── research/       # 11-agent pipeline, search abstractions & events
│   ├── types/          # Domain enumerations & data models
│   └── validation/     # Shared Zod validation schemas
├── tests/              # End-to-end integration tests
└── docs/               # Technical specifications & traceability
```

## Core Product Loop
```text
IDEA INPUT ──> NORMALIZATION ──> ASSUMPTION GRAPH ──> RESEARCH PIPELINE (11 AGENTS)
                                                               │
                                                               ▼
VALIDATION PLAN <── EXPERIMENTS <── CRITICAL UNKNOWNS <── COUNTER-EVIDENCE HUNT
      │
      ▼
RECORD RESULTS ──> UPDATED THESIS (North Star Metric PRD §65)
```
