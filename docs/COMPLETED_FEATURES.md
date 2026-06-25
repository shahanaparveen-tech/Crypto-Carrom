# Crypto Carrom — Completed Features

A snapshot of everything **built and verified** so far. Each item below has been
type-checked, built, and (for backend APIs) smoke-tested against the live database.

> For the full forward-looking task list see [../IMPLEMENTATION_CHECKLIST.md](../IMPLEMENTATION_CHECKLIST.md).
> Auth design docs: [auth-guest-access-architecture.md](auth-guest-access-architecture.md).

**Legend:** ✅ done & verified · 🚧 partial · ⬜ not started

---

## 1. Infrastructure & Foundation ✅

| Area                      | Status      | Notes                                                               |
| ------------------------- | ----------- | ------------------------------------------------------------------- |
| Monorepo (npm workspaces) | ✅          | `backend/` + `frontend/` + shared tooling                           |
| Tooling                   | ✅          | ESLint, Prettier, Husky, lint-staged, Commitlint                    |
| Backend stack             | ✅          | Express + TypeScript (strict), Socket.IO server scaffold            |
| Database                  | ✅          | PostgreSQL (hosted on Render) + Prisma ORM                          |
| Migrations                | ✅          | `init` + `auth_guest` applied — 24+ tables live                     |
| Auth infra                | ✅          | JWT access+refresh (rotation), Postgres-backed `sessions`           |
| Security                  | ✅          | Helmet, CORS, rate limiting, Zod validation, error pipeline         |
| Redis                     | ❌ removed  | Sessions/cache use Postgres instead (by decision)                   |
| Frontend stack            | ✅          | React 18 + Vite + TS, Redux Toolkit, React Query, React Router      |
| Realtime client           | ✅ scaffold | Socket.IO client singleton (not yet used by features)               |
| Branding                  | ✅          | Carrom icon as logo + favicon, Carrom Pool theme (maroon/wood/gold) |
| Shared UI kit             | ✅          | Button, TextField, Card, Spinner, Avatar, CoinBadge, Toggle, Logo   |

---

## 2. Authentication ✅

### Guest login ✅ (the primary path)

- **`POST /auth/guest`** — instant account, **no email/password**. Unique `Guest_#####`
  username + cuid id, atomic create of profile + default avatar + wallet (**500 coins**) + settings.
- `isGuest` flows through the JWT → `/me`, `/wallet`, `/profile`, refresh all work as a guest.
- Frontend: **"🎮 Play as Guest"** button (primary CTA on the login screen) + guest banner in the lobby.
- Schema is **conversion-ready** (a guest can later become a real account in place).

### Email / password ✅

Register · Login · Refresh (rotation) · Logout · Logout-all · Get me · Verify email ·
Forgot password · Reset password · Resend verification.

- Signup is atomic (user + profile + wallet + settings + 1000-coin bonus).
- Refresh-token rotation with revoke-on-logout; security: bcrypt, rate-limited auth routes,
  httpOnly refresh cookie, no email-enumeration leak.

### Capability gating ✅

`requireNonGuest(capability)` middleware + restricted-capability list (crypto withdraw,
coin transfer, etc.) — ready to attach to those routes when they exist.

### Deferred 🔜

Google / Facebook (via **Firebase**) — designed, web config stored; needs the backend
Admin key. See the auth architecture doc.

---

## 3. Backend Modules (API) ✅

All routes under `/api/v1`. Verified end-to-end against the live DB.

### auth ✅

`POST /auth/guest` · `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` ·
`POST /auth/logout` · `POST /auth/logout-all` · `GET /auth/me` · `POST /auth/verify-email` ·
`POST /auth/forgot-password` · `POST /auth/reset-password` · `POST /auth/resend-verification`

### users ✅

`GET /users/search?q=` (paginated) · `GET /users/:userId` (public profile)

### profile ✅

`GET /profile/me` · `PATCH /profile/me` (name/avatar/country/bio) · `GET /profile/:userId`

