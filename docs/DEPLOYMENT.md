# Development and deployment

## Local development

Requirements: Python 3.12+, Docker Compose, and Node.js compatible with the Expo SDK declared in `mobile/package.json`.

1. Copy `.env.example` to `.env` and keep the supplied credentials strictly local.
2. Start development dependencies from the repository root:

   ```sh
   docker compose up -d postgres redis minio
   ```

3. Create a backend virtual environment and install dependencies:

   ```sh
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. Apply database migrations:

   ```sh
   alembic upgrade head
   ```

5. Start the API:

   ```sh
   uvicorn app.main:app --reload
   ```

6. In another terminal, install and start the mobile app:

   ```sh
   cd mobile
   npm install
   npx expo start
   ```

For a physical phone, set `EXPO_PUBLIC_API_URL` to the development machine's LAN address rather than `127.0.0.1`.

## Production boundary

The Compose credentials, `.env.example` values, and development adapters are not production configuration. Production must use managed secrets, TLS, a non-superuser database runtime role, separate migration credentials, private object storage, backups with restore tests, monitored queues, and a deployment-specific `DATABASE_URL`. Do not expose PostgreSQL, Redis, or MinIO administrative ports publicly.

The API is not production-ready yet: authentication, roster-backed enrollment verification, authorization, email delivery, object-storage integration, rate limiting, observability, and operational deployment controls remain to be implemented and tested. The current database migration is a development foundation, not a complete institutional data model.
