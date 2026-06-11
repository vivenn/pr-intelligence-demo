import {
  ApiItem,
  EngineerProfile,
  EngineerWithMetrics,
  Paginated,
  PullRequestSummary,
  RepositoryProfile,
  RepositorySummary,
  SyncResult,
} from './types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = {
  listPullRequests: (params: { page?: number; pageSize?: number; author?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.author) query.set('author', params.author);
    const qs = query.toString();
    return request<Paginated<PullRequestSummary>>(`/pull-requests${qs ? `?${qs}` : ''}`);
  },

  getPullRequest: (id: string) => request<ApiItem<PullRequestSummary>>(`/pull-requests/${id}`),

  listEngineers: () => request<Paginated<EngineerProfile>>('/engineers'),

  getEngineer: (username: string) => request<ApiItem<EngineerWithMetrics>>(`/engineers/${username}`),

  listRepositories: () => request<Paginated<RepositoryProfile>>('/repositories'),

  getRepositorySummary: (id: string) => request<ApiItem<RepositorySummary>>(`/repositories/${id}/summary`),

  triggerSync: () => request<{ data: SyncResult[] }>('/github/sync', { method: 'POST' }),
};
