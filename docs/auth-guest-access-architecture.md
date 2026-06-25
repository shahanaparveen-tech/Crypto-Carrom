# Authentication & Guest Access — Architecture (Firebase)

> **Status:** Design only. No implementation yet — waiting on Firebase credentials.
> **Provider:** **Firebase Authentication** for Guest (Anonymous), Google, and Facebook.
> Backend verifies Firebase ID tokens with the **Firebase Admin SDK**, then issues our
> **own JWT + Postgres session** (reusing the existing auth infra).

---

## 0. Why Firebase changes the design (for the better)

| Concern                    | Without Firebase (previous design)             | With Firebase (this design)                                                                |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Google/Facebook OAuth      | We verify tokens (google-auth-library + Graph) | Firebase verifies; we verify **one** Firebase token                                        |
| Guest accounts             | We mint guest identity                         | Firebase **Anonymous** auth (real, persistent UID)                                         |
| Guest → social **upgrade** | We merge rows manually                         | Firebase **account linking** keeps the **same UID** → upgrade-in-place, zero data movement |
| Provider SDKs              | Two SDKs + verifiers                           | One SDK (`firebase`) front, one (`firebase-admin`) back                                    |
| Multi-provider per user    | Our `AuthIdentity` table                       | Firebase consolidates providers under one UID                                              |

**Net effect:** the external identity is a single **`firebaseUid`**. We no longer need a
separate `AuthIdentity` table for the common path — `firebaseUid` is the join key.

### Token strategy (recommended)

The client signs in with Firebase → gets a **Firebase ID token** → sends it **once** to our
backend → backend verifies it and issues **our own access + refresh JWTs** (existing
`sessions` infra). All subsequent app/socket calls use **our** tokens.

- ✅ Reuses existing refresh rotation, capability gating, rate limiting, socket auth.
- ✅ Game APIs stay decoupled from Firebase (no per-request Firebase verification).
- Alternative (not chosen): verify the Firebase token on every request — simpler but
  couples everything to Firebase and adds latency.

---

## 1. Database schema updates (Prisma)

### 1.1 New enum

```prisma
enum AuthProvider {
  GUEST       // Firebase anonymous
  GOOGLE      // google.com
  FACEBOOK    // facebook.com
  EMAIL       // existing email/password (kept, optional)
}
```

### 1.2 `User` model changes

```prisma
model User {
  id            String        @id @default(cuid())
  firebaseUid   String?       @unique        // NEW — external identity (null for legacy EMAIL users)
  username      String        @unique        // Guest_12345 for guests
  email         String?       @unique        // NEW nullable — guests have none
  passwordHash  String?                      // NEW nullable — Firebase users have none
  provider      AuthProvider  @default(EMAIL)// NEW
  isGuest       Boolean       @default(false)// NEW — fast capability flag
  // ... existing: avatarUrl is on Profile, role, status, lastLoginAt, timestamps, relations
}
```

- `email`, `passwordHash` → **nullable** (migration-safe: existing rows keep values).
- `firebaseUid` unique → the canonical lookup for all Firebase sign-ins.
- No `AuthIdentity` table needed for the primary path (Firebase consolidates providers).
  _(Keep it in our back pocket only if we later allow merging two pre-existing UIDs.)_

### 1.3 `Profile` — unchanged (field mapping)

| Spec field | Source                             |
| ---------- | ---------------------------------- |
| coins      | `Wallet.balance` (source of truth) |
| wins       | `Profile.gamesWon`                 |
| losses     | `Profile.gamesLost`                |
| level      | `Profile.level`                    |
| experience | `Profile.xp`                       |
| rank       | derived from `leaderboards`        |
| avatar     | `Profile.avatarUrl`                |

### 1.4 Guest defaults (same atomic creation as today)

`username = Guest_#####` (unique-checked), `avatarUrl = GUEST_AVATAR_URL`,
`Wallet.balance = GUEST_DEFAULT_COINS` via a `GUEST_BONUS` ledger entry, default Profile
stats, `isGuest = true`, `provider = GUEST`, `email = null`, `firebaseUid = <anon uid>`.

### 1.5 Migration

`prisma migrate dev --name auth_firebase` after adding the enum + `User` columns.
Backfill existing rows → `provider = EMAIL`, `isGuest = false`, `firebaseUid = null`.

---

## 2. Backend module structure

