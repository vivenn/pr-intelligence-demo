import { RepositorySyncResult } from './github-sync.types';

export type SyncStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface SyncState {
  status: SyncStatus;
  startedAt: string | null;
  finishedAt: string | null;
  result: RepositorySyncResult[] | null;
  error: string | null;
}

/**
 * Tracks the state of the most recent background sync so the manual-sync endpoint can
 * return immediately (202) and the client can poll for completion.
 *
 * Note: in-memory and single-instance — fine for the MVP. A multi-instance deployment
 * would move this to a shared store (Redis) or a proper job queue (BullMQ).
 */
export class SyncStatusTracker {
  private state: SyncState = {
    status: 'idle',
    startedAt: null,
    finishedAt: null,
    result: null,
    error: null,
  };

  get(): SyncState {
    return { ...this.state };
  }

  isRunning(): boolean {
    return this.state.status === 'running';
  }

  start(): void {
    this.state = { status: 'running', startedAt: new Date().toISOString(), finishedAt: null, result: null, error: null };
  }

  complete(result: RepositorySyncResult[]): void {
    this.state = { ...this.state, status: 'completed', finishedAt: new Date().toISOString(), result };
  }

  fail(error: string): void {
    this.state = { ...this.state, status: 'failed', finishedAt: new Date().toISOString(), error };
  }
}
