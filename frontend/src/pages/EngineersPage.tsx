import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { AsyncBoundary, Card, MetricStat, formatHours, formatNumber } from '../components/common';
import { useAsync } from '../hooks/useAsync';

function EngineerProfile({ username }: { username: string }) {
  const state = useAsync(() => api.getEngineer(username), [username]);

  return (
    <AsyncBoundary state={state}>
      {({ data: eng }) => {
        const chartData = [
          { name: 'Reviews given', value: eng.metrics.reviewLoadGiven },
          { name: 'Reviews received', value: eng.metrics.reviewLoadReceived },
          { name: 'PRs authored', value: eng.metrics.totalPullRequests },
          { name: 'PRs merged', value: eng.metrics.mergedPullRequests },
        ];

        return (
          <Card title={`${eng.displayName ?? eng.username} (@${eng.username})`}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
              <MetricStat label="PRs" value={eng.metrics.totalPullRequests} />
              <MetricStat label="Merged" value={eng.metrics.mergedPullRequests} />
              <MetricStat label="Avg cycle" value={formatHours(eng.metrics.avgCycleTimeHours)} />
              <MetricStat label="Median cycle" value={formatHours(eng.metrics.medianCycleTimeHours)} />
              <MetricStat label="Avg PR size" value={formatNumber(eng.metrics.avgPullRequestSize)} />
              <MetricStat label="Review load (given)" value={eng.metrics.reviewLoadGiven} />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        );
      }}
    </AsyncBoundary>
  );
}

export function EngineersPage() {
  const listState = useAsync(() => api.listEngineers(), []);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, alignItems: 'start' }}>
      <Card title="Engineers">
        <AsyncBoundary
          state={listState}
          emptyWhen={(d) => d.data.length === 0}
          emptyMessage="No engineers synced yet."
        >
          {(data) => (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.data.map((eng) => {
                const active = eng.username === selected;
                return (
                  <li key={eng.id}>
                    <button
                      onClick={() => setSelected(eng.username)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        border: 'none',
                        borderRadius: 6,
                        marginBottom: 4,
                        cursor: 'pointer',
                        background: active ? '#eef2ff' : 'transparent',
                        color: active ? '#4338ca' : '#1a1a2e',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {eng.displayName ?? eng.username}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </AsyncBoundary>
      </Card>

      {selected ? (
        <EngineerProfile username={selected} />
      ) : (
        <Card>
          <p style={{ color: '#6b7280', margin: 0 }}>Select an engineer to view their metrics.</p>
        </Card>
      )}
    </div>
  );
}
