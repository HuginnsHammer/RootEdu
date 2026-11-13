# API contract

RootEdu exposes a versioned, client-agnostic HTTP API. Mobile is the first client; a web client can use the same contract later.

## Current endpoints

| Method | Path | Purpose | Status |
|---|---|---|---|
| GET | `/api/v1/health` | Process liveness | Implemented |
| GET | `/api/v1/ready` | PostgreSQL connectivity check | Implemented |
| GET | `/api/v1/mobile/bootstrap` | Public, non-personalized pilot configuration | Implemented |
| POST | `/api/v1/feedback` | Validate and email beta feedback | Implemented; SMTP and Redis required |

### Beta feedback

The request accepts a category (`bug`, `idea`, `experience`, `other`), a 10–5,000 character message, an optional reply email, app version and device platform. The recipient defaults to `trialsandwins@gmail.com`. SMTP credentials remain server-side. Redis enforces a five-submission-per-hour per-client-address limit; the endpoint fails closed if Redis is unavailable. It returns 202 only after the SMTP server accepts the message, and safe errors when delivery is unavailable.

## API conventions

- JSON request and response bodies; UUID identifiers.
- Version under `/api/v1`.
- Errors use a stable `code` and safe `message`; request IDs will be added to all responses as middleware is introduced.
- Tenant context is resolved by the backend from authenticated identity. Clients must never choose an institution by sending an `institution_id` or tenant header.
- Authorization is enforced server-side for every resource and action. Hiding a mobile control is not authorization.
- Paginated collection endpoints will use bounded page sizes and stable ordering.

## Planned contracts (not implemented)

Identity, email verification, refresh-token rotation, session management, resource search/download, timetable, announcements, notification registration, and administrative operations are not yet available. Do not build client flows that imply these operations work until the corresponding backend endpoints and security tests exist.