```
modules/auth/
├── controller/
│   ├── auth.controller.ts          # (exists) email/pw + me/refresh/logout
│   └── firebase.controller.ts      # NEW  session-exchange + link-sync
├── service/
│   ├── auth.service.ts             # (exists) reused: issueSession, rotation
│   ├── firebase-auth.service.ts    # NEW  verify → find-or-create → issue our session
│   └── account-link.service.ts     # NEW  post-link sync + (rare) merge
├── repository/
│   └── auth.repository.ts          # (exists) extend: findByFirebaseUid, nullable email
├── routes/
│   └── auth.routes.ts              # extend with §4 endpoints
├── dto/
│   └── firebase.dto.ts             # NEW
├── validations/
│   └── firebase.validation.ts      # NEW  Zod: { idToken }
└── types/
    └── auth.types.ts               # (exists) extend: FirebaseProfile, Provider

app/
├── config/firebase.ts              # NEW  init firebase-admin (service account)
└── middlewares/guest.middleware.ts # NEW  requireNonGuest(capability)

shared/constants/capabilities.ts    # NEW  capability matrix
```

`app/config/firebase.ts` initializes the Admin SDK once:
`admin.initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })`.

---

## 3. Guest capability policy (allow / deny)

Single matrix drives backend guards + frontend gating.

```
CAPABILITY                 GUEST   FULL (GOOGLE / FACEBOOK / EMAIL)
quick_match                 ✅       ✅
join_public_room            ✅       ✅
create_private_room         ✅       ✅
view_leaderboard            ✅       ✅
basic_game_features         ✅       ✅
────────────────────────────────────────────────────
crypto_withdraw             ❌       ✅
crypto_tournament           ❌       ✅
coin_transfer               ❌       ✅
advanced_wallet             ❌       ✅
```

- **Backend:** `requireNonGuest('crypto_withdraw')` → `403 GUEST_FORBIDDEN` when
  `req.user.isGuest`. Applied to wallet-transfer / crypto / tournament routes.
- **Frontend:** `useCapabilities()` hides/disables gated UI and shows the upgrade prompt.

---

## 4. API architecture

Under `/api/v1/auth`. Standard `{ success, message, data }` envelope; refresh in httpOnly
cookie; access token in the body/bearer (as today).

| Method | Path             | Auth   | Body          | Returns                               | Notes                                                                                                                |
| ------ | ---------------- | ------ | ------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| POST   | `/firebase`      | none   | `{ idToken }` | `{ user, accessToken, capabilities }` | **Unified exchange.** Handles guest/google/facebook — Firebase tells us the provider. Login-or-create.               |
| POST   | `/firebase/sync` | bearer | `{ idToken }` | `{ user, accessToken, capabilities }` | After a client-side **link** (anon→Google/FB): same UID, flips `isGuest=false`, sets provider/email, **new tokens**. |
| GET    | `/me`            | bearer | —             | `{ user, profile, capabilities }`     | (extend existing)                                                                                                    |
| POST   | `/refresh`       | cookie | —             | `{ user, accessToken }`               | (exists) rotation                                                                                                    |
| POST   | `/logout`        | cookie | —             | `null`                                | (exists) + client `signOut()` Firebase                                                                               |

> **Mapping to the spec's named endpoints:** the spec lists `/auth/guest`,
> `/auth/google`, `/auth/facebook`, `/auth/link-google`, `/auth/link-facebook`. With
> Firebase, the _provider choice happens client-side_; the server only needs the resulting
> token. We can either (a) expose the single `/firebase` + `/firebase/sync` (recommended,
> less surface), or (b) keep the named routes as thin aliases that all forward to the same
> handler. **Recommendation: (a).**

`userData` response shape (uniform across providers):

```jsonc
{
  "user": {
    "id": "cuid",
    "username": "Guest_48217",
    "email": null,
    "provider": "GUEST",
    "isGuest": true,
    "avatarUrl": "/avatars/guest-default.png",
  },
  "accessToken": "our-jwt",
  "capabilities": ["quick_match", "join_public_room", "..."],
}
```

---

## 5. Authentication flows

### 5.1 Guest (Firebase Anonymous)

