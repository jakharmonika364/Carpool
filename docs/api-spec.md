# API Route Specification — Month 1 Foundation

All routes are prefixed `/v1`. Interactive, always-current documentation is served by Swagger
at `/docs` once the API is running (see [`getting-started.md`](getting-started.md)). This file
is the human-readable route map.

## Authentication (`auth` module)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/v1/auth/register` | none | Create a student account. Body: `fullName`, `email`, `phoneNumber`, `password`. Returns `201` with `{ accessToken, user }`. `409` on duplicate email/phone, `422` on invalid input. |
| POST | `/v1/auth/login` | none | Body: `email`, `password`. Returns `200` with `{ accessToken, user }`. `401` on bad credentials. |
| POST | `/v1/auth/logout` | Bearer JWT | Invalidates the current access token (blacklisted in Redis until it would have expired). Returns `200`. |
| GET | `/v1/auth/me` | Bearer JWT | Returns the authenticated user's public profile. Equivalent to `GET /v1/users/me`. |

## Users (`users` module)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/v1/users/me` | Bearer JWT | Returns the authenticated user's public profile. |
| PATCH | `/v1/users/me` | Bearer JWT | Updates the authenticated user's own `fullName` and/or `phoneNumber`. Cannot update another user. `409` if the new phone number is already taken. |

## Placeholder routes (future modules)

These exist now for route/auth wiring only; they return a stub `{ message, data: [] }` body and
implement no business logic.

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/v1/rides` | Bearer JWT | Placeholder — ride search ships with ride matching. |
| GET | `/v1/rides/:rideId` | Bearer JWT | Placeholder — ride details ship with ride matching. |
| GET | `/v1/vehicles` | Bearer JWT | Placeholder — vehicle management ships in a later month. |
| GET | `/v1/ride-requests` | Bearer JWT | Placeholder — request workflow ships with ride matching. |

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/v1/health` | none | Returns `{ status: 'ok', redis: boolean }`. Used to verify the API and Redis are reachable; excluded from Swagger. |

## Error shape

Every error response follows the same shape (see `common/filters/http-exception.filter.ts`):

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Email must be a valid email address.",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```
