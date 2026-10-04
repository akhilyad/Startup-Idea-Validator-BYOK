# Contributing to Startup Idea Validator (BYOK)

Thank you for your interest in contributing to **Startup Idea Validator (BYOK)**! We are building open, privacy-first, zero-markup tools that help founders stress-test early concepts against actual market friction and unit economics before writing a single line of code.

---

## 🌟 Ways to Contribute

- **Add New Research Agents:** Expand the 11-agent pipeline (e.g., Virality/Growth Loops, Enterprise Procurement, Hardware/Supply Chain).
- **LLM Provider Adapters:** Add or optimize adapters for new local or cloud models (Ollama, vLLM, DeepSeek, Mistral, Gemini).
- **Prompt & Evaluation Refinement:** Enhance prompts to spot subtle distribution traps, counter-evidence, and competitor graveyards.
- **UI/UX Enhancements:** Improve the report dashboard, graph visualizations, export features (PDF/Markdown), or responsive views.
- **Bug Reports & Feature Ideas:** Open an issue following our issue templates.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: >= 20.x
- **pnpm**: >= 9.x
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/akhilyad/Startup-Idea-Validator-BYOK.git
cd Startup-Idea-Validator-BYOK

# 2. Install dependencies & initialize local SQLite database
pnpm setup
```

The `pnpm setup` script automatically runs:
1. `pnpm install`
2. `pnpm db:generate`
3. `pnpm db:push`
4. `pnpm db:seed` (pre-seeds the demo account and killer demo dataset)

### Running Services

```bash
# Run both API and Web concurrently:
pnpm dev

# Or run separately in dedicated terminals:
# Terminal 1: Fastify API Service (Port 4000)
pnpm dev:api

# Terminal 2: Next.js Web Client (Port 3000)
pnpm dev:web

# Terminal 3: Background Research Worker (if running async queue)
pnpm dev:worker
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing & Validation

Before submitting a Pull Request, ensure that all tests and type checks pass:

```bash
# Run full integration test suite
pnpm test

# Typecheck all 10 packages & apps
pnpm typecheck

# Verify build
pnpm build
```

---

## 📐 Monorepo Structure

```text
├── apps/
│   ├── web/        # Next.js / Vite React frontend dashboard
│   ├── api/        # Fastify REST API & SSE streaming endpoints
│   └── worker/     # Research execution & queue runner
├── packages/
│   ├── ai/             # Schema-validated LLM provider abstractions (BYOK)
│   ├── config/         # Environment & feature flags
│   ├── db/             # Prisma client, migrations & seed scripts
│   ├── observability/  # Structured logging & metrics
│   ├── research/       # 11-agent pipeline, search abstractions & SSE events
│   ├── types/          # Domain enumerations & data models
│   └── validation/     # Shared Zod validation schemas
├── tests/              # Full-stack integration tests
└── docs/               # Technical specifications & architecture
```

---

## 🚀 Pull Request Guidelines

1. **Branch Naming**: `feat/your-feature-name`, `fix/your-bug-fix`, or `docs/update-readme`.
2. **Commit Messages**: Conventional commits preferred (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
3. **No Secret Leaks**: Never commit `.env` files or API keys.
4. **Clean PR Description**: Describe the motivation, changes made, and include screenshots for UI updates.