```
Client (firebase/auth)        Backend                          DB / Firebase
  │ signInAnonymously() ─────────────────────────────────────► Firebase
  │ ◄── firebase user (uid)                                     │
  │ getIdToken() → idToken                                      │
  │  POST /auth/firebase {idToken}                              │
  │ ───────────────────────────► verify idToken (admin) ──────► Firebase
  │                              ◄── {uid, sign_in_provider:    │
  │                                   'anonymous'}              │
  │                              findByFirebaseUid(uid)?        │
  │                                ├ none → tx: create guest     │
  │                                │   User+Profile+Wallet+bonus │
  │                                └ exists → load (returning)   │
  │                              issue our access+refresh; session
  │ ◄ 201 {user,accessToken,caps} set refresh cookie            │
  │ enter lobby immediately                                     │
```

### 5.2 Google / Facebook

```
Client                         Backend                          Firebase
  │ signInWithPopup(google|fb) ───────────────────────────────► Firebase
  │ ◄── firebase user (uid, email, displayName, photoURL)       │
  │ getIdToken() → idToken                                      │
  │  POST /auth/firebase {idToken}                              │
  │ ───────────────────────────► verify (admin) ─────────────► Firebase
  │                              ◄ {uid, email, name, picture,  │
  │                                 sign_in_provider:'google.com'}
  │                              findByFirebaseUid → login,      │
  │                                else create User (provider=   │
  │                                GOOGLE/FACEBOOK, isGuest=false)│
  │ ◄ 200 {user,accessToken,caps}                               │
```

### 5.3 Guest → Google/Facebook upgrade (Firebase linking — the key win)

```
Client (guest, signed in)      Firebase                         Backend
  │ linkWithPopup(googleProvider) ──► Firebase                  │
  │   ┌ success: SAME uid now has Google provider               │
  │   │   getIdToken(true)  // force refresh                    │
  │   │   POST /auth/firebase/sync {idToken}  (bearer = current)│
  │   │ ─────────────────────────────────────────────────────► verify
  │   │                              same firebaseUid found →    │
  │   │                              UPDATE in place:            │
  │   │                                isGuest=false,            │
  │   │                                provider=GOOGLE,          │
  │   │                                email=<google email>      │
  │   │                              → coins/history/inventory   │
  │   │                                preserved automatically   │
  │   │ ◄ 200 {user,accessToken,caps}  issue NEW tokens         │
  │   │
  │   └ error 'credential-already-in-use':                      │
  │       that Google identity is already another account →     │
  │       MERGE path (§6), or prompt "sign in to existing".     │
```

Because linking preserves the Firebase UID, and our `User` is keyed on `firebaseUid`, the
**common upgrade is a single in-place UPDATE** — no merge, no data loss.

### 5.4 Refresh / logout — unchanged

Our refresh rotation as today. Logout revokes our session, clears cookie, and the client
calls Firebase `signOut()`.

---

## 6. Merge (only the rare `credential-already-in-use` case)

