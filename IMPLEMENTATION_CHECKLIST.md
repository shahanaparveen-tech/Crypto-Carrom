# Crypto Carrom — Implementation Checklist

Living document tracking feature implementation status across backend modules and
frontend features. Updated as work progresses.

**Legend:** ✅ done · 🚧 in progress · ⬜ pending · 🔒 deferred (Phase 5)

_Last updated: 2026-06-23_

---

## Phase 1 — Foundation & Architecture ✅

- ✅ Monorepo, tooling (ESLint, Prettier, Husky, Commitlint)
- ✅ Backend skeleton (Express, Socket.IO, layered architecture)
- ✅ Frontend skeleton (React, Vite, Redux, React Query, Router)
- ✅ Prisma schema (all tables) + initial migration applied
- ✅ Redis removed — Postgres-backed sessions/cache

---

## Backend Modules

### auth ✅

**Guest login ✅ (verified end-to-end against live DB)**

- ✅ `POST /auth/guest` — instant account, no email/password, unique `Guest_#####` + cuid id
- ✅ Atomic guest create (profile + default avatar + wallet w/ 500 coins + settings)
- ✅ JWT carries `isGuest`; `/me`, `/wallet`, `/profile`, refresh all work as guest
- ✅ `requireNonGuest(capability)` guard + restricted-capability list (ready for crypto/transfer)
- ✅ Frontend: "Play as Guest" primary CTA, `useGuestLogin`, guest banner in lobby
- ✅ Schema conversion-ready: `AuthProvider` enum, `User.firebaseUid`, nullable email/password

**Email/password ✅ (verified)** — register/login/refresh/logout/verify/forgot/reset

> 🔜 **Google + Facebook (Firebase) — deferred to future.** Web config stored in
> `frontend/.env`; backend Admin key still needed. Design:
> [docs/auth-guest-access-architecture.md](docs/auth-guest-access-architecture.md).
> Guest→social upgrade will reuse the same row (`firebaseUid`/`provider`/`isGuest` already in schema).

- ✅ Register (creates user + profile + wallet + settings + signup bonus, atomic)
- ✅ Login (JWT access + refresh)
- ✅ Refresh token (rotation, Postgres sessions, revoke-on-logout)
- ✅ Logout (single + all sessions)
- ✅ Get current user (`/me`)
- ✅ Email verification (token issue + verify)
- ✅ Forgot password (no email-enumeration leak)
- ✅ Reset password (revokes all sessions)
- ✅ Resend verification

### users ✅ (verified)

- ✅ Get public user by id (with profile summary)
- ✅ Search users by username (paginated)
- ⬜ Admin update / status changes (handled in admin module)

### profile ✅ (verified)

- ✅ Get profile (self `/me` + public by id)
- ✅ Update profile (display name, avatar, country, bio)
- ✅ Stats fields (games played/won, rating, streak) exposed

### lobby ⬜

- ⬜ Create room (public / private + password)
- ⬜ Join room (by code / id)
- ⬜ Leave room
- ⬜ List public rooms

### matchmaking ⬜

- ⬜ Quick match
- ⬜ Skill-based matchmaking (rating buckets)
- ⬜ Queue management

### game ⬜

- ⬜ Match lifecycle (create / start / finish)
- ⬜ Turn management
- ⬜ Scoring system
- ⬜ Foul system
- ⬜ Win conditions
- ⬜ Reconnection handling
- ⬜ Spectator mode
- ⬜ Authoritative server validation

### leaderboard ⬜

- ⬜ Global rankings
- ⬜ Weekly rankings
- ⬜ Monthly rankings

### wallet ✅ (verified)

- ✅ Get balance
- ✅ Transaction history (paginated ledger)
- ✅ Credit / debit service (signup bonus working; entry/winning/refund ready for game)
- ✅ Atomic balance updates (optimistic locking, insufficient-funds guard)

### chat ⬜

- ⬜ Global chat (persist + history)
- ⬜ Room chat (persist + history)

### notifications ⬜

- ⬜ List notifications
- ⬜ Mark read / read-all
- ⬜ Emit on domain events

### settings ✅ (verified)

- ✅ Get settings (auto-creates defaults)
- ✅ Update settings (sound, music, vibration, notifications, language, theme)

### admin ⬜

- ⬜ User moderation (suspend / ban)
- ⬜ Audit logs (admin_logs)
- ⬜ Dashboard stats

### crypto 🔒 (Phase 5)

- 🔒 Wallet connect, tokens, staking, NFTs, on-chain games

---

## Socket Events

- ⬜ connection / disconnect (presence)
- ⬜ create-room / join-room / leave-room
- ⬜ start-match / player-ready / player-turn
- ⬜ striker-shot / coin-pocketed / foul / match-finished
- ⬜ chat-message
- ⬜ spectator-join

---

## Frontend Features

> Shared UI kit (Button, TextField, Card, Spinner, Avatar, CoinBadge, Toggle, Logo,
> CarromBoardArt) + Carrom Pool theme (maroon/wood/gold). Type-checks + production
> build pass. Backend CORS verified for the app origin.

### auth ✅

- ✅ Redux slice (session state) + bootstrap `/me` hydration
- ✅ API services + React Query mutations
- ✅ Zod validations + RHF forms
- ✅ Login / Register / Forgot / Reset / Verify-email pages
- ✅ Guards wired to real auth state (loading → spinner)

### lobby (home) ✅ — Carrom-styled landing, stats, balance, play CTAs (gameplay pending)

### profile ✅ — view stats + edit profile form

### wallet ✅ — balance + transaction history

### settings ✅ — toggles + theme/language

### app shell ✅ — TopBar (coins, avatar, nav, logout)

### matchmaking ⬜ · game ⬜ · leaderboard ⬜ · chat ⬜ · notifications ⬜

### admin ⬜ · crypto 🔒

### game engine 🚧 (single-player practice playable)

- ✅ physics (fixed sub-step integration, friction, settle)
- ✅ collisions (elastic disc–disc with mass + positional correction, disc–wall bounce)
- ✅ pocketing (4 corner pockets, sink detection, striker foul)
- ✅ board setup: **9 white + 9 black + 1 queen** (inner ring 6 + outer ring 12) + striker
- ✅ PixiJS board renderer + aim (drag/slingshot) & flick, baseline striker slider
- ✅ live scoring HUD (white/black/queen/fouls/remaining) + reset, route `/play` (Practice from lobby)
- ✅ code-split: Pixi loads only on the game route
- ⬜ rules (queen cover/due), turn rotation, 2-player, win conditions → next (with realtime)

---

## Cross-cutting

- ⬜ Seed data (admin user, defaults)
- ⬜ Integration tests per module
- ⬜ E2E happy-path (register → match → result)
