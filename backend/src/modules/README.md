# Modules

Each feature is a self-contained module following the same layered shape. Code
is **never** organized by file-type globally — everything for a module lives in
its own folder.

```
modules/<name>/
├── controller/    # HTTP handlers — parse request, call service, shape response
├── service/       # Business logic (framework-agnostic, testable)
├── repository/    # Data access — the ONLY layer that imports Prisma
├── routes/        # Express router; wires middleware + controller
├── dto/           # Request/response DTOs
├── validations/   # Zod schemas (consumed by the `validate` middleware)
└── types/         # Module-local types
```

## Implementing a module (later phases)

1. Define Zod schemas in `validations/` and DTO types in `dto/`.
2. Add data access methods in `repository/` (extend the shared `IRepository`).
3. Put business rules in `service/` (throw `AppError` subclasses for failures).
4. Add thin handlers in `controller/` using `asyncHandler` + `sendSuccess`.
5. Build the router in `routes/`, applying `authenticate` / `authorize` / `validate`.
6. Mount the router in `src/app/routes.ts` under the module's path.

## Modules

| Module          | Responsibility                                                 |
| --------------- | -------------------------------------------------------------- |
| `auth`          | Register, login, refresh, logout, email verify, password reset |
| `users`         | User CRUD & lookup                                             |
| `profile`       | Player profile, stats, rating                                  |
| `lobby`         | Create/join public & private rooms                             |
| `matchmaking`   | Quick match + skill-based matchmaking                          |
| `game`          | Match lifecycle, authoritative rules/scoring/fouls             |
| `leaderboard`   | Global / weekly / monthly rankings                             |
| `wallet`        | Virtual-coin balance & transactions                            |
| `chat`          | Global & room chat persistence                                 |
| `notifications` | User notifications                                             |
| `settings`      | Per-user preferences                                           |
| `crypto`        | Web3 wallets, tokens, staking, NFTs (Phase 5)                  |
| `admin`         | Moderation, audit logs, admin actions                          |

```

```
