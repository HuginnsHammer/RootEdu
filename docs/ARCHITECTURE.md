# Architecture

The first client is React Native / Expo for iOS and Android. It consumes a versioned FastAPI API; domain rules stay on the server so a web client can be added later.

## Trust boundaries
- Tenant context comes from trusted deployment configuration and authenticated identity. The client cannot select a tenant.
- Registration number parsing is not proof of enrollment; verify against an authorized roster.
- Routes delegate domain work to services; persistence adapters stay separate from API contracts.
- Document binaries live in private object storage. PostgreSQL stores metadata, authorization relationships and integrity hashes.
- Cached files must pass SHA-256 verification before opening.

## Planned modules
Identity, authorization, academic structure, resources, timetable, announcements, notifications, audit, security events, storage and attendance.

## MUST pilot
CT206 (Bachelor of Computer Security and Forensics), CT204 (Bachelor of Computer Technology), CT201 (Bachelor of Computer Science). Domain and programme policy is configuration-driven.
