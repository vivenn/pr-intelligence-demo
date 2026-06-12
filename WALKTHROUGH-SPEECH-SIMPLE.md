# Walkthrough Speech — Simple Version

Short, simple sentences. Easy to read out loud. **`[SHOW: …]`** = what to put on the screen.
The **>** lines are what you say.

---

## 0 · Intro  (~20 sec)

**[SHOW: your face, or the dashboard]**

> "Hi, I'm [your name].
> This is my Pull Request Intelligence Platform.
> I will explain four things: the problem, my solution, my main decisions, and the trade-offs.
> Then I will show a quick live demo.
> I built a full working app — backend, database, and dashboard."

---

## 1 · The problem  (~1 min)

**[SHOW: the design doc — Section 1]**

> "First, the problem.
> The goal is to collect pull request data from GitHub and show useful metrics.
> Both for each pull request, and for each engineer.
>
> My most important decision is this: I treat it as a **health check for the team's process**.
> It is **not** a tool to rank people. That framing guided everything.
>
> My main assumptions:
> - I start with **GitHub**, but the design can support GitLab later.
> - 'Quality metrics' means things like review time, PR size, and comments — not code analysis.
> - Real-time is not needed for an MVP, so I sync on demand or on a schedule.
>
> I also wrote down open questions I would ask the team, like multi-tenancy and data privacy."

---

## 2 · The solution and architecture  (~2.5 min)

**[SHOW: DIAGRAMS.md — Diagram 1, System Architecture]**

> "Here is the architecture. It has four steps: **sync, store, serve, show.**
>
> A sync service pulls data from GitHub using Octokit.
> It saves the data into **PostgreSQL**. I picked Postgres because this is a data and metrics problem, and SQL is good for that.
> An **Express API** serves the metrics.
> And a **React dashboard** shows them."

**[SHOW: VS Code — the backend/src/modules folder]**

> "The backend is a **modular monolith**.
> That means it is one app, but inside it is split into four parts: github-sync, pull-requests, engineers, and repositories.
> One app is simple to run for an MVP.
> But each part is separate, so later I can split it into microservices easily."

**[SHOW: DIAGRAMS.md — Diagram 2, Module Layering]**

> "Inside each part, the structure is always the same:
> **routes, then controller, then service, then repository, then database.**
> The controller checks the input. The service holds the logic. The repository talks to the database.
> The service depends on an interface, so I can test it without a real database."

**[SHOW: DIAGRAMS.md — Diagram 4, Data Model]**

> "The data model is simple.
> A repository has pull requests.
> A pull request has reviews, comments, and commits.
> Engineers come from the author and reviewer names."

---

## 3 · My main decisions  (~2 min)

**[SHOW: DIAGRAMS.md — Diagram 5, Metrics Layer]**

> "Three decisions I am proud of.
>
> **One — metrics are pure functions.**
> All the metric math is in small, separate functions.
> This is the most important logic, so I made it the easiest to test.
> I have **71 unit tests**, and they run with no database."

**[SHOW: the terminal showing 71 tests passing — optional]**

> "**Two — the metrics are correct.**
> For example, I remove **self-reviews**.
> If you review your own pull request, that is not real peer review.
> So I do not count it. This keeps the numbers honest."

**[SHOW: DIAGRAMS.md — Diagram 3, Sync Flow]**

> "**Three — the sync is smart.**
> When you click sync, the API answers right away and does the work in the background.
> So it never blocks.
> And the sync is **incremental** — it only fetches pull requests that changed since last time.
> Also, the GitHub token is **read-only**, for safety."

---

## 4 · Trade-offs  (~1.5 min)

**[SHOW: the design doc — Section 5, the trade-offs table]**

> "I kept the MVP simple on purpose. Here are my main trade-offs.
>
> **Polling instead of webhooks.**
> Webhooks need extra setup. Polling is simpler for now. I added an optional schedule, and webhooks are the next step.
>
> **Metrics in code instead of SQL views.**
> Code is easier to test. At large scale, I would move heavy metrics into the database.
>
> **One tenant with an API key instead of full login.**
> Engineer data is sensitive, so I added optional key protection now. Full auth is a later step.
>
> The key point: every shortcut is on purpose, and each one has a clear path to grow."

---

## 5 · Live demo  (~2 min)

**[SHOW: browser — Repositories tab]**

> "Now the live app.
> This is the **Repositories** page. It is the summary.
> You can see total PRs, merged and open, average cycle time, reviews, and comments.
> Below are charts: a **trend** of PRs merged per week, the **size** of PRs, and their **state**.
> This is what makes it feel like real insight, not just numbers."

**[SHOW: click "Sync now"]**

> "This is the **Sync now** button. It starts the sync in the background and updates when it is done."

**[SHOW: Pull Requests tab]**

> "This is the **Pull Requests** page.
> Every PR has its metrics — size, review time, merge time.
> You can click a title to open it on GitHub."

**[SHOW: Engineers tab — click one engineer]**

> "And this is the **Engineers** page.
> Each engineer has their own metrics and a chart.
> One honest note: this demo repo has one author, so peer-review numbers are zero.
> That is correct — because I separate peer reviews from self-reviews."

---

## 6 · Closing  (~20 sec)

**[SHOW: DIAGRAMS.md — Diagram 1, or your face]**

> "To finish:
> the app is simple to run, but built to scale.
> The metrics are tested and correct.
> And every decision is clear.
> The next step is an **AI layer** for summaries and risk scores, on top of these metrics.
> Thank you for watching."

---

## Timing (about 10 minutes)

| Part | Time |
|---|---|
| Intro | 0:20 |
| Problem | 1:00 |
| Architecture | 2:30 |
| Decisions | 2:00 |
| Trade-offs | 1:30 |
| Demo | 2:00 |
| Closing | 0:20 |

**If you are running long:** show only the Repositories page and one engineer in the demo.
