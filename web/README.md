# RootEdu web client

A responsive web experience for the RootEdu MUST pilot. It uses the existing FastAPI public bootstrap, health/readiness and beta-feedback endpoints. It does not pretend student sign-in, academic records, timetables or the library are live before those backend capabilities exist.

## Run locally

Start the API first from the repository root:

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

Open http://localhost:5173. Vite proxies /api/* to http://127.0.0.1:8000. Override the proxy target with ROOTEDU_API_PROXY if needed.

## Production API

Set VITE_API_BASE_URL to the public API base URL including its version prefix, for example https://api.example.edu/api/v1, before building. The API must allow the website's origin through its CORS policy. Do not put secrets in Vite environment variables; they are embedded in public browser assets.

~~~sh
VITE_API_BASE_URL=https://your-api-host.example/api/v1 npm run build
npm run preview
~~~

The output is written to dist/. Deploy it to a static host or serve it behind the same reverse proxy as the API. A production API host and domain have not been configured in this repository yet.

## Checks

~~~sh
npm run typecheck
npm run build
~~~
