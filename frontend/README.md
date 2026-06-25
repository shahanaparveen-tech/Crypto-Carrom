# Crypto Carrom — Frontend

React + Vite + TypeScript client. Feature-based architecture, Redux Toolkit for
global UI/session state, React Query for server state, Socket.IO for realtime,
PixiJS for the board & physics rendering.

## Structure

```
frontend/src/
├── app/
│   ├── providers/   # App-wide providers (Redux, Query, Router, Socket)
│   ├── store/       # Redux Toolkit store, root reducer, typed hooks
│   ├── router/      # Route table, route guards, lazy feature pages
│   ├── layouts/     # Shared page layouts
│   └── config/      # Typed env access & app constants
├── shared/
│   ├── components/  # Reusable UI primitives
│   ├── hooks/       # Cross-feature hooks
│   ├── services/    # apiClient (axios), socket client, queryClient
│   ├── constants/   # App constants & query keys
│   ├── utils/       # Helpers
│   ├── types/       # Shared types
│   └── assets/      # Static assets
├── features/        # One folder per feature
│   └── <feature>/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/    # feature API calls (React Query hooks)
│       ├── store/       # feature Redux slice
│       ├── types/
│       ├── utils/
│       └── validations/ # Zod schemas + RHF resolvers
└── main.tsx
```

The `game` feature additionally owns the rendering/physics engine:

```
features/game/engine/
├── physics/      # Integration, friction, restitution
├── collisions/   # Disc–disc & disc–wall collision detection/response
├── rules/        # Carrom rules (cover, due, queen)
├── turns/        # Turn order & state machine
└── scoring/      # Scoring & foul evaluation
```

## State strategy

| Kind of state                 | Tool                           |
| ----------------------------- | ------------------------------ |
| Auth/session, UI, in-match UI | Redux Toolkit (feature slices) |
| Server data (profiles, lists) | React Query                    |
| Realtime game/chat events     | Socket.IO → dispatch to Redux  |
| Forms                         | React Hook Form + Zod          |

## Scripts

| Script            | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Vite dev server (port 5173)   |
| `npm run build`   | Type-check + production build |
| `npm run lint`    | ESLint                        |
| `npm run preview` | Preview the production build  |

```

```
