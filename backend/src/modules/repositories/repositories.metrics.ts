import { average } from '../../shared/utils/stats';
import { RepositorySummaryMetrics, RepositorySummarySource } from './repositories.types';

const MS_PER_HOUR = 1000 * 60 * 60;

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
  };
}
