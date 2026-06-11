import { ReactNode } from 'react';
import { AsyncState } from '../hooks/useAsync';

/** Renders loading / error / empty states around async data, or the children when loaded. */
export function AsyncBoundary<T>({
  state,
  children,
  emptyWhen,
  emptyMessage = 'No data yet.',
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
  emptyWhen?: (data: T) => boolean;
  emptyMessage?: string;
}) {
  if (state.loading) return <p style={{ color: '#6b7280' }}>Loading…</p>;
  if (state.error) return <p style={{ color: '#dc2626' }}>Error: {state.error}</p>;
  if (!state.data) return <p style={{ color: '#6b7280' }}>{emptyMessage}</p>;
  if (emptyWhen && emptyWhen(state.data)) return <p style={{ color: '#6b7280' }}>{emptyMessage}</p>;
  return <>{children(state.data)}</>;
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        marginBottom: 16,
      }}
    >
      {title && <h3 style={{ margin: '0 0 12px' }}>{title}</h3>}
      {children}
    </div>
  );
}

export function MetricStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ minWidth: 130 }}>
      <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const bucketColors: Record<string, string> = {
  XS: '#16a34a',
  S: '#65a30d',
  M: '#ca8a04',
  L: '#ea580c',
  XL: '#dc2626',
};

export function SizeBadge({ bucket }: { bucket: string }) {
  return (
    <span
      style={{
        background: bucketColors[bucket] ?? '#6b7280',
        color: '#fff',
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {bucket}
    </span>
  );
}

export function StateBadge({ state }: { state: string }) {
  const color = state === 'merged' ? '#7c3aed' : state === 'open' ? '#2563eb' : '#6b7280';
  return (
    <span style={{ color, fontWeight: 600, textTransform: 'capitalize' }}>{state}</span>
  );
}

/** Formats an hours value (or null) into a compact human string. */
export function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function formatNumber(value: number | null, suffix = ''): string {
  if (value === null) return '—';
  return `${value}${suffix}`;
}
