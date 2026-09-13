# Requirements — Month 1 Foundation

## Purpose

Campus Carpool is a ride-sharing application for verified students on a campus. Month 1
establishes the technical foundation — architecture, schema, authentication, and scaffolding —
that later months build ride creation, matching, chat, and live tracking on top of.

## Actors

| Actor | Description |
|---|---|
| Student | A campus user who will later act as a rider, driver, or both. Can register, log in, and manage their own profile in Month 1. |
| Admin | A future platform moderator. Only the role and schema field exist in Month 1 — no admin-specific behavior is implemented. |

## Functional requirements (Month 1)

| ID | Requirement |
|---|---|
| FR-1 | A student can register with full name, email, phone number, and password. |
| FR-2 | Registration rejects duplicate emails and duplicate phone numbers. |
| FR-3 | Passwords are stored only as salted hashes, never in plain text. |
| FR-4 | A student can log in with email and password and receive a JWT access token. |
| FR-5 | A student can retrieve their own profile via a JWT-protected endpoint. |
| FR-6 | A student can update their own full name and phone number. |
| FR-7 | A student can log out; their access token is invalidated for its remaining lifetime. |
| FR-8 | All protected endpoints reject requests without a valid JWT (401). |
| FR-9 | All request bodies are validated; invalid input returns 422 with a consistent error shape. |
| FR-10 | Placeholder, JWT-protected routes exist for rides and vehicles, returning stub responses. |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | PostgreSQL is the system of record; Redis holds only temporary data (token blacklist, future OTP/rate-limit/cache use). |
| NFR-2 | The schema uses PostGIS geography columns for ride pickup/destination points so future matching can use spatial queries without a migration. |
| NFR-3 | The API is documented via Swagger/OpenAPI at `/docs`. |
| NFR-4 | The local environment runs entirely through Docker Compose (API, Postgres+PostGIS, Redis). |
| NFR-5 | CI runs lint, backend tests, and builds for both backend and mobile on every push/PR to `main`. |
| NFR-6 | Secrets are only ever supplied via environment variables, never committed. |

## Explicitly out of scope for Month 1

Ride creation and matching logic, Google Maps integration, route optimisation, live location
sharing, chat (Socket.IO), push notifications, payments, cloud image uploads, an admin
dashboard, analytics, Kubernetes, and production cloud deployment. See the project root
`README.md` for the full list and the rationale (these depend on the foundation shipped here).

## Acceptance criteria

See "Completion Criteria" in the project root `README.md` — it is treated as the authoritative
Month 1 checklist.
