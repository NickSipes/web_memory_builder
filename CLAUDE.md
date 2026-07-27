# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A website for collecting video messages and text notes ("memories") for a special event (currently Jerry Sipes' 80th birthday). Guests leave a message; the honoree gets access to the library after the party.

## Commands

Postgres (from repo root):
```bash
docker compose up -d
```

Backend (from `backend/`, venv in `backend/.venv`):
```bash
source .venv/bin/activate
uvicorn main:app --reload   # serves on :8000
alembic upgrade head        # apply migrations
alembic revision --autogenerate -m "msg"
pip install -r requirements-dev.txt   # test deps (pytest, moto)
python -m pytest tests/     # runs against in-memory sqlite + moto-mocked S3
```

Frontend (from `frontend/`):
```bash
npm run dev      # Vite on :5173
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm test         # vitest run (jsdom)
```

Backend tests point `DATABASE_URL` at sqlite in `tests/conftest.py` and mock S3 with moto — no Docker/AWS needed. Frontend `Browse` tests mock global `fetch` rather than the api module (a vitest-4 bug flags a `vi.fn()` that returns a rejected promise in non-first tests). Vitest is pinned to `^4`; v3 breaks on the React 19 JSX runtime.

## Architecture

Three tiers: React SPA → FastAPI → Postgres, with video bytes bypassing the API and going straight to S3.

**Upload flow (the important part).** Videos never pass through FastAPI. The browser (`useUpload.ts`) asks the API for a presigned S3 PUT URL, PUTs the blob directly to S3 via `XMLHttpRequest` (for progress events), then POSTs only the metadata + returned `s3_key` to `/submissions`. Text notes skip S3 entirely and go straight to Postgres. Playback uses presigned GET URLs generated fresh per request — never stored (`playback_url` on `SubmissionResponse`).

**Dev networking.** Frontend calls `BASE` (= `VITE_API_URL` or `/api`); in dev Vite (`vite.config.ts`) proxies `/api` to `localhost:8000` and strips the prefix. In prod set `VITE_API_URL` (frontend) and `FRONTEND_URL` (backend CORS). CORS allows `localhost:5173` plus `FRONTEND_URL`.

**Backend layout** (`backend/`, flat module imports — no package prefix):
- `main.py` — all routes. `get_db` yields a session per request.
- `models.py` — single `Submission` table (name, relation, type video|note, s3_key, content, created_at).
- `schemas.py` — Pydantic in/out; `SubmissionResponse` adds `playback_url` not on the model.
- `s3.py` — presigned PUT/GET; keys are `submissions/{uuid4}/{filename}`.
- `database.py` — engine from `DATABASE_URL`.
- Tables are created two ways: Alembic migrations *and* `create_all` on startup in `main.py`. Alembic is the source of truth; `create_all` is a backup.

**Frontend layout** (`frontend/src/`):
- `pages/` — routed views (Landing → Record → Confirm; Browse). Landing collects name+relation and passes them to `/record` via React Router location state (not URL) — refreshing `/record` loses state and redirects home.
- `hooks/useMediaRecorder.ts` — camera/MediaRecorder state machine (idle→requesting→ready→recording→preview). Handles `getUserMedia`, blob assembly, and object-URL cleanup.
- `hooks/useUpload.ts` — the presign→S3→metadata orchestration.
- `api.ts` / `types.ts` — fetch wrappers and types mirroring the Pydantic schemas. Keep `types.ts` in sync with `schemas.py`/`models.py` by hand.

## Config

`backend/.env` (see `.env.example`): `DATABASE_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`. S3 client uses signature v4 (required for presigned URLs on newer buckets). The Postgres creds in `docker-compose.yml` must match `DATABASE_URL`.
