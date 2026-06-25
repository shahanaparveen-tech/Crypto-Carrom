# Crypto Carrom 🎯

A production-grade, real-time **multiplayer Carrom Pool** game. Inspired by _Carrom Pool: Disc Game_ — built from scratch with **no copied source code or assets** from the original.

The game ships first with **virtual coins** and standard gameplay. **Crypto / Web3 integration** is scaffolded for a later phase (tables, module, and feature folder are reserved but inert).

> This repository currently contains the **production-ready foundation and architecture only** — no gameplay features are implemented yet.

---

## Tech Stack

### Frontend

| Concern             | Choice                       |
| ------------------- | ---------------------------- |
| Framework           | React 18 + TypeScript        |
| Build tool          | Vite                         |
| Styling             | Tailwind CSS                 |
| Global state        | Redux Toolkit                |
| Server state        | React Query (TanStack Query) |
| Routing             | React Router                 |
| Realtime            | Socket.IO Client             |
| Rendering & physics | PixiJS                       |
| Forms & validation  | React Hook Form + Zod        |

### Backend

| Concern         | Choice                                                                |
| --------------- | --------------------------------------------------------------------- |
| Runtime         | Node.js + TypeScript                                                  |
| HTTP framework  | Express.js                                                            |
| Database        | PostgreSQL                                                            |
| ORM             | Prisma                                                                |
| Realtime        | Socket.IO                                                             |
| Auth            | JWT (access + refresh)                                                |
| Cache / session | PostgreSQL (Prisma)                                                   |
| Architecture    | Feature/module-based, Clean Architecture, Repository + Service layers |

---

## Repository Layout

```
crypto-carrom/
├── backend/          # Node + Express + TS API & Socket.IO server
├── frontend/         # React + Vite + TS client
├── docker-compose.yml# Local Postgres
├── package.json      # npm workspaces root + shared tooling
└── readme.md
```

Each application is feature/module-based: **every feature owns its folder** (components, pages, hooks, services, store, types, utils, validations). Code is **never** organized by file-type globally.

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for per-app structure.

---

## Getting Started

### Prerequisites

- Node.js >= 20, npm >= 10
- Docker (for local Postgres) — or your own instance

### 1. Install dependencies (workspaces)

```bash
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Set up the database

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate  --workspace backend
```

### 5. Run both apps

```bash
npm run dev
```

- Backend API → `http://localhost:4000`
- Frontend → `http://localhost:5173`

---

## Available Scripts (root)

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Run backend + frontend concurrently |
| `npm run build`     | Build both apps                     |
| `npm run lint`      | Lint both apps                      |
| `npm run typecheck` | Type-check both apps                |
| `npm run format`    | Prettier-format the whole repo      |

---

## Engineering Standards

- TypeScript **strict mode** everywhere
- ESLint + Prettier
- Husky + lint-staged + Commitlint (**Conventional Commits**)
- SOLID principles, Repository Pattern, Service Layer, Clean Architecture
- Security: Helmet, CORS, rate limiting, JWT + refresh rotation, Postgres-backed sessions, input validation (Zod), audit logs

---

## Roadmap

1. **Phase 1 (current):** Foundation & architecture ✅
2. **Phase 2:** Auth, profiles, wallet (virtual coins)
3. **Phase 3:** Lobby, matchmaking, realtime gameplay (PixiJS physics engine)
4. **Phase 4:** Leaderboards, chat, notifications, spectator mode
5. **Phase 5:** Crypto / Web3 (tokens, staking, NFTs, on-chain games)
