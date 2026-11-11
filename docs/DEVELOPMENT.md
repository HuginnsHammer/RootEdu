# Local development

## API
```sh
cp .env.example .env
docker compose up -d postgres redis minio
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Liveness: `http://127.0.0.1:8000/api/v1/health`. Interactive docs are enabled only in development.

## Mobile
```sh
cd mobile
npm install
npx expo start
```
For a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP. `localhost` on the phone refers to the phone itself.

## Checks
```sh
cd backend && pytest && ruff check .
cd ../mobile && npm run typecheck
```
The current mobile shell uses honest empty states. It does not simulate a signed-in student or invent library/timetable records.
