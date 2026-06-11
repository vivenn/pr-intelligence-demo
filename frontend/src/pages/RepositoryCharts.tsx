import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client';
import { SizeBucket } from '../api/types';
import { AsyncBoundary } from '../components/common';
import { useAsync } from '../hooks/useAsync';

const SIZE_ORDER: SizeBucket[] = ['XS', 'S', 'M', 'L', 'XL'];

const sizeColors: Record<SizeBucket, string> = {
  XS: '#16a34a',
  S: '#65a30d',
  M: '#ca8a04',
  L: '#ea580c',
  XL: '#dc2626',
};

const stateColors: Record<string, string> = {
  merged: '#7c3aed',
  open: '#2563eb',
  closed: '#6b7280',
};

/** Fetches the repository's PRs and renders size-distribution and state-breakdown charts. */
export function RepositoryCharts({ repoId }: { repoId: string }) {
  const state = useAsync(() => api.listPullRequests({ repositoryId: repoId, pageSize: 100 }), [repoId]);

  return (
    <AsyncBoundary
      state={state}
      emptyWhen={(d) => d.data.length === 0}
      emptyMessage="No pull requests to chart yet."
    >
      {(data) => {
        const prs = data.data;

        const sizeData = SIZE_ORDER.map((bucket) => ({
          bucket,
          count: prs.filter((pr) => pr.metrics.sizeBucket === bucket).length,
        }));

        const stateCounts = prs.reduce<Record<string, number>>((acc, pr) => {
          acc[pr.state] = (acc[pr.state] ?? 0) + 1;
          return acc;
        }, {});
        const stateData = Object.entries(stateCounts).map(([name, value]) => ({ name, value }));

        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>PR size distribution</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sizeData}>
                  <XAxis dataKey="bucket" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {sizeData.map((d) => (
                      <Cell key={d.bucket} fill={sizeColors[d.bucket]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>PR state breakdown</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stateData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                    {stateData.map((d) => (
                      <Cell key={d.name} fill={stateColors[d.name] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
