# Walkthrough Script — PR Intelligence Platform (≤10 min)

A timed outline for the recorded walkthrough. Covers the four required points:
**problem understanding → proposed solution → architectural decisions → tradeoffs & priorities**,
ending with a short live demo.

> **Before recording — demo checklist**
> - Backend running: `cd backend && npm run dev` (Postgres up, data already synced)
> - Frontend running: `cd frontend && npm run dev` → http://localhost:5173
> - Have open in tabs: the dashboard, the architecture diagram (design doc §2), and the code editor.
> - Keep it conversational — these are talking points, not a script to read verbatim.

---

## 0. Intro — 20 sec

> "Hi, I'm [name]. I'll walk through my design for a **Pull Request Intelligence Platform** — a tool
> that pulls PR data from source control, computes quality metrics, and surfaces insights at both the
> pull-request and engineer level. I'll cover how I understood the problem, my proposed architecture,
> the key decisions, and the tradeoffs — then a quick demo of the working MVP."

---

## 1. Understanding of the problem — 1 min

> "The goal is to give engineering leads visibility into **process health** — not to rank people.
> So I framed it deliberately as a process-health dashboard, not a performance scoreboard.
>
> The brief is intentionally open, so I made my assumptions explicit:
> - **GitHub first**, but the data model is provider-agnostic so GitLab is a later adapter.
> - **'Quality metrics'** = process + change metrics — cycle time, review responsiveness, PR size,
>   comment density — *not* static code analysis, which is a separate CI concern.
> - **Near-real-time isn't required** for an MVP, so periodic/manual sync is fine; webhooks come later.
>
> I also listed open questions I'd ask stakeholders — multi-tenancy, configurable SLAs, GitLab priority."

*(On screen: design doc §1 — Assumptions & open questions)*

---

## 2. Proposed solution & architecture — 2.5 min

*(On screen: the architecture diagram, design doc §2)*

> "The flow is four stages: **Sync → Store → Serve → Visualize.**
> - A **sync service** uses Octokit to pull repos, PRs, reviews, comments, and commits.
> - It upserts them into **Postgres** — I chose Postgres because this is fundamentally an
>   analytics/aggregation problem and SQL is the right tool for metrics.
> - An **Express REST API** exposes PR-level, engineer-level, and repo-level metrics.
> - A **React dashboard** visualizes them.
>
> The backend is a **modular monolith**. It's one deployable app, but internally it's split into
> independent domain modules — `github-sync`, `pull-requests`, `engineers`, `repositories` — each
> with strict layering: **routes → controller → service → repository → DB**. Modules talk only through
> service interfaces, never reaching into each other's data layer.
>
> That gives me MVP simplicity now, but a clean **microservices extraction path** later: a module is a
> folder I can lift out and put behind HTTP without rewriting it."

*(On screen: briefly show the `src/modules/` folder structure)*

---

## 3. Major architectural decisions — 2 min

*(On screen: a `*.metrics.ts` file, then the test folder)*

> "Three decisions I want to highlight:
>
> **1. Metrics as pure functions.** All metric math lives in isolated, pure `*.metrics.ts` functions —
> separate from data access. This is the highest-risk logic, so I made it the easiest to test
> exhaustively. That's why there are ~48 unit tests with the database fully mocked — no DB needed to
> run them.
>
> **2. Dependency inversion.** Services depend on repository *interfaces*, injected via the constructor.
> So the service layer is tested against mocks, and swapping Prisma for raw SQL later touches one class.
>
> **3. Least-privilege by default.** The GitHub token is read-only — the sync only ever reads. Secrets
> are validated at startup with Zod and never logged; the error middleware never leaks internals."

---

## 4. Tradeoffs & priorities — 1.5 min

*(On screen: design doc §5 — tradeoffs table)*

> "I optimized for **proving the concept cleanly**, and was explicit about what I deferred:
> - **Polling/manual sync over webhooks** — webhooks need a public endpoint + a queue; not worth it to
>   prove the model. I built an optional cron sync and documented the webhook + BullMQ path for scale.
> - **App-layer metrics over SQL views** — I chose pure functions for testability; at scale I'd push hot
>   aggregations into materialized views refreshed after each sync.
> - **Single-tenant PAT over OAuth multi-tenant** — isolated upgrade path: swap the auth layer, add
>   org scoping.
>
> The through-line: every shortcut is **intentional and has a documented path to production** — monolith
> → sync worker + queue → webhooks → materialized metrics → multi-tenant."

---

## 5. Live demo — 2 min

*(On screen: the running dashboard at localhost:5173)*

> "Quickly, the working MVP against a real GitHub repo:
> - **Repositories tab** — repo summary metrics, and a **Sync now** button that ingests live from GitHub.
>   [click Sync now, show the count update]
> - **Pull Requests tab** — every PR with its size bucket, time-to-first-review, time-to-merge, review
>   count — all computed from real data.
> - **Engineers tab** — per-engineer process metrics: cycle time, throughput, and review load given vs.
>   received, with a chart. Again — framed as process health, not ranking."

*(If short on time, just show the PR table and one engineer profile.)*

---

## 6. Close — 20 sec

> "To summarize: a modular monolith that's simple to ship but built to scale, metrics isolated and
> heavily tested, and every tradeoff deliberate with a clear production path. The AI insight layer —
> PR summarization and risk scoring on top of the deterministic metrics — is the natural next step.
> Thanks for watching."

---

### Timing summary

| Section | Target |
|---|---|
| Intro | 0:20 |
| Problem understanding | 1:00 |
| Solution & architecture | 2:30 |
| Architectural decisions | 2:00 |
| Tradeoffs & priorities | 1:30 |
| Live demo | 2:00 |
| Close | 0:20 |
| **Total** | **~9:40** |
