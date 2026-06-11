import { NavLink, Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { EngineersPage } from './pages/EngineersPage';
import { PullRequestsPage } from './pages/PullRequestsPage';
import { RepositoriesPage } from './pages/RepositoriesPage';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 6,
  textDecoration: 'none',
  fontWeight: 600,
  color: isActive ? '#4338ca' : '#475569',
  background: isActive ? '#eef2ff' : 'transparent',
});

export function App() {
  return (
    <Router>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 4px' }}>PR Intelligence</h1>
          <p style={{ margin: '0 0 16px', color: '#6b7280' }}>
            Pull request quality & engineering process insights
          </p>
          <nav style={{ display: 'flex', gap: 8 }}>
            <NavLink to="/repositories" style={navLinkStyle}>
              Repositories
            </NavLink>
            <NavLink to="/pull-requests" style={navLinkStyle}>
              Pull Requests
            </NavLink>
            <NavLink to="/engineers" style={navLinkStyle}>
              Engineers
            </NavLink>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/pull-requests" element={<PullRequestsPage />} />
            <Route path="/engineers" element={<EngineersPage />} />
            <Route path="*" element={<Navigate to="/repositories" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
