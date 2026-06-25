# Crypto Carrom — Backend

Express + Socket.IO + Prisma (PostgreSQL) API server. Module-based, Clean Architecture, Repository + Service layers.

## Structure

```
backend/src/
├── app/
│   ├── app.ts            # Express app assembly (middleware, routes, error handling)
│   ├── server.ts         # Bootstrap: HTTP server + Socket.IO + graceful shutdown
│   ├── routes.ts         # Root router — mounts every module router
│   ├── socket/           # Socket.IO server, event names, handlers, middlewares
│   ├── middlewares/      # Express middlewares (auth, error, rate limit, validate...)
│   ├── config/           # Typed env loading & singletons (env, prisma)
│   └── logger/           # Winston logger
├── shared/
│   ├── constants/        # App-wide constants
│   ├── helpers/          # Pure helpers
│   ├── utils/            # Utilities (jwt, password, asyncHandler, apiResponse)
│   ├── errors/           # AppError hierarchy
│   ├── interfaces/       # Base contracts (IController, IService, IRepository)
│   └── types/            # Shared types
├── modules/              # One folder per feature/module
│   └── <module>/
│       ├── controller/   # HTTP layer — request/response only
│       ├── service/      # Business logic
│       ├── repository/   # Data access (Prisma)
│       ├── routes/       # Express router for the module
│       ├── dto/          # Data transfer objects
│       ├── validations/  # Zod schemas
│       └── types/        # Module types
├── jobs/                 # Background jobs / schedulers
├── events/               # Domain event definitions & emitters
└── prisma/               # schema.prisma, migrations, seed
```

## Layered request flow

```
HTTP  →  routes  →  middleware (auth/validate)  →  controller  →  service  →  repository  →  Prisma
                                                       ↑                          ↓
                                                   AppError  ←──── domain rules ── DB
```

- **Controllers** never touch Prisma. They parse the request, call a service, and shape the response.
- **Services** hold business rules and are framework-agnostic.
- **Repositories** are the only layer that talks to Prisma.

## Modules

`auth`, `users`, `profile`, `lobby`, `matchmaking`, `game`, `leaderboard`, `wallet`, `chat`, `notifications`, `settings`, `crypto`, `admin`.

> Modules are scaffolded as empty layered folders. Feature implementation lands in later phases.

## Scripts

| Script                    | Description                 |
| ------------------------- | --------------------------- |
| `npm run dev`             | Watch-mode dev server (tsx) |
| `npm run build`           | Compile to `dist/`          |
| `npm run start`           | Run compiled server         |
| `npm run prisma:migrate`  | Run dev migration           |
| `npm run prisma:studio`   | Open Prisma Studio          |
| `npm run lint` / `format` | Lint / format               |
