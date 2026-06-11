import { api } from '../api/client';
import { AsyncBoundary, Card, SizeBadge, StateBadge, formatHours, formatNumber } from '../components/common';
import { useAsync } from '../hooks/useAsync';

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
};

const td: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #f1f1f4', fontSize: 14 };

export function PullRequestsPage() {
  const state = useAsync(() => api.listPullRequests({ pageSize: 50 }), []);

  return (
    <Card title="Pull Requests">
      <AsyncBoundary state={state} emptyWhen={(d) => d.data.length === 0} emptyMessage="No pull requests synced yet.">
        {(data) => (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Title</th>
                <th style={th}>Author</th>
                <th style={th}>State</th>
                <th style={th}>Size</th>
                <th style={th}>Lines</th>
                <th style={th}>1st Review</th>
                <th style={th}>Merge</th>
                <th style={th}>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((pr) => (
                <tr key={pr.id}>
                  <td style={td}>{pr.number}</td>
                  <td style={td}>
                    {pr.url ? (
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {pr.title} ↗
                      </a>
                    ) : (
                      pr.title
                    )}
                  </td>
                  <td style={td}>{pr.authorLogin}</td>
                  <td style={td}>
                    <StateBadge state={pr.state} />
                  </td>
                  <td style={td}>
                    <SizeBadge bucket={pr.metrics.sizeBucket} />
                  </td>
                  <td style={td}>{pr.metrics.linesChanged}</td>
                  <td style={td}>{formatHours(pr.metrics.timeToFirstReviewHours)}</td>
                  <td style={td}>{formatHours(pr.metrics.timeToMergeHours)}</td>
                  <td style={td}>{formatNumber(pr.metrics.reviewCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AsyncBoundary>
    </Card>
  );
}
