# RootEdu web client

A responsive web experience for the RootEdu MUST pilot. It uses the existing FastAPI public bootstrap, health/readiness and beta-feedback endpoints. It does not pretend student sign-in, academic records, timetables or the library are live before those backend capabilities exist.

## Run locally

Start the API from the repository root:

~~~sh
docker compose up -d postgres redis
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
~~~

In another terminal:

~~~sh
cd web
npm install
npm run dev
~~~

Open http://localhost:5173. Vite proxies /api/* to http://127.0.0.1:8000, so local development does not require browser CORS configuration.

## Production API

Set VITE_API_BASE_URL to the public API base URL including its version prefix before building, for example https://api.example.edu/api/v1. Configure the API with WEB_ALLOWED_ORIGINS containing the exact website origin, for example ["https://rootedu.example"]. Do not use a wildcard origin. Browser credentials are not enabled.

~~~sh
VITE_API_BASE_URL=https://your-api-host.example/api/v1 npm run build
npm run preview
~~~

The output is written to dist/. Deploy it to a static host or serve it behind the same reverse proxy as the API. A production API host and domain have not been configured yet.

Do not put secrets in Vite environment variables; they are embedded in public browser assets.

## Checks

~~~sh
npm run typecheck
npm run build
~~~
