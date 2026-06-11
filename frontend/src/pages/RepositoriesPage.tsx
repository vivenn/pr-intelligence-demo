import { useState } from 'react';
import { api } from '../api/client';
import { AsyncBoundary, Card, MetricStat, formatHours, formatNumber } from '../components/common';
import { useAsync } from '../hooks/useAsync';
import { RepositoryCharts } from './RepositoryCharts';

function RepositorySummary({ id }: { id: string }) {
  const state = useAsync(() => api.getRepositorySummary(id), [id]);

  return (
    <AsyncBoundary state={state}>
      {({ data: repo }) => (
        <Card title={repo.fullName}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <MetricStat label="Total PRs" value={repo.metrics.totalPullRequests} />
            <MetricStat label="Merged" value={repo.metrics.mergedPullRequests} />
            <MetricStat label="Open" value={repo.metrics.openPullRequests} />
            <MetricStat label="Avg cycle" value={formatHours(repo.metrics.avgCycleTimeHours)} />
            <MetricStat label="Avg PR size" value={formatNumber(repo.metrics.avgPullRequestSize)} />
            <MetricStat label="Reviews" value={repo.metrics.totalReviews} />
            <MetricStat label="Comments" value={repo.metrics.totalComments} />
          </div>
          <RepositoryCharts repoId={repo.id} />
        </Card>
      )}
    </AsyncBoundary>
  );
}

export function RepositoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const listState = useAsync(() => api.listRepositories(), [refreshKey]);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage('Sync started…');
    try {
      await api.triggerSync(); // returns 202 immediately; sync runs in the background

      // Poll the status endpoint until the background sync finishes.
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const { data: state } = await api.getSyncStatus();

        if (state.status === 'completed') {
          const total = (state.result ?? []).reduce((sum, r) => sum + r.pullRequestsSynced, 0);
          setSyncMessage(`Synced ${state.result?.length ?? 0} repo(s), ${total} pull request(s).`);
          setRefreshKey((k) => k + 1);
          break;
        }
        if (state.status === 'failed') {
          setSyncMessage(`Sync failed: ${state.error ?? 'unknown error'}`);
          break;
        }
      }
    } catch (err) {
      setSyncMessage(`Sync failed: ${(err as Error).message}`);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: syncing ? 'default' : 'pointer',
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
        {syncMessage && <span style={{ color: '#6b7280', fontSize: 14 }}>{syncMessage}</span>}
      </div>

      <AsyncBoundary
        state={listState}
        emptyWhen={(d) => d.data.length === 0}
        emptyMessage="No repositories synced yet. Click “Sync now” to ingest data."
      >
        {(data) => <>{data.data.map((repo) => <RepositorySummary key={repo.id} id={repo.id} />)}</>}
      </AsyncBoundary>
    </div>
  );
}
