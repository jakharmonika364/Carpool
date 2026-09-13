# Getting Started — Month 1 Foundation

This covers the **Month 1 foundation**: architecture, database schema, a NestJS backend with
authentication and profile management, a React Native mobile scaffold, and the local dev/CI
setup they run on. See the [project README](../README.md) for the overall product vision.

Full ride creation, matching, chat, live tracking, and payments are **not** implemented yet —
see [`requirements.md`](requirements.md) for the complete Month 1 scope and what's deferred.

## Repository layout

```text
backend/    NestJS API (auth, users, placeholder rides/vehicles/ride-requests)
mobile/     React Native (Expo) app
docs/       Requirements, architecture, ERD, API route spec
docker-compose.yml   API + PostgreSQL/PostGIS + Redis for local dev
.env.example         Shared environment variables (copy to backend/.env)
```

Docs: [requirements](requirements.md) · [architecture](architecture.md) ·
[ERD](erd.md) · [API routes](api-spec.md)

## Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres/PostGIS + Redis, and optionally the API container)
- Expo Go app on your phone, or an iOS/Android simulator, to run the mobile app

## Running everything locally

### 1. Start PostgreSQL + Redis (and optionally the API) with Docker Compose

```bash
docker compose up -d postgres redis
```

This starts a PostGIS-enabled Postgres on `localhost:5432` (db `campus_carpool`, user/password
`postgres`/`postgres`) and Redis on `localhost:6379`, both with persistent volumes.

You can also run the API itself in Docker instead of locally with `npm run start:dev`:

```bash
docker compose up -d
```

The `api` container runs pending migrations automatically before starting.

### 2. Configure and run the backend (if not running it via Docker)

```bash
cd backend
copy ..\.env.example .env      # PowerShell: Copy-Item ..\.env.example .env
npm install
npm run migration:run          # creates users/vehicles/rides/ride_requests, enables PostGIS
npm run start:dev
```

The API listens on `http://localhost:3000`. Swagger docs: `http://localhost:3000/docs`.
Health check: `http://localhost:3000/v1/health`.

### 3. Run the backend tests

```bash
cd backend
npm test          # unit tests
npm run test:e2e  # end-to-end tests — requires Postgres + Redis running (step 1)
```

### 4. Run the mobile app

```bash
cd mobile
copy .env.example .env         # PowerShell: Copy-Item .env.example .env
npm install
npm start
```

Edit `mobile/.env`'s `EXPO_PUBLIC_API_URL` if the API isn't reachable at
`http://localhost:3000/v1` from your device/simulator (e.g. use your machine's LAN IP when
testing on a physical phone via Expo Go, since `localhost` there refers to the phone itself).

Then press `a` (Android emulator), `i` (iOS simulator), or scan the QR code with Expo Go, or
`w` (or `npm run web`) to run it in a browser.

## Common tasks

| Task | Command |
|---|---|
| Lint backend | `cd backend && npm run lint` |
| Lint mobile | `cd mobile && npm run lint` |
| Typecheck mobile | `cd mobile && npm run typecheck` |
| Build backend | `cd backend && npm run build` |
| Create a new migration | `cd backend && npm run migration:generate -- src/database/migrations/<Name>` |
| Revert last migration | `cd backend && npm run migration:revert` |

## What's implemented vs. placeholder

- **Implemented**: registration, login, logout (token blacklist via Redis), get/update own
  profile, JWT auth guard, global validation + error handling, Swagger docs, migrations for all
  four tables, Docker Compose, CI.
- **Placeholder only** (route + auth wiring, no business logic): `GET /v1/rides`,
  `GET /v1/rides/:rideId`, `GET /v1/vehicles`, `GET /v1/ride-requests`, and the corresponding
  mobile screens (`RideSearchScreen`, `RideDetailsScreen`, `CreateRideScreen`, `MyRidesScreen`).

See [`api-spec.md`](api-spec.md) for the full route list.
