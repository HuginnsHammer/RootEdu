# RootEdu

**A security-first academic operating system for universities.** Built by **Root & Weights Lab**, with Meru University of Science and Technology (MUST) as the first pilot.

The first delivery is an iOS and Android app. The web client is deferred; the versioned API is designed to support it later.

## MUST pilot programmes
- **CT206** — Bachelor of Computer Security and Forensics
- **CT204** — Bachelor of Computer Technology
- **CT201** — Bachelor of Computer Science

Example registration format: `CT206/123456/25`. A prefix is not proof of enrollment; the backend must verify identity against an authorized institutional roster.

## Stack
- Mobile: Expo, React Native, TypeScript, Expo Updates
- API: Python 3.12+, FastAPI, Pydantic v2
- Data: PostgreSQL 16, Redis
- Private object storage: MinIO locally, S3-compatible in production
- Beta feedback: server-side SMTP delivery to `trialsandwins@gmail.com`

## Release and testing
- Pull-request CI validates backend and mobile code and builds a short-lived Android debug artifact.
- Tagged `test-v*` builds publish a shareable Android tester APK and SHA-256 checksum as a GitHub Release.
- OTA releases use Expo Updates-compatible runtime versions, signed manifests, staging and production channels, and rollback. Signed EAS Update publishing requires an eligible Expo Production or Enterprise plan; see [mobile release instructions](mobile/README.md).
- Beta testers can send feedback from the app; SMTP credentials remain on the backend.

## Start locally
Requirements: Node.js 22+, npm, Python 3.12+, Docker Compose.

```sh
cp .env.example .env
docker compose up -d postgres redis
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -e '.[dev]'
alembic upgrade head
uvicorn app.main:app --reload
```

In another terminal: `cd mobile && npm install && npx expo start`. For a physical phone, set the API URL to your computer's LAN IP. See [mobile/README.md](mobile/README.md) and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Status
This branch advances the mobile shell, live pilot bootstrap, OTA release controls, tester APK distribution and beta feedback delivery. Student authentication, roster verification, authorized academic resources, timetable records, announcements, push delivery, production attestation and production operational hardening are not yet complete. Security and correctness come before convenience; no fake authentication or client-controlled tenant selection.
