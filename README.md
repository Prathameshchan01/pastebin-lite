# Pastebin‑Lite (Take‑Home)

Small “Pastebin”‑like app with:
- create paste
- shareable URL to view paste
- optional TTL expiry and/or max view limit

## Run locally

```bash
npm install
npm run dev
```

Then open:
- UI: `http://localhost:3000/`
- Health: `GET /api/healthz`

## API

### Health check

`GET /api/healthz` → `200` JSON:

```json
{ "ok": true }
```

`ok` reflects whether the app can access its persistence layer.

### Create a paste

`POST /api/pastes` body:

```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

Response:

```json
{
  "id": "string",
  "url": "https://<host>/p/<id>"
}
```

### Fetch a paste (API)

`GET /api/pastes/:id` → `200` JSON:

```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

Unavailable pastes return `404` JSON.

### View a paste (HTML)

`GET /p/:id` → `200` HTML containing the paste content, safely escaped.  
Unavailable pastes return `404`.

## Deterministic time (grader support)

If `TEST_MODE=1` is set, the request header `x-test-now-ms: <ms since epoch>` is treated as “now” for TTL expiry logic (including TTL calculation at creation and expiry checks).

## Persistence layer

This project uses **SQLite** stored in `db/pastes.db` for persistence across requests.

If deploying to a serverless environment, a managed external datastore (Redis/KV/Postgres/etc.) is recommended, since local filesystem persistence may not survive across cold starts or instances.