If the chosen Google/Facebook identity already belongs to a **different** Firebase UID /
account, run one transaction: sum wallet (with `MERGE_CREDIT` ledger entry), repoint game
history / leaderboards / inventory `userId` → target, revoke guest sessions, soft-delete
guest (`status = DELETED`), issue fresh tokens. Per-table conflict rules (sum vs max vs
keep-higher) need sign-off (open question #3).

---

## 7. Frontend architecture

### 7.1 Folder structure (extends `features/auth/`)

```
features/auth/
├── components/
│   ├── GuestLoginButton.tsx        # signInAnonymously
│   ├── GoogleLoginButton.tsx       # signInWithPopup(google)
│   ├── FacebookLoginButton.tsx     # signInWithPopup(facebook)
│   ├── AuthLayout.tsx              # (thin wrapper over app/layouts AuthLayout)
│   └── AccountLinkModal.tsx        # upgrade prompt (linkWithPopup)
├── pages/
│   ├── LoginPage.tsx               # (exists) → method chooser (Guest/Google/Facebook)
│   ├── GuestLoginPage.tsx          # optional dedicated route
│   ├── GoogleLoginPage.tsx         # popup/redirect handler
│   ├── FacebookLoginPage.tsx       # popup/redirect handler
│   └── LinkAccountPage.tsx         # full-page upgrade (guest only)
├── hooks/
│   ├── useAuthState.ts             # (exists)
│   ├── useFirebaseAuth.ts          # NEW  wraps firebase sign-in + token exchange
│   └── useLinkAccount.ts           # NEW  linkWithPopup + /firebase/sync
├── services/
│   ├── auth.api.ts                 # (exists)
│   └── firebase.api.ts             # NEW  exchange(idToken), sync(idToken)
├── store/
│   └── auth.slice.ts               # (exists) + provider, isGuest, capabilities
├── types/
│   └── auth.types.ts               # Provider, Capability
├── utils/
│   ├── firebase.ts                 # NEW  initializeApp + getAuth + providers
│   └── capabilities.ts             # NEW  capability helpers
└── validations/
    └── auth.schema.ts              # (exists)
```

### 7.2 Redux architecture

Extend the existing `auth` slice (no parallel slice):

```ts
interface AuthState {
  user: PublicUser | null; // + provider, isGuest, avatarUrl
  capabilities: Capability[];
  status: 'loading' | 'authenticated' | 'unauthenticated';
  linking: { inProgress: boolean; error?: string };
}
```

- New actions: `setCapabilities`, `linkStarted/Succeeded/Failed`.
- Selectors: `selectIsGuest`, `selectCan(cap)`, `selectCapabilities`.
- Async via React Query mutations (`useFirebaseAuth`, `useLinkAccount`) that store our
  access token (`tokenStorage`) and dispatch `setUser`. Bootstrap `/me` on load (exists).

### 7.3 Service flow

```
utils/firebase.ts:  initializeApp(VITE_FIREBASE_*) → getAuth(), GoogleAuthProvider, FacebookAuthProvider
useFirebaseAuth():  signIn* → user.getIdToken() → firebase.api.exchange(idToken) → store our session
useLinkAccount():   linkWithPopup(provider) → getIdToken(true) → firebase.api.sync(idToken)
```

---

## 8. Security mapping

| Requirement             | Mechanism                                                      |
| ----------------------- | -------------------------------------------------------------- |
| Provider verification   | `firebase-admin` `verifyIdToken` (backend only)                |
| JWT access/refresh      | existing signing + rotation + hashed `sessions`                |
| Rate limiting           | `authRateLimiter` on `/auth/firebase*`                         |
| Input validation        | Zod `{ idToken }` via `validate`                               |
| Account-link validation | Firebase enforces UID ownership; backend trusts verified token |
| Guest gating            | `requireNonGuest(cap)` + capability matrix                     |
| Secrets                 | Admin **private key** only in backend `.env` (gitignored)      |

---

## 9. Setup — what I need from you (Firebase)

### 9.1 Firebase console (you enable)

- **Authentication → Sign-in method:** enable **Anonymous**, **Google**, **Facebook**.
  (Facebook also requires a Facebook App ID/Secret configured **in the Firebase console** —
  not in our code.)
- Add `localhost` to **Authorized domains**.

### 9.2 Frontend config (Project settings → Your apps → Web app) → `frontend/.env`

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

(These are public by design — fine for the client bundle.)

### 9.3 Backend Admin credentials (Project settings → Service accounts → Generate new private key) → `backend/.env` (**secret, gitignored**)

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

_(Keep the `\n` escaping; we’ll un-escape at load. Never commit the service-account JSON.)_

### 9.4 Packages (added at implementation time)

- Frontend: `firebase`
- Backend: `firebase-admin`

---

## 10. Open questions before implementation

1. **Keep email/password** (`/register`,`/login`) alongside Firebase, or retire it?
   (Design keeps it; `passwordHash` just goes unused for Firebase users.)
2. **Token model:** confirm "exchange Firebase token for our own JWT session" (recommended)
   vs "use Firebase tokens directly everywhere."
3. **Merge conflict policy** for the rare `credential-already-in-use` case (sum/max/keep-higher).
4. **Guest upgrade bonus:** grant extra coins when a guest upgrades to Google/Facebook?

---

## 11. Implementation order (once you provide the Firebase config)

1. Add `firebase-admin` + `app/config/firebase.ts`; add `firebase` + `utils/firebase.ts`.
2. Schema migration (`AuthProvider`, `firebaseUid`, nullable email/password, flags).
3. `POST /auth/firebase` exchange (verify → find-or-create guest/social → our session).
4. `requireNonGuest` guard + capability matrix; `/me` returns capabilities.
5. `POST /auth/firebase/sync` for client-side linking (upgrade-in-place).
6. Frontend: method-chooser LoginPage + Guest/Google/Facebook buttons + AccountLinkModal.
7. Capability-gated UI + upgrade prompts; (later) the rare merge path.

```

```
