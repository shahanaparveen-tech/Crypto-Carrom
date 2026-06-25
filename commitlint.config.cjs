/**
 * Conventional Commits configuration.
 * Format: <type>(<scope>): <subject>
 * Example: feat(auth): add refresh token rotation
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'root',
        'backend',
        'frontend',
        'auth',
        'users',
        'profile',
        'lobby',
        'matchmaking',
        'game',
        'leaderboard',
        'wallet',
        'chat',
        'notifications',
        'settings',
        'crypto',
        'admin',
        'socket',
        'prisma',
        'config',
        'deps',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100],
  },
};
