import { createApp } from './app';
import { createGithubSyncService } from './modules/github-sync/github-sync.factory';
import { startSyncScheduler } from './modules/github-sync/github-sync.scheduler';
import { env } from './shared/config/env';
import { prisma } from './shared/db/prisma';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`PR Intelligence backend listening on port ${env.PORT}`);

  // Optional scheduled sync — only when SYNC_CRON is configured. Manual sync always works.
  if (env.SYNC_CRON) {
    const syncService = createGithubSyncService(prisma, {
      githubToken: env.GITHUB_TOKEN,
      org: env.GITHUB_ORG,
    });
    startSyncScheduler(syncService, env.GITHUB_REPOS, env.SYNC_CRON);
  }
});
