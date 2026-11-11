# RootEdu

**A security-first academic operating system for universities.** Built by **Root & Weights Lab**, with Meru University of Science and Technology (MUST) as the first pilot.

The first delivery is an iOS and Android app. The web client is deferred; the versioned API is designed to support it later.

## MUST pilot programmes
- **CT206** — Bachelor of Computer Security and Forensics
- **CT204** — Bachelor of Computer Technology
- **CT201** — Bachelor of Computer Science

Example registration format: `CT206/123456/25`. A prefix is not proof of enrollment; the backend must verify identity against an authorized institutional roster.

## Stack
- Mobile: Expo, React Native, TypeScript
- API: Python 3.12+, FastAPI, Pydantic v2
- Data: PostgreSQL 16, Redis
- Private object storage: MinIO locally, S3-compatible in production

## Start locally
Requirements: Node.js 20+, npm, Python 3.12+, Docker Compose.

```sh
cp .env.example .env
docker compose up -d postgres redis minio
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

In another terminal: `cd mobile && npm install && npx expo start`. For a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Status
This branch establishes the mobile shell, API boundary, MUST pilot policy, local infrastructure and security documentation. It does **not** claim production authentication, roster verification, document storage, push delivery, attestation or attendance are implemented. Security and correctness come before convenience; no fake authentication or client-controlled tenant selection.
