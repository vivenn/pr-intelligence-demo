# CLAUDE.md — PR Intelligence Platform

This file defines the architecture, conventions, and rules for working on this codebase. Follow it for all code generation and edits.

## 1. Project Overview

A Pull Request Intelligence Platform: syncs PR data from GitHub, computes quality metrics, and surfaces PR-level and engineer-level insights via a REST API and React dashboard.

**Stack**: Node.js + Express (TypeScript), PostgreSQL + Prisma, Octokit (GitHub API), React (Vite) for the frontend, Jest for testing.

## 2. Architecture: Modular Monolith

The backend is a single deployable Express app, internally organized into **independent modules by domain**, each following a strict internal layering. This keeps the MVP simple to build/deploy while making a future split into microservices a matter of moving a module's folder, not rewriting it.

### Module boundaries (current)

- `github-sync` — talks to GitHub API (Octokit), ingests/upserts raw data (repos, PRs, reviews, comments, commits)
- `pull-requests` — PR read APIs, PR-level metrics
- `engineers` — engineer profiles, engineer-level metrics/aggregations
- `repositories` — repo-level summaries

### Layering within each module

```
routes -> controller -> service -> repository -> Prisma/DB
```

- **routes**: Express route definitions, wire HTTP to controllers only
- **controller**: parses/validates request, calls service, formats response. No business logic.
- **service**: business logic and orchestration. No direct Prisma/SQL — depends on repository interfaces.
- **repository**: all DB access (Prisma queries / raw SQL for metrics views). Implements an interface so it can be mocked in tests.

### Module rules

1. Modules communicate **only** through their exported service interfaces — never reach into another module's repository or internal types directly.
2. Shared code (DB client, config, error types, logging, common utils) lives in `src/shared/` and any module may depend on it.
3. No circular dependencies between modules.
4. Each module owns its Prisma models conceptually (even though they live in one `schema.prisma` for MVP simplicity).

### Folder structure

```
src/
  modules/
    github-sync/
      github-sync.routes.ts
      github-sync.controller.ts
      github-sync.service.ts
      github-sync.repository.ts
      github.client.ts          (Octokit wrapper)
      github-sync.types.ts
      __tests__/
    pull-requests/
      pull-requests.routes.ts
      pull-requests.controller.ts
      pull-requests.service.ts
      pull-requests.repository.ts
      pull-requests.types.ts
      __tests__/
    engineers/
      ... (same pattern)
    repositories/
      ... (same pattern)
  shared/
    db/            (Prisma client singleton)
    config/        (env loading/validation)
    errors/        (custom error classes, error middleware)
    middleware/
    utils/
  app.ts           (Express app setup, route mounting)
  server.ts        (entrypoint)
prisma/
  schema.prisma
  migrations/
tests/
  setup.ts
```

## 3. Coding Principles

- **SOLID**:
  - *Single Responsibility*: controllers parse/respond, services hold logic, repositories hold data access — never mix.
  - *Open/Closed*: add new metrics/sync sources by adding new functions/modules, not by editing unrelated logic.
  - *Liskov/Interface Segregation*: repositories implement small, focused interfaces (e.g., `IPullRequestRepository`) so services depend on abstractions.
  - *Dependency Inversion*: services receive repositories via constructor injection (simple manual DI, no heavy framework needed for MVP).
- **DRY**: shared logic (date math, pagination, error formatting) goes in `src/shared/utils`. Avoid duplicating Prisma queries — centralize in repositories.
- **No premature abstraction**: don't build generic provider adapters (GitLab, etc.) until a second provider is actually needed — keep `github-sync` concrete, but keep its interface narrow so a `gitlab-sync` module could implement the same service interface later.
- **Naming**: files/folders kebab-case, classes/types PascalCase, variables/functions camelCase.
- **Error handling**: throw typed errors from `src/shared/errors`; a single Express error-handling middleware converts them to HTTP responses. No silent catches.
- **Config**: all env vars validated at startup (e.g., via `zod`) in `src/shared/config` — fail fast if missing.

## 4. Testing

- **Framework**: Jest + ts-jest.
- **Unit tests**: every service has unit tests in its module's `__tests__/` folder, with repositories mocked (via the repository interface) — no real DB in unit tests.
- **Repository tests**: optional integration tests against a test Postgres instance (Docker), kept separate from unit tests (`*.integration.test.ts`).
- **Coverage focus**: prioritize metrics calculation logic and sync upsert logic — these are the highest-risk areas for production bugs.
- Run with `npm test` (unit only) and `npm run test:integration` (requires DB).

## 5. API Conventions

- All routes under `/api`.
- Responses: `{ data: ... }` for success, `{ error: { message, code } }` for failures.
- Pagination via `?page=&pageSize=` query params, returned as `{ data, meta: { page, pageSize, total } }`.

## 6. Future Microservices Path

Because each module is self-contained (own routes/controller/service/repository, communicates via interfaces), the extraction path is:
1. Move a module folder to its own service/repo.
2. Replace direct in-process service calls to that module with HTTP/queue calls behind the same interface.
3. Split `schema.prisma` models owned by that module into its own database/schema.

No rule in this document should be violated to "save time" — the modular structure is what keeps this path open.
