# Walkthrough Speech — PR Intelligence Platform

A word-for-word script for the ≤10-minute recording. **`[SHOW: …]`** lines tell you what to put
on screen at that moment; the **>** lines are what to say. Speak naturally — paraphrasing is fine.

---

## ⏱️ Before you hit record — setup checklist
- [ ] Backend running (`cd backend && npm run dev`) — data already synced
- [ ] Frontend running (`cd frontend && npm run dev`) → http://localhost:5173
- [ ] Tabs/windows ready in this order:
  1. The browser dashboard (http://localhost:5173)
  2. `DIAGRAMS.md` open in **VS Code Preview** (Mermaid rendered)
  3. `PR-Intelligence-Platform-Design.md` open
  4. VS Code file explorer showing the `backend/src/modules` folder
- [ ] Close noisy apps / notifications. Do one dry run with a timer first.

---

## 0 · Intro — 0:00–0:25  (~25 sec)

**[SHOW: your face cam, or the dashboard home screen]**

> "Hi, I'm [your name]. This is my walkthrough for the Pull Request Intelligence Platform.
> I'll cover four things: how I understood the problem, the solution and architecture I chose,
> the major engineering decisions and trade-offs, and then a short live demo of the working build.
> I built a full working MVP — backend, database, and dashboard — so I'll keep the talking tight
> and let the product speak."

---

## 1 · Understanding the problem — 0:25–1:25  (~1 min)

**[SHOW: the design doc, section 1 — "Understanding & Assumptions"]**

> "The brief is intentionally open, so the first thing I did was frame it and write down assumptions.
>
> My key framing decision: this is a **process-health tool, not a performance-ranking tool**. The same
> data could be used to rank engineers, and I deliberately designed against that — metrics are presented
> as team and repository trends, not leaderboards.
>
> My main assumptions: **GitHub first**, but with a provider-agnostic design so GitLab can be added later.
> 'Quality metrics' I interpreted as **process and change metrics** — cycle time, review responsiveness,
> PR size, comment density — *not* static code analysis, which is a separate CI concern. And I assumed
> **near-real-time isn't required** for an MVP, so periodic or on-demand sync is fine; webhooks come later.
>
> I also listed the open questions I'd ask stakeholders — multi-tenancy, configurable SLAs, and data-privacy
> constraints on engineer-level data."

---

## 2 · Solution & architecture — 1:25–3:55  (~2.5 min)

**[SHOW: DIAGRAMS.md → Diagram 1, System Architecture]**

> "Here's the architecture. The flow is four stages: **sync, store, serve, visualize.**
>
> A **sync service** uses Octokit to pull repositories, pull requests, reviews, comments, and commits
> from GitHub, and upserts them into **PostgreSQL**. I chose Postgres because this is fundamentally an
> analytics and aggregation problem, and SQL is the right tool for that. An **Express REST API** serves
> PR-level, engineer-level, and repository-level metrics, and a **React dashboard** visualizes them."

**[SHOW: VS Code explorer → backend/src/modules folder (github-sync, pull-requests, engineers, repositories)]**

> "The backend is a **modular monolith**. It's one deployable app, but internally it's split into four
> independent domain modules — github-sync, pull-requests, engineers, and repositories. One app is simple
> to build and deploy for an MVP, but because each module is self-contained, the path to microservices later
> is just moving a folder — not a rewrite."

**[SHOW: DIAGRAMS.md → Diagram 2, Module Layering]**

> "Inside every module the layering is strict: **routes → controller → service → repository → database.**
> Controllers validate and format, services hold the business logic, repositories own all data access.
> Crucially, services depend on repository **interfaces**, not concrete classes — that's what lets me unit-test
> the logic with the database mocked out."

**[SHOW: DIAGRAMS.md → Diagram 4, Data Model (ER)]**

> "The data model is straightforward — repositories have pull requests, which have reviews, comments, and
> commits. Engineers are derived from the author and reviewer logins across all of that."

---

## 3 · Major engineering decisions — 3:55–5:55  (~2 min)

**[SHOW: DIAGRAMS.md → Diagram 5, Metrics Layer — then optionally a `*.metrics.ts` file]**

> "Three decisions I want to highlight.
>
> **First — metrics as pure functions.** All the metric math lives in isolated pure functions, completely
> separate from data access. This is the highest-risk logic in the system, so I made it the easiest thing
> to test. That's why there are **71 unit tests** that run with no database at all."

**[SHOW: briefly, the terminal output of `npm test` showing 71 passing — optional but powerful]**

> "**Second — correctness in the metrics themselves.** One example: I exclude **self-reviews**. If an author
> reviews their own pull request, GitHub records that as a review, but it isn't peer review — so I filter it
> out of review counts and time-to-first-review. Small detail, but it's the difference between a number that's
> right and one that's misleading."

**[SHOW: DIAGRAMS.md → Diagram 3, Sync Flow sequence]**

> "**Third — a defensible sync.** The manual sync returns **202 immediately** and runs in the background,
> so a large sync never blocks the API. Syncs are **incremental** — I store a per-repo watermark and only
> re-fetch pull requests updated since the last sync. And the GitHub token is **read-only**, least-privilege
> by design. Secrets are validated at startup and never logged."

---

## 4 · Trade-offs & priorities — 5:55–7:25  (~1.5 min)

**[SHOW: the design doc, section 5 — the trade-offs table]**

> "I optimized for proving the concept cleanly, and I was explicit about what I deferred.
>
> **Polling and manual sync over webhooks** — webhooks need a public endpoint and a queue; not worth it to
> prove the model, but I documented that as the next step, and I added an optional cron schedule.
>
> **Application-layer metrics over SQL views** — I chose pure functions for testability; at scale I'd push
> the hot aggregations into materialized views refreshed after each sync.
>
> **Single-tenant with an API key over full multi-tenant auth** — the engineer data is sensitive, so I added
> optional API-key protection now, with OAuth and org-scoping as a clean, isolated upgrade.
>
> The through-line is that every shortcut is **intentional and has a documented path to production** —
> monolith, then a separate sync worker and queue, then webhooks, then materialized metrics, then multi-tenant."

---

## 5 · Live demo — 7:25–9:25  (~2 min)

**[SHOW: the browser → Repositories tab]**

> "Now the working build, against a real GitHub repository.
>
> This is the **Repositories** view — the executive summary. Total PRs, merged versus open, average cycle
> time, review and comment counts. Below that is a **throughput trend** — pull requests merged per week —
> and the **size distribution** and **state breakdown** charts. This is what makes it 'intelligence' and not
> just a table of numbers."

**[SHOW: click "Sync now" → point at the "Sync started…" message]**

> "The **Sync now** button triggers ingestion — it returns immediately and the sync runs in the background;
> the UI polls until it's done."

**[SHOW: Pull Requests tab]**

> "The **Pull Requests** view lists every PR with its computed metrics — size bucket, time to first review,
> time to merge, review count. The titles link straight to the PR on GitHub."

**[SHOW: Engineers tab → click an engineer]**

> "And **Engineers** — each engineer's process metrics: cycle time, throughput, and review load given versus
> received, with a chart. One honest note: this demo repo is single-author, so peer-review numbers are zero —
> which is *correct*, because the platform distinguishes peer review from self-review. On a real team these
> light up."

---

## 6 · Close — 9:25–9:55  (~30 sec)

**[SHOW: DIAGRAMS.md → Diagram 1 again, or your face cam]**

> "To summarize: a modular monolith that's simple to ship but structured to scale, metrics isolated and
> heavily tested, and every trade-off deliberate with a clear path to production. The natural next step is
> the **AI insight layer** — PR summarization and risk scoring on top of these deterministic metrics, kept
> hybrid so it stays cheap and explainable. Thanks for watching."

---

## Timing summary

| Section | Window | Target |
|---|---|---|
| Intro | 0:00–0:25 | 0:25 |
| Problem understanding | 0:25–1:25 | 1:00 |
| Solution & architecture | 1:25–3:55 | 2:30 |
| Engineering decisions | 3:55–5:55 | 2:00 |
| Trade-offs | 5:55–7:25 | 1:30 |
| Live demo | 7:25–9:25 | 2:00 |
| Close | 9:25–9:55 | 0:30 |
| **Total** | | **~9:55** |

**If you run long, cut here first:** trim the demo to just Repositories + one engineer (saves ~45s), and
drop the ER diagram mention in section 2.
