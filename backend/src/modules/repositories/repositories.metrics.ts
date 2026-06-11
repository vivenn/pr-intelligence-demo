import { average } from '../../shared/utils/stats';
import { RepositorySummaryMetrics, RepositorySummarySource, WeeklyThroughputPoint } from './repositories.types';

const MS_PER_HOUR = 1000 * 60 * 60;

/** ISO date (YYYY-MM-DD) of the Monday of the week containing `date`, in UTC. */
export function weekStart(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun .. 6=Sat
  const shiftToMonday = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + shiftToMonday);
  return d.toISOString().slice(0, 10);
}

/** Counts merged PRs grouped by the week they were merged, ascending by week. */
export function computeThroughputByWeek(
  pullRequests: { mergedAt: Date | null }[],
): WeeklyThroughputPoint[] {
  const counts = new Map<string, number>();

  for (const pr of pullRequests) {
    if (!pr.mergedAt) continue;
    const week = weekStart(pr.mergedAt);
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([week, merged]) => ({ week, merged }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export function computeRepositorySummary(source: RepositorySummarySource): RepositorySummaryMetrics {
  const { pullRequests } = source;

  const mergedPrs = pullRequests.filter((pr) => pr.mergedAt !== null);
  const openPrs = pullRequests.filter((pr) => pr.state === 'open');

  const cycleTimes = mergedPrs.map(
    (pr) => ((pr.mergedAt as Date).getTime() - pr.createdAt.getTime()) / MS_PER_HOUR,
  );
  const prSizes = pullRequests.map((pr) => pr.additions + pr.deletions);

  return {
    totalPullRequests: pullRequests.length,
    mergedPullRequests: mergedPrs.length,
    openPullRequests: openPrs.length,
    avgCycleTimeHours: average(cycleTimes),
    avgPullRequestSize: average(prSizes),
    totalReviews: source.reviewCount,
    totalComments: source.commentCount,
    throughputByWeek: computeThroughputByWeek(pullRequests),
  };
}
