# AGENTS.md

LessonsWebsite ("EduSphere") — a lesson/quiz app. Expo 57 frontend (`frontend/`), Express 5 + MySQL 8.4 backend (`backend/`). Local dev runs MySQL and the backend in Docker Compose; the frontend runs on the host.

Before editing, read the deeper guide for the area you're touching: [frontend/AGENTS.md](frontend/AGENTS.md) (Expo v57 docs warning — read it) or [backend/AGENTS.md](backend/AGENTS.md).

## Run

- Backend + DB: `docker compose up --build -d` from the repo root (needs `.env`, copy `.env.example`). API at `http://localhost:5001/api`, MySQL on host port `3308`.
- Frontend: `cd frontend && npm install && npm run web` → `http://localhost:8081`. Set `EXPO_PUBLIC_API_URL` to override the API target; it defaults to `http://<hostname>:5001/api`.
- Test logins (local only, password `123`): `admin@lessonswebsite.local`, `user@lessonswebsite.local`.
- Setup details, teardown, useful Compose commands: [DOCKER.md](DOCKER.md).

## Verify

There is no test suite (`npm test` in `backend/` is a stub). Verify changes with:

- `cd frontend && npx tsc --noEmit` — strict TypeScript; `npm run lint` for Expo lint.
- `curl.exe http://localhost:5001/api/topics` against the running stack; `docker compose logs -f backend` for backend errors.

## Layout

- `frontend/src/app/` — expo-router entry; navigation is manual screen-switching, not router routes.
- `frontend/src/screens/`, `src/components/`, `src/constants/` — pages, shared UI, `API_URL` + theme.
- `backend/server.js` — all routes in one file: auth, topics, images, quizzes, attempts.
- `backend/db.js` — `mysql2/promise` pool configured by `DB_*` env vars.
- `backend/mysql-clean-init/` — schema + test accounts for the Docker stack. This is the schema source of truth.
- `backend/mysql-init/` — legacy incremental migrations, kept as history only; the clean stack never runs them.
- `backend/seeds/` — quiz JSON + seeders. Root `seed.js` is the universal quiz seeder but defaults to port 5000 — point `API_URL`/`TOPICS_URL` at `localhost:5001` for the clean stack.
- `replace.js` — leftover one-off codemod referencing an old path; leave it alone.

## API contract

- Auth is parameter-based: requests pass `authorId`/`userId`, and the frontend stores the user in `localStorage`. There are no sessions, tokens, or auth middleware — treat every endpoint as unauthenticated.
- Request/response JSON is camelCase; DB columns are snake_case (`parentTopicId` ↔ `parent_topic_id`).
- Topics form a two-level tree via `topics.parent_topic_id`; only top-level topics may be parents. One quiz per topic (`quizzes.topic_id` UNIQUE) — `POST /api/quizzes` deletes and replaces an existing quiz for that topic.
- Topic image uploads are multipart (`images[]` files + `imagePositions` JSON string), served at `/uploads/` from a Docker volume.
- Schema changes: edit `backend/mysql-clean-init/*.sql`, then `docker compose down -v` and `docker compose up --build -d`. The init scripts run only on a fresh volume; `down -v` wipes all local DB data and uploads.
- Collaboration: feature branches + PRs; keep `.env`, DB dumps, and uploads out of Git.
