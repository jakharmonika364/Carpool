# Verified Carpool & Ride Matching Platform

A safety-first, route-based carpooling platform for India. It helps passengers find drivers travelling along compatible routes, while prioritising verified identities, recurring driver availability, gender-preference matching, and in-trip safety tools.

## Team

- Monika Jakhar
- Ayush Patel

## Problem

Existing carpool platforms can match routes, but trust and safety verification is often limited. This project aims to make verification, transparent matching, and passenger safety central to the ride-sharing experience.

## Key Features

- Driver licence and vehicle-registration verification through a DigiLocker-linked KYC provider
- Live selfie liveness check and face matching for driver verification
- Recurring driver routes with selected days and departure time windows
- One-date availability exceptions without deleting a saved route
- Route-buffer matching for passenger pickup and drop locations
- Match ranking based on estimated detour time
- Optional gender-preference filtering for drivers and passengers
- Server-enforced cost-sharing fare cap
- Pickup verification using a shared code or QR code
- In-trip SOS alerts to emergency contacts
- Live location sharing with trusted contacts
- Post-trip mutual ratings
- In-app chat available only for confirmed rides
- Admin review queue for flagged verifications and reports
- Prometheus-compatible health and performance metrics

## Main User Flow

1. A user signs up and completes the required verification.
2. A verified driver creates a recurring route.
3. A passenger searches using pickup point, drop point, and date.
4. The platform finds and ranks compatible driver routes.
5. The passenger requests a ride and the driver confirms it.
6. Both users confirm a pickup code before the trip starts.
7. During the trip, SOS and live-location sharing are available.
8. After completion, both users can submit ratings.

## Safety Principles

- A driver cannot create routes until verification is complete.
- A verified badge is shown only after the underlying verification succeeds.
- Fare limits are enforced by the server, not only the app interface.
- SOS actions are logged and notify preset emergency contacts.
- Exact phone numbers are not exposed before a ride is confirmed.
- Identity, biometric, and trip data must be handled with consent and retention controls.

## Core Requirements

| Area | Requirement |
|---|---|
| Identity | Verify driver DL and RC before route creation |
| Trust | Require live liveness selfie and face match for drivers |
| Routes | Support recurring routes and date-specific unavailability |
| Matching | Match pickup and drop points within a route buffer |
| Fares | Cap fares at a configurable cost-sharing rate |
| Preferences | Provide optional gender-based match filtering |
| Trip start | Confirm a shared code or QR before starting |
| Safety | Provide SOS and emergency-contact notifications |
| Operations | Route uncertain verification results to manual review |

## Planned API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register a user |
| `POST` | `/api/v1/routes` | Create a recurring driver route |
| `PATCH` | `/api/v1/routes/:id/unavailable` | Mark a date unavailable |
| `POST` | `/api/v1/rides/search` | Search compatible rides |
| `POST` | `/api/v1/rides/:matchId/request` | Request a ride |
| `POST` | `/api/v1/trips/:id/confirm-code` | Confirm pickup code |
| `POST` | `/api/v1/trips/:id/sos` | Trigger an emergency alert |
| `POST` | `/api/v1/trips/:id/share-location` | Generate a live-location link |
| `GET` | `/api/v1/metrics` | Expose platform metrics |
| `GET` | `/api/v1/health` | Check service health |

## Planned Architecture

- Mobile application for drivers and passengers
- Backend API for authentication, verification, routes, matching, and trips
- PostgreSQL with PostGIS for location and route data
- Redis for temporary trip and live-location data
- KYC provider for DL, RC, liveness, and face-match verification
- Routing provider or engine for route polylines and detour estimation
- Admin dashboard for verification and moderation reviews
- Prometheus-compatible metrics for observability

## Non-Functional Goals

- Verification response target: under 10 seconds in normal conditions
- Ride-match query target: under 2 seconds
- Matching and trip-service availability target: 99%
- No fare above the configured cap
- No raw government-ID numbers, selfies, or full location traces in logs

## Testing Focus

- Driver verification and liveness rejection cases
- Route matching and gender-filter correctness
- Server-side fare cap enforcement
- Pickup-code mismatch handling
- SOS delivery under weak-network conditions
- Date-specific driver unavailability
- Concurrent ride-search performance

## Project Status

🚧 In development

## Disclaimer

This is an educational project. Any production deployment involving identity documents, biometrics, location data, emergency notifications, or fare collection requires legal review, privacy controls, consent mechanisms, and approved third-party providers.
