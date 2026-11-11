# API contract

RootEdu exposes a versioned, client-agnostic HTTP API. Mobile is the first client; a web client can use the same contract later.

## Current endpoints

| Method | Path | Purpose | Status |
|---|---|---|---|
| GET | `/api/v1/health` | Process liveness | Implemented |
| GET | `/api/v1/ready` | PostgreSQL connectivity check | Implemented |

The readiness endpoint returns HTTP 503 with a stable error code when PostgreSQL cannot be reached. It does not expose connection strings, SQL, host details, or stack traces. Redis and object-storage checks will be added when their adapters become required for serving traffic.

## API conventions

- JSON request and response bodies; UUID identifiers.
- Version under `/api/v1`.
- Errors use a stable `code` and safe `message`; request IDs will be added to all responses as middleware is introduced.
- Tenant context is resolved by the backend from authenticated identity. Clients must never choose an institution by sending an `institution_id` or tenant header.
- Authorization is enforced server-side for every resource and action. Hiding a mobile control is not authorization.
- Paginated collection endpoints will use bounded page sizes and stable ordering.

## Planned contracts (not implemented)

Identity, email verification, refresh-token rotation, session management, resource search/download, timetable, announcements, notification registration, and administrative operations are not yet available. Do not build client flows that imply these operations work until the corresponding backend endpoints and security tests exist.
