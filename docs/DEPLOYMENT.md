# Deployment Guide — Crypto Carrom

End-to-end guide to deploy the **frontend to Vercel** and the **backend to Render**, with a managed **PostgreSQL** database.

This is a monorepo with npm workspaces:

```
Crypto-Carrom/
├── backend/    → Render (Express + Socket.IO + Prisma)
├── frontend/   → Vercel (React + Vite)
└── package.json (workspaces: backend, frontend)
```

**Deploy order matters:** Database → Backend → Frontend. The frontend needs the backend URL, and the backend needs the frontend URL for CORS, so there is one circular reference resolved at the end (Step 5).

---

## Prerequisites

- Code pushed to a GitHub repo (Render and Vercel both deploy from Git).
- A [Render](https://render.com) account.
- A [Vercel](https://vercel.com) account.
- Node `>=20` locally (matches the repo's `engines` requirement).

Generate three strong secrets now — you'll need them for the backend. Run locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it three times for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET`.

---

## Step 1 — Provision PostgreSQL (Render)

1. Render Dashboard → **New → PostgreSQL**.
2. Name it (e.g. `crypto-carrom-db`), pick a region (use the **same region** as your backend service), choose a plan.
3. Create it, then open the database page and copy the **Internal Database URL**.
   - Use the **Internal** URL for the backend (same-region, faster, free egress).
   - Use the **External** URL only when running migrations from your laptop.

You now have your `DATABASE_URL`.

---

## Step 2 — Deploy the Backend (Render Web Service)

### 2a. Create the service

1. Render Dashboard → **New → Web Service** → connect your GitHub repo.
2. Configure:

   | Setting            | Value                                                                       |
   | ------------------ | --------------------------------------------------------------------------- |
   | **Root Directory** | _(leave blank — repo root, so npm workspaces resolve)_                      |
   | **Runtime**        | Node                                                                        |
   | **Build Command**  | `npm install && npm run prisma:deploy --workspace backend && npm run build` |
   | **Start Command**  | `npm run start --workspace backend`                                         |
   | **Instance Type**  | Free works for testing; see the cold-start note below                       |

> **Why these commands:**
>
> - `prisma generate` is **not** in the build command on purpose — it runs automatically via the backend's `postinstall` script during `npm install`. This guarantees the typed Prisma client exists before `tsc` runs, no matter how the build command is configured. (Without it, `tsc` fails with dozens of `@prisma/client has no exported member 'User'` errors.)
> - `prisma:deploy` (`prisma migrate deploy`) applies committed migrations to the production DB on every deploy, keeping the schema in sync. It requires `DATABASE_URL` to be set (Step 2b) — set the env vars **before** the first deploy or the build will fail at the migrate step.
> - These commands assume **Root Directory is the repo root** (leave it blank) so npm workspaces resolve. If you instead set Root Directory to `backend`, drop the `--workspace backend` flags.

### 2b. Set environment variables

Add these under the service's **Environment** tab. Do **not** set `PORT` — Render injects it and the app reads `process.env.PORT`.

```
NODE_ENV=production
API_PREFIX=/api/v1
APP_NAME=crypto-carrom
DATABASE_URL=<Internal Database URL from Step 1>
JWT_ACCESS_SECRET=<generated secret>
JWT_REFRESH_SECRET=<generated secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=crypto-carrom
BCRYPT_SALT_ROUNDS=12
COOKIE_SECRET=<generated secret>
COOKIE_DOMAIN=<your-backend>.onrender.com
LOG_LEVEL=info
CRYPTO_ENABLED=false
CORS_ORIGINS=http://localhost:5173
```

Leave `CORS_ORIGINS` at the localhost value for now — you'll update it in **Step 5** once you know the Vercel URL.

> Defaults (rate limits, socket ping settings, `SOCKET_PATH=/socket.io`) are fine as-is and only need overriding if you want to change them.

### 2c. Deploy and verify

1. Click **Create Web Service**. Watch the build logs — confirm `tsc` build succeeds and `prisma migrate deploy` runs without error.
2. Your backend URL will be `https://<your-backend>.onrender.com`.
3. Verify the API responds (replace with a real route — e.g. an auth or health endpoint):
   ```
   https://<your-backend>.onrender.com/api/v1/...
   ```

> **Cold starts (free tier):** Render's free instances spin down after ~15 min idle and take ~30–60s to wake. This breaks real-time gameplay (Socket.IO disconnects on sleep). For anything beyond testing, use a paid instance. Socket.IO otherwise needs **no special config** on Render — WebSockets are supported by default.

---

## Step 3 — Deploy the Frontend (Vercel)

### 3a. Import the project

1. Vercel Dashboard → **Add New → Project** → import your GitHub repo.
2. Configure:

   | Setting              | Value                     |
   | -------------------- | ------------------------- |
   | **Root Directory**   | `frontend`                |
   | **Framework Preset** | Vite                      |
   | **Build Command**    | `npm run build` (default) |
   | **Output Directory** | `dist` (default)          |
   | **Install Command**  | `npm install` (default)   |

### 3b. Set environment variables

Add these in **Settings → Environment Variables** (point them at your Render backend from Step 2):

```
VITE_APP_NAME=Crypto Carrom
VITE_API_BASE_URL=https://<your-backend>.onrender.com/api/v1
VITE_SOCKET_URL=https://<your-backend>.onrender.com
VITE_SOCKET_PATH=/socket.io
VITE_CRYPTO_ENABLED=false
```

> **Important:**
>
> - `VITE_API_BASE_URL` **must include** the `/api/v1` suffix.
> - `VITE_SOCKET_URL` is the backend **root** (no suffix).
> - `VITE_*` vars are baked into the bundle **at build time** — after changing any of them you must **redeploy** for the change to take effect.

### 3c. SPA routing fallback

This is a React Router single-page app. Add a `vercel.json` at the **frontend root** so deep links (e.g. `/game/123`) don't 404:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Commit it as `frontend/vercel.json`.

### 3d. Deploy

Click **Deploy**. Your frontend URL will be `https://<your-project>.vercel.app`.

---

## Step 4 — Run / verify database migrations

Migrations run automatically via the backend build command (Step 2a). To run them manually from your laptop instead (using the **External** DB URL):

```bash
cd backend
DATABASE_URL="<External Database URL>" npm run prisma:deploy
# optional seed:
DATABASE_URL="<External Database URL>" npm run prisma:seed
```

> Ensure your migrations are committed under `backend/prisma/migrations/`. `prisma migrate deploy` only applies existing migration files — it never generates new ones.

---

## Step 5 — Connect the two services (CORS + cookies)

Now that you have the real Vercel URL, close the loop:

1. **Render backend → Environment**, update:
   ```
   CORS_ORIGINS=https://<your-project>.vercel.app
   ```
   For multiple origins (e.g. preview deploys), comma-separate them:
   ```
   CORS_ORIGINS=https://<your-project>.vercel.app,https://staging-...vercel.app
   ```
2. Save — Render redeploys automatically.
3. Confirm `VITE_API_BASE_URL` / `VITE_SOCKET_URL` on Vercel point at the backend (Step 3b). If you changed them, **redeploy** the frontend.

### Cookie caveat (cross-site auth)

The app uses `withCredentials: true` and signed cookies. Because the frontend (`*.vercel.app`) and backend (`*.onrender.com`) are on **different domains**, auth cookies are cross-site. For the browser to store them, the backend must send cookies with `SameSite=None; Secure`. Both domains are HTTPS (good). If login works but the session/refresh cookie isn't persisted:

- Verify cookies are issued with `SameSite=None` and `Secure` in production (check the backend cookie options in `backend/src`).
- `COOKIE_DOMAIN` should be the backend host (`<your-backend>.onrender.com`), **not** the frontend.
- A custom domain that shares a parent (e.g. `app.example.com` + `api.example.com`) avoids cross-site cookie friction entirely — recommended for production.

---

## Step 6 — Smoke test the live app

1. Open `https://<your-project>.vercel.app`.
2. DevTools → **Network**: confirm `/api/v1/...` requests hit the Render backend and return `200` (not CORS errors).
3. Register / log in — confirm the auth flow and that no `401`/CORS errors appear in the console.
4. Create or join a game room — confirm the **Socket.IO** connection establishes (Network → WS tab shows a `101 Switching Protocols` to `/socket.io`).
5. Play a turn to confirm real-time events flow both ways.

---

## Configuration cheat-sheet

|                | Backend (Render)                                                            | Frontend (Vercel)                      |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| Root directory | _(repo root — blank)_                                                       | `frontend`                             |
| Build          | `npm install && npm run prisma:deploy --workspace backend && npm run build` | `npm run build`                        |
| Start          | `npm run start --workspace backend`                                         | — (static)                             |
| Prisma client  | auto via `postinstall` (`prisma generate`)                                  | —                                      |
| Output         | `dist/` (`node dist/app/server.js`)                                         | `dist/`                                |
| Node           | 20                                                                          | 20                                     |
| Key envs       | `DATABASE_URL`, `CORS_ORIGINS`, JWT/COOKIE secrets, `COOKIE_DOMAIN`         | `VITE_API_BASE_URL`, `VITE_SOCKET_URL` |

---

## Troubleshooting

| Symptom                                                                            | Likely cause / fix                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CORS error** in browser console                                                  | `CORS_ORIGINS` on Render doesn't exactly match the Vercel origin (scheme + host, no trailing slash). Update and redeploy backend.                                                                                |
| **Socket won't connect** / repeated reconnects                                     | `VITE_SOCKET_URL` wrong, or backend asleep (free-tier cold start). Check `VITE_SOCKET_PATH=/socket.io` matches backend.                                                                                          |
| **API calls 404**                                                                  | `VITE_API_BASE_URL` missing the `/api/v1` suffix.                                                                                                                                                                |
| **Login works but session lost on refresh**                                        | Cross-site cookie not stored — needs `SameSite=None; Secure`; verify `COOKIE_DOMAIN`. See Step 5.                                                                                                                |
| **Build fails: `@prisma/client has no exported member 'User'`** (and many similar) | The Prisma client wasn't generated before `tsc`. It should run automatically via the backend `postinstall` (`prisma generate`). Confirm that script exists in `backend/package.json` and that `npm install` ran. |
| **`husky: not found` / `npm error code 127` during install**                       | The root `prepare` script is guarded as `husky \|\| true` so it no-ops in CI where husky/`.git` hooks aren't set up. Ensure that guard is present in the root `package.json`.                                    |
| **Migrations not applied**                                                         | Confirm `prisma:deploy` runs in build and migration files are committed under `backend/prisma/migrations/`.                                                                                                      |
| **Deep-link 404 on Vercel**                                                        | Add `frontend/vercel.json` SPA rewrite (Step 3c).                                                                                                                                                                |
| **Env var change ignored on frontend**                                             | `VITE_*` vars are build-time — redeploy after changing them.                                                                                                                                                     |
| **First request very slow**                                                        | Free Render instance cold start (~30–60s). Upgrade to a paid instance for real-time use.                                                                                                                         |
