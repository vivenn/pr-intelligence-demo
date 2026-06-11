# Metrics Reference

This document describes the metrics computed by the PR Intelligence Platform. Metrics are
split into three levels: pull-request, engineer, and repository.

## PR-level metrics

| Metric | Definition |
|---|---|
| `timeToFirstReviewHours` | Hours from PR creation to the earliest review submission. `null` if never reviewed. |
| `timeToMergeHours` | Hours from PR creation to merge. `null` if not merged. |
| `reviewCount` | Number of review submissions on the PR. |
| `commentCount` | Number of review comments on the PR. |
| `linesChanged` | `additions + deletions`. |
| `changedFiles` | Number of files touched. |
| `sizeBucket` | XS (<10), S (<50), M (<250), L (<1000), XL (≥1000) lines changed. |
| `commentDensity` | Comments per 100 lines changed. `null` when no lines changed. |

## Engineer-level metrics

| Metric | Definition |
|---|---|
| `totalPullRequests` | PRs authored by the engineer. |
| `mergedPullRequests` | Authored PRs that were merged. |
| `avgCycleTimeHours` | Mean creation→merge time over merged PRs. |
| `medianCycleTimeHours` | Median creation→merge time over merged PRs. |
| `avgPullRequestSize` | Mean lines changed across authored PRs. |
| `reviewLoadGiven` | Reviews this engineer submitted. |
| `reviewLoadReceived` | Reviews received on this engineer's PRs. |

## Repository-level metrics

| Metric | Definition |
|---|---|
| `totalPullRequests` | All PRs in the repository. |
| `mergedPullRequests` | Merged PRs. |
| `openPullRequests` | PRs still open. |
| `avgCycleTimeHours` | Mean creation→merge time over merged PRs. |
| `avgPullRequestSize` | Mean lines changed across all PRs. |
| `totalReviews` | All review submissions in the repository. |
| `totalComments` | All review comments in the repository. |

## Notes on interpretation

These metrics are designed as **process-health indicators**, not individual performance
rankings. Cycle time and review-load metrics are most useful when viewed as team-level
trends over time rather than point-in-time comparisons between engineers.
