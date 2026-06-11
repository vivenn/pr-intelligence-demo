# PR Intelligence Platform — Frontend

React (Vite + TypeScript) dashboard for the PR Intelligence Platform. Consumes the backend REST API
and visualizes PR-level, engineer-level, and repository-level metrics.

## Stack

- React 18 + TypeScript
- Vite (dev server + build)
- React Router (hash routing)
- Recharts (charts)

## Views

| Route | View |
|---|---|
| `/repositories` | Repo summaries + a **Sync now** button to trigger ingestion |
| `/pull-requests` | PR table with size buckets, review/merge timing, review counts |
| `/engineers` | Engineer list + per-engineer metric profile with a bar chart |

## Setup & running

The backend must be running on `http://localhost:4000` (Vite proxies `/api` to it — see `vite.config.ts`).

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
```

## Structure

```
src/
  api/
    client.ts     typed fetch wrappers for each endpoint
    types.ts      DTOs mirroring the backend responses
  components/
    common.tsx    shared UI (cards, badges, stat tiles, async boundary, formatters)
  hooks/
    useAsync.ts   loading/error/data hook for async loaders
  pages/
    RepositoriesPage.tsx
    PullRequestsPage.tsx
    EngineersPage.tsx
  App.tsx         layout + routing
  main.tsx        entry point
```
