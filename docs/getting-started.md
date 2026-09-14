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
`w` (or `npm run web`) to run it in a browser. If you're testing on a physical phone, see
[Running on a physical phone](#running-on-a-physical-phone) below — there are a few gotchas.

## Running on a physical phone

Testing with Expo Go on a real device (rather than a simulator) has a few sharp edges:

- **`localhost` won't work.** `mobile/.env`'s `EXPO_PUBLIC_API_URL` must point at your machine's
  LAN IP (e.g. `http://192.168.1.23:3000/v1`), not `localhost`, since the phone resolves
  `localhost` to itself. Find your IP with `ipconfig` (Windows) / `ifconfig` or `ip addr`
  (macOS/Linux).
- **Campus/corporate Wi-Fi often blocks phone↔laptop traffic** (client/AP isolation), even
  though both devices show the same SSID. If Expo Go says "Could not connect to the server" and
  your setup otherwise looks correct, this is the most likely cause. Workaround: connect your
  laptop to your **phone's personal hotspot** instead, and update `EXPO_PUBLIC_API_URL` (and the
  Metro hostname below) to the IP your laptop gets on that hotspot network.
- **Multiple network adapters can confuse Metro's IP autodetection** — e.g. WSL's virtual
  `vEthernet` adapter on Windows. If Expo Go still can't connect after fixing the network, force
  the correct IP explicitly:
  ```powershell
  $env:REACT_NATIVE_PACKAGER_HOSTNAME="<your-laptop-LAN-or-hotspot-IP>"
  npx expo start
  ```
- **Expo Go's SDK version must match the project's.** The Expo Go app from the App
  Store/Play Store always tracks the *latest* SDK and can't be downgraded, so the project's
  `expo` version (currently SDK 57, see `mobile/package.json`) must stay current with whatever
  Expo Go you have installed. If you see "Project is incompatible with this version of Expo Go",
  either the project or the app is out of date — upgrading the project is done via
  `npx expo install expo@<target>` followed by `npx expo install --fix` (expect to re-verify
  `npm run typecheck`, `npm run lint`, and a manual smoke test afterward — this is a real
  migration, not just a version bump).
- **Expo Go may require you to be signed into an Expo account** to open a locally-served project,
  even over plain LAN (not just tunnel mode). If you see "You need to be signed in to Expo Go and
  Expo CLI to open your project", sign into the same free Expo account in both the Expo Go app on
  your phone and via `npx expo login` on your machine, then restart `npx expo start`.

## Common tasks

| Task | Command |
|---|---|
| Lint backend | `cd backend && npm run lint` |
| Lint mobile | `cd mobile && npm run lint` |
| Typecheck mobile | `cd mobile && npm run typecheck` |
| Build backend | `cd backend && npm run build` |
| Create a new migration | `cd backend && npm run migration:generate -- src/database/migrations/<Name>` |
| Revert last migration | `cd backend && npm run migration:revert` |

## Troubleshooting

- **`'npm' is not recognized as an internal or external command`** when running a backend script
  that itself calls another npm script (e.g. `npm run migration:run`, which internally runs
  `npm run typeorm -- ...`) — this is a Windows-shell PATH quirk with nested `npm run`
  invocations. Work around it by calling the underlying binary directly instead of through the
  wrapping script, e.g.:
  ```
  node_modules/.bin/typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run
  ```
- **`EADDRINUSE: address already in use :::3000`** when running `npm run start` or
  `npm run start:dev` — the backend is already running in another terminal (or in the
  background). Check for it (`curl http://localhost:3000/v1/health`) before starting a second
  instance instead of killing and restarting unnecessarily.
- Physical-phone-specific issues (network, Expo Go SDK mismatch, Expo account sign-in) are
  covered in [Running on a physical phone](#running-on-a-physical-phone) above.

## What's implemented vs. placeholder

- **Implemented**: registration, login, logout (token blacklist via Redis), get/update own
  profile, JWT auth guard, global validation + error handling, Swagger docs, migrations for all
  four tables, Docker Compose, CI.
- **Placeholder only** (route + auth wiring, no business logic): `GET /v1/rides`,
  `GET /v1/rides/:rideId`, `GET /v1/vehicles`, `GET /v1/ride-requests`, and the corresponding
  mobile screens (`RideSearchScreen`, `RideDetailsScreen`, `CreateRideScreen`, `MyRidesScreen`).

See [`api-spec.md`](api-spec.md) for the full route list.
