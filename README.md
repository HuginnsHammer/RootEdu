# RootEdu

**A security-first academic operating system for universities.** Built by **Root & Weights Lab**, with Meru University of Science and Technology (MUST) as the first pilot.

RootEdu now has an Android/iOS app foundation and a responsive web experience. Both clients share the versioned FastAPI backend. The web experience provides the public pilot introduction, live API status, pilot programme information and a feedback form; student sign-in and academic records remain gated until their backend foundations are ready.

## MUST pilot programmes
- **CT206** — Bachelor of Computer Security and Forensics
- **CT204** — Bachelor of Computer Technology
- **CT201** — Bachelor of Computer Science

Example registration format: `CT206/123456/25`. A prefix is not proof of enrollment; the backend must verify identity against an authorized institutional roster.

## Stack
- Web: React 19, TypeScript, Vite, responsive CSS
- Mobile: Expo, React Native, TypeScript, Expo Updates
- API: Python 3.12+, FastAPI, Pydantic v2
- Data: PostgreSQL 16, Redis
- Private object storage: MinIO locally, S3-compatible in production
- Beta feedback: server-side SMTP delivery to `trialsandwins@gmail.com`

## Run locally
Requirements: Node.js 22+, npm, Python 3.12+, Docker Compose.

Start the API:
~~~sh
cp .env.example .env
docker compose up -d postgres redis
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -e '.[dev]'
alembic upgrade head
uvicorn app.main:app --reload
~~~

In another terminal, start the web client:
~~~sh
cd web
npm install
npm run dev
~~~
Open http://localhost:5173. The Vite development server proxies API requests to localhost:8000. See [web/README.md](web/README.md) for production API configuration.

To run the mobile app instead: `cd mobile && npm install && npx expo start`. For a physical phone, set its API URL to your computer's LAN IP. See [mobile/README.md](mobile/README.md).

## Release and testing
- Pull-request CI validates backend, mobile and web code and builds a standalone Android tester APK.
- The Android APK build packages the JavaScript bundle; it does not require Metro.
- Tagged `test-v*` builds publish a shareable Android tester APK and SHA-256 checksum as a GitHub Release.
- OTA releases use Expo Updates-compatible runtime versions, signed manifests, staging and production channels, and rollback. See [mobile release instructions](mobile/README.md).
- The web client requires a deployed API URL for live status and feedback delivery. No production API host or domain is configured yet.

## Current capability boundary
The public pilot introduction, API health/readiness display, pilot bootstrap and beta feedback form are implemented in the web client. Student authentication, roster verification, authorized academic resources, timetable records, announcements, push delivery, production web hosting/API CORS configuration and production operational hardening remain separate workstreams. Security and correctness come before convenience; no fake authentication or client-controlled tenant selection.