### wallet ✅

`GET /wallet` (balance, BigInt-safe) · `GET /wallet/transactions` (paginated ledger)

- Internal credit/debit service with **atomic optimistic-locked** balance updates + insufficient-funds guard.

### settings ✅

`GET /settings` (auto-creates defaults) · `PATCH /settings` (sound/music/vibration/notifications/language/theme)

### health ✅

`GET /health` (DB check) · `GET /version`

---

## 4. Frontend Features ✅

| Feature          | Status | What works                                                                                                                                           |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**         | ✅     | Login / Register / Forgot / Reset / Verify pages + Guest login; Redux session slice; `/me` bootstrap hydration; route guards (spinner while loading) |
| **App shell**    | ✅     | TopBar with live coin balance, avatar, nav, logout                                                                                                   |
| **Lobby (home)** | ✅     | Carrom-styled landing: welcome, balance, stats (rating/level/win-rate), **Practice** button, guest banner                                            |
| **Profile**      | ✅     | Stats grid + editable profile form (saves via API)                                                                                                   |
| **Wallet**       | ✅     | Balance card + transaction history (shows signup bonus)                                                                                              |
| **Settings**     | ✅     | Toggles + theme/language (persist instantly)                                                                                                         |

---

## 5. Game (Practice mode) 🚧 — playable

Route **`/play`** (lobby → "🎯 Practice"). Single-player practice board.

- ✅ **PixiJS board** — wood frame, surface, center circles, base lines, **4 corner pockets**
- ✅ **Standard opening layout: 9 white + 9 black + 1 red queen** (inner ring 6 + outer ring 12) + striker
- ✅ **Custom physics engine** (framework-agnostic, server-reusable):
  - integration + friction + settle
  - **elastic disc–disc collisions** (mass-weighted impulse + overlap correction)
  - wall bounce, **pocket detection**, striker-foul respawn
- ✅ **Controls** — baseline striker slider + drag-to-aim (slingshot guide) + release to flick
- ✅ **Live HUD** — white/black/queen pocketed, fouls, coins remaining, "board cleared" + Reset
- ✅ Code-split (Pixi loads only on the game route)

**Engine location:** `frontend/src/features/game/engine/` (`constants.ts`, `board.ts`, `simulation.ts`)

### Not yet (game)

⬜ Queen cover/due rules · ⬜ turn rotation / 2-player · ⬜ win conditions · ⬜ realtime multiplayer

---

## 6. Database (Prisma) ✅

24+ tables migrated and live, including: `users`, `profiles`, `wallets`,
`wallet_transactions`, `sessions`, `verification_tokens`, `user_settings`, `game_rooms`,
`matches`, `match_players`, `game_history`, `leaderboards`, `tournaments`,
`tournament_players`, `notifications`, `friends`, `chat_rooms`, `chat_messages`,
`admin_logs`, plus reserved crypto tables (`crypto_wallets`, `token_transactions`,
`staking`, `nft_assets`, `blockchain_games`).

`AuthProvider` enum + `User.provider/isGuest/firebaseUid` + nullable email/password are in
place for guest → social upgrade.

---

## 7. Not started yet ⬜

Backend modules: **lobby** (rooms), **matchmaking**, **game** (server-authoritative match
lifecycle), **leaderboard**, **chat**, **notifications**, **admin**, **crypto** (Phase 5).
Frontend: those feature UIs + realtime wiring.
Socket events: defined/scaffolded but **handlers are stubs** — no live multiplayer yet.

---

## Summary

**Done:** full auth (guest + email/password), users/profile/wallet/settings APIs, the
entire authenticated frontend shell with those features wired to live APIs, and a
**playable single-player carrom board** with a real physics engine.

**Recommended next:** either (a) **game rules + turns + win conditions** to make practice a
complete match, or (b) **lobby rooms + matchmaking + realtime** to bring the board online
(socket scaffolding already exists).
