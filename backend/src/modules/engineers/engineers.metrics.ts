import { average, median, round2 } from '../../shared/utils/stats';
import { EngineerMetrics, EngineerMetricsSource } from './engineers.types';

const MS_PER_HOUR = 1000 * 60 * 60;

export function cycleTimeHours(createdAt: Date, mergedAt: Date): number {
  return round2((mergedAt.getTime() - createdAt.getTime()) / MS_PER_HOUR);
}

export function computeEngineerMetrics(source: EngineerMetricsSource): EngineerMetrics {
  const { authoredPullRequests } = source;

  const mergedPrs = authoredPullRequests.filter((pr) => pr.mergedAt !== null);
  const cycleTimes = mergedPrs.map((pr) => cycleTimeHours(pr.createdAt, pr.mergedAt as Date));
  const prSizes = authoredPullRequests.map((pr) => pr.additions + pr.deletions);

  return {
    totalPullRequests: authoredPullRequests.length,
    mergedPullRequests: mergedPrs.length,
    avgCycleTimeHours: average(cycleTimes),
    medianCycleTimeHours: median(cycleTimes),
    avgPullRequestSize: average(prSizes),
    reviewLoadGiven: source.reviewsGivenCount,
    reviewLoadReceived: source.reviewsReceivedCount,
  };
}
