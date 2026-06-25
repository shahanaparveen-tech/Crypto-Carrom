# Features

Every feature is a vertical slice that owns all of its code. Nothing is grouped
by file-type globally.

```
features/<name>/
├── components/    # Feature-only UI
├── pages/         # Route-level screens
├── hooks/         # Feature hooks (incl. React Query hooks)
├── services/      # API calls built on shared/apiClient
├── store/         # Redux slice (registered in app/store/rootReducer)
├── types/         # Feature types
├── utils/         # Helpers
└── validations/   # Zod schemas + RHF resolvers
```

## Features

`auth`, `profile`, `lobby`, `matchmaking`, `game`, `leaderboard`, `wallet`,
`chat`, `notifications`, `settings`, `crypto`, `admin`.

The **game** feature additionally contains the rendering/physics `engine/`
(`physics`, `collisions`, `rules`, `turns`, `scoring`) — see
[game/engine](game/engine/index.ts).

## Conventions

- A feature page is lazy-loaded and registered in `app/router/routes.tsx`.
- A feature slice is registered in `app/store/rootReducer.ts`.
- Server data goes through React Query (`services/` + `hooks/`); ephemeral UI and
  realtime-derived state goes through the feature's Redux slice.
- Realtime: subscribe to socket events inside feature hooks and dispatch to the
  slice; always remove listeners on unmount.

```

```
