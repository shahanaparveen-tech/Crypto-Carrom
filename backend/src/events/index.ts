import { EventEmitter } from 'events';

/**
 * Application-wide domain event bus. Modules emit domain events (e.g.
 * "match.finished") and other modules subscribe without direct coupling.
 * Handlers are registered in later phases.
 */
export const DOMAIN_EVENTS = {
  USER_REGISTERED: 'user.registered',
  MATCH_FINISHED: 'match.finished',
  WALLET_CREDITED: 'wallet.credited',
  WALLET_DEBITED: 'wallet.debited',
  LEADERBOARD_UPDATED: 'leaderboard.updated',
} as const;

export type DomainEvent = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

class DomainEventBus extends EventEmitter {}

export const domainEvents = new DomainEventBus();
domainEvents.setMaxListeners(50);
