import { EngineerMetrics, EngineerMetricsSource } from './engineers.types';

const MS_PER_HOUR = 1000 * 60 * 60;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return round2(sum / values.length);
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return round2((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return round2(sorted[mid]);
}

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
