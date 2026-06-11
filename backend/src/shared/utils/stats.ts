export function round2(value: number): number {
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
