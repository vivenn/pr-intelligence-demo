# PR Intelligence Platform — Diagrams

> Mermaid diagrams. They render automatically on GitHub and in VS Code (install the
> "Markdown Preview Mermaid Support" extension, then open Preview). For the video you can
> screenshot the rendered diagrams or share this file in Preview mode.

---

## 1. System Architecture (high level)

The four-stage flow: **Sync → Store → Serve → Visualize.**

```mermaid
flowchart TB
    GH["GitHub REST API"]

    subgraph Backend["Express Modular Monolith (TypeScript)"]
        direction TB
        SYNC["github-sync module<br/>(Octokit · manual + cron · incremental)"]
        PR["pull-requests module<br/>(PR metrics)"]
        ENG["engineers module<br/>(engineer metrics)"]
        REPO["repositories module<br/>(repo summary + trends)"]
    end

    DB[("PostgreSQL<br/>repos · PRs · reviews<br/>comments · commits · engineers")]
    API["REST API  /api/*<br/>(zod-validated · optional API key)"]
    UI["React Dashboard (Vite)<br/>tables · charts · sync"]

    GH -->|"upsert raw data"| SYNC
    SYNC --> DB
    DB --> PR
    DB --> ENG
    DB --> REPO
    PR --> API
    ENG --> API
    REPO --> API
    API --> UI

    AI["AI Insight Worker<br/>(future: summaries · risk scoring)"]:::future
    DB -.->|"pre-aggregated metrics"| AI
    AI -.-> API

    classDef future stroke-dasharray: 5 5,fill:#f5f5f5,color:#666;
```

---

## 2. Internal Module Layering (same in every module)

Strict one-way dependency flow — this is what keeps modules testable and swappable.

```mermaid
flowchart LR
    R["routes<br/>(HTTP wiring)"] --> C["controller<br/>(validate + format)"]
    C --> S["service<br/>(business logic)"]
    S --> RP["repository<br/>(data access)"]
    RP --> DB[("Prisma / DB")]

    S -. "depends on interface,<br/>not concrete class" .-> RP
```

---

## 3. Sync Flow (async + incremental)

Why the manual sync returns instantly and why repeat syncs are cheap.

```mermaid
sequenceDiagram
    participant U as User / Cron
    participant C as Sync Controller
    participant S as Sync Service
    participant G as GitHub (Octokit)
    participant DB as PostgreSQL

    U->>C: POST /api/github/sync
    C-->>U: 202 Accepted (status: running)
    Note over C,S: runs in background — request never blocks

    C->>S: syncAll()
    S->>DB: read lastSyncedAt (watermark)
    S->>G: list PRs updated since watermark
    G-->>S: PRs + reviews + comments + commits
    loop per pull request
        S->>DB: upsert PR + replace details
    end
    S->>DB: advance lastSyncedAt
    Note over U,C: client polls GET /api/github/sync/status → completed
```

---

## 4. Data Model

```mermaid
erDiagram
    Repository ||--o{ PullRequest : "has"
    PullRequest ||--o{ Review : "has"
    PullRequest ||--o{ ReviewComment : "has"
    PullRequest ||--o{ Commit : "has"
    Engineer }o..o{ PullRequest : "authored / reviewed (by login)"

    Repository {
        string id PK
        string externalId
        string fullName
        datetime lastSyncedAt
    }
    PullRequest {
        string id PK
        int number
        string authorLogin
        string state
        string url
        datetime mergedAt
        int additions
        int deletions
    }
    Review {
        string reviewerLogin
        string state
        datetime submittedAt
    }
    ReviewComment {
        string authorLogin
        datetime createdAt
    }
    Commit {
        string sha
        string authorLogin
    }
    Engineer {
        string username
        string displayName
    }
```

---

## 5. Metrics Layer (pure functions)

Metric math is isolated from data access — the highest-risk logic, made the easiest to test.

```mermaid
flowchart LR
    DB[("rows from repository")] --> M["*.metrics.ts<br/>pure functions"]
    M --> PRM["PR metrics<br/>cycle time · size · comment density"]
    M --> ENGM["Engineer metrics<br/>throughput · review load · cycle time"]
    M --> REPOM["Repo metrics<br/>state mix · size dist · weekly throughput"]

    M -. "no DB, no I/O →<br/>71 unit tests" .-> T["Jest"]
```
