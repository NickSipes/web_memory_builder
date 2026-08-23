# Handoff — Jerry Sipes' 80th Birthday site

Onboarding for a fresh agent/session. Pairs with `CLAUDE.md` (architecture + commands)
and `deploy/teardown-aws.sh` (tear everything down after the party).

## What it is
A website where family/friends leave a **video, photo, or note** for Jerry Sipes'
surprise 80th birthday, and **RSVP**. Media is compiled into a keepsake played at the
party; the honoree gets access to the site afterward. Event: **Sat Oct 17, 2026, 5–9 PM**
(guests arrive 4:45), St. Helen's of the Cross Parish Hall, Eloy AZ. It's a **surprise** —
the site says so and asks people to keep it quiet.

## Repo / status
- GitHub: `NickSipes/web_memory_builder` (public). Uses `gh` CLI.
- Active work is on branch **`feature/rsvp`**, open as **PR #2** (not merged yet — `main`
  has PR #1's work only). Recent features were all committed here.
- The owner is Nick (nicktsipes@gmail.com); "Dad" is an end user giving feedback.

## Live URLs
- Frontend (AWS Amplify): https://main.d1yykjqf4v9cl.amplifyapp.com
- Backend API (AWS App Runner): https://3uphtjpwsh.us-east-1.awsapprunner.com
- Admin dashboard: `/admin` — login **admin / katienick** (backend `ADMIN_PASSWORD`
  env, also the default in `backend/main.py`). Moderates submissions, reads RSVPs +
  bug reports, downloads media (zip) and RSVPs (CSV).

## Architecture
React SPA (Vite/TS) → FastAPI → Postgres, with media going **browser → S3 directly**
via presigned URLs (never through the API). See `CLAUDE.md` for detail. Key frontend
pages: `/` (hub with two buttons), `/message` → `/record` (leave a message),
`/rsvp` (event + RSVP), `/browse`, `/admin`, `/report-bug`.

## Local dev, tests, build (from `frontend/` and `backend/`)
- Backend: `source .venv/bin/activate`; `python -m pytest tests/` (sqlite + moto, no AWS).
- Frontend unit: `npm test` (vitest/jsdom). Frontend E2E: `npm run e2e` (Playwright vs the
  prod build with the backend mocked). **Run both before deploying.**
- Full-stack local: `docker compose up -d` (Postgres) + `uvicorn main:app --reload` +
  `npm run dev`.

## Deploy runbook (owner has AWS CLI configured as user `jerry-deploy`, AdministratorAccess)
All resources in **us-east-1**, account **842712741261**.

**Frontend → Amplify** (from `frontend/`):
```bash
npm run build                      # VITE_API_URL baked from .env.production (committed)
cd dist && zip -r /tmp/site.zip .  # then create-deployment + upload zip + start-deployment
aws amplify create-deployment --app-id d1yykjqf4v9cl --branch-name main ...
```
**Backend → App Runner** (from `backend/`):
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin 842712741261.dkr.ecr.us-east-1.amazonaws.com
docker buildx build --platform linux/amd64 --provenance=false --sbom=false -t 842712741261.dkr.ecr.us-east-1.amazonaws.com/jerry-backend:latest --push .
aws apprunner start-deployment --service-arn <jerry-backend arn>
```
Alembic migrations run automatically on container start (`alembic upgrade head`).

## AWS resources
- Amplify app `jerry-frontend` (id `d1yykjqf4v9cl`).
- App Runner service `jerry-backend` (instance role `jerry-apprunner-instance` has S3
  Put/Get/Delete; access role `jerry-apprunner-ecr`). Env: `DATABASE_URL`,
  `S3_BUCKET_NAME=jerry-memory-builder`, `AWS_REGION`, `ADMIN_PASSWORD`, `FRONTEND_URL`.
- RDS Postgres `jerry-memory-db` — **publicly accessible** (temporary; guarded by a strong
  password). ECR repo `jerry-backend`. S3 uploads bucket `jerry-memory-builder`.
- **Secrets NOT in the repo:** the RDS password lives only in the App Runner `DATABASE_URL`
  env; AWS creds live in the owner's `~/.aws`. Don't commit them.

## Hard-won gotchas (don't re-learn these)
- **`frontend/.env.production`** must hold `VITE_API_URL` (the App Runner URL). Without it a
  build falls back to `/api`, Amplify returns index.html, and every API call fails with
  "Unexpected token '<'". The E2E suite guards this by mocking on the App Runner host.
- **S3 CORS for browser fetch** needs the **virtual-hosted regional** endpoint
  (`bucket.s3.us-east-1.amazonaws.com`), set in `backend/s3.py` via `endpoint_url` +
  `addressing_style: virtual`. The global endpoint returns no CORS headers to `fetch`.
- **Downloads** fetch with `cache: 'no-store'` (the `<video>`/`<img>` tags poison the cache
  with a CORS-less response).
- **Video recording** uses MP4 where supported (`useMediaRecorder`) — Safari can't play WebM.
- App Runner + private RDS needed a NAT/endpoints; we chose a public RDS instead. Building the
  image must be `--platform linux/amd64 --provenance=false` (App Runner is x86, no attestations).

## Open tasks
- Merge **PR #2** into `main` (it's large — consider a squash merge).
- **Custom domain** `JerrySipesBirthday.com`: register in Route 53, then
  `aws amplify create-domain-association` for the app (+ `www`), and add the new origin to the
  backend `FRONTEND_URL` and the S3 uploads-bucket CORS. Domain was confirmed available (~$16/yr).
- **ZIP code**: event address shows `85231`; Eloy AZ is usually **85131** — confirm/correct in
  `frontend/src/event.ts`.
