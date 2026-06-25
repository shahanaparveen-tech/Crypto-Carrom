import { PrismaClient } from '@prisma/client';

/**
 * Database seed. Kept minimal at the foundation stage — extend per module as
 * features land (e.g. seed an admin user, default settings, demo leaderboard).
 */
const prisma = new PrismaClient();

async function main(): Promise<void> {
  // TODO(seed): create baseline data (admin account, system chat room, etc.)
  // eslint-disable-next-line no-console
  console.log('🌱 Seed complete (no-op placeholder).');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
