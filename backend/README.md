# PR Intelligence Platform — Backend

Node.js + Express (TypeScript) API and GitHub sync service for the PR Intelligence Platform.
Built as a **modular monolith**: each domain module owns its `routes → controller → service → repository`
layering and communicates only through service interfaces. See [../CLAUDE.md](../CLAUDE.md) for the full
architecture and conventions.

## Stack

- Node.js + Express (TypeScript)
- PostgreSQL + Prisma (ORM + migrations)
- Octokit (GitHub REST API)
- Jest + ts-jest (unit tests)
- Zod (env validation)

## Modules

| Module | Responsibility |
|---|---|
| `github-sync` | Pulls repos/PRs/reviews/comments/commits from GitHub and upserts them |
| `pull-requests` | PR read APIs + PR-level metrics (cycle time, size, comment density) |
| `engineers` | Engineer profiles + engineer-level aggregations (throughput, review load) |
| `repositories` | Repo-level summaries |

## Setup

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL + GitHub values
npm run prisma:migrate    # apply schema to your Postgres instance
npm run prisma:generate   # generate the Prisma client
```

### Environment (`.env`)

| Var | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `PORT` | API port (default 4000) |
| `GITHUB_TOKEN` | GitHub PAT (read-only repo scope) |
| `GITHUB_ORG` | Org/owner to sync from |
| `GITHUB_REPOS` | Comma-separated repo names to sync |

## Running

```bash
npm run dev      # ts-node-dev with reload
npm run build    # compile to dist/
npm start        # run compiled dist/server.js
npm test         # unit tests (no DB required — repositories are mocked)
```

## API

All routes are under `/api`. Success: `{ data, meta? }`. Failure: `{ error: { message, code } }`.
List endpoints accept `?page=&pageSize=`.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/api/github/sync` | Trigger a sync of the configured repos |
| GET | `/api/pull-requests` | List PRs with metrics (`?repositoryId=&author=`) |
| GET | `/api/pull-requests/:id` | Single PR with metrics |
| GET | `/api/engineers` | List engineers |
| GET | `/api/engineers/:username` | Engineer profile with aggregated metrics |
| GET | `/api/repositories` | List repositories |
| GET | `/api/repositories/:id/summary` | Repository summary metrics |

## Testing strategy

- **Unit tests** live in each module's `__tests__/` folder; repositories are mocked via their interfaces,
  so no DB is needed. Coverage prioritizes the metrics-calculation logic (the highest-risk area).
- Metric math is isolated into pure functions (`*.metrics.ts`) for fast, exhaustive testing.
