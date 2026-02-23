# Local website manager server

A lightweight Node.js server to run and manage the statically exported website locally.

## Start

```bash
npm run serve:local
```

By default it serves from `out/` on `http://127.0.0.1:8080`.

You can override settings:

```bash
HOST=0.0.0.0 PORT=3000 STATIC_DIR=out npm run serve:local
```

## Useful routes

- `GET /api/health` - server status, uptime, build availability
- `GET /api/site-info` - static directory details and top-level files
- `GET /api/content` - read editable website content JSON
- `PUT /api/content` - save website content JSON
- `POST /api/admin/upload-asset` - upload images, videos, and PDF files
- `POST /api/admin/upload-image` - upload image file data to `public/images/uploads/*`
- `POST /api/rebuild` - run `npm run build` from the project root

## Dashboard

After starting the server, open:

- `http://127.0.0.1:8080/dashboard`
- `http://127.0.0.1:8080/dashboard/profile`
- `http://127.0.0.1:8080/dashboard/projects`
- `http://127.0.0.1:8080/dashboard/career`

## Notes

- This is for local management and preview.
- If `out/` is missing, run `npm run build` first.
- Content data is stored in `src/data/site-content.json`.
- Uploads are saved under `public/images/uploads/*` and mirrored to `out/images/uploads/*` when available.
