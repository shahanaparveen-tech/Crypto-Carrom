import { logger } from '../app/logger';

/**
 * Background job registry. Schedulers (leaderboard rollups, stale-room cleanup,
 * token reconciliation, etc.) are registered here and started from the bootstrap
 * sequence in later phases.
 */
export const registerJobs = (): void => {
  // TODO(jobs): register cron/queue workers, e.g.
  //   - weekly/monthly leaderboard rollups
  //   - abandoned game-room cleanup
  //   - refresh-token / session pruning
  logger.debug('No background jobs registered yet');
};
