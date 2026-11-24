# Supported stacks

men-pack supports all 18 combinations in this matrix:

| Framework | MongoDB | PostgreSQL | SQLite | Languages |
| --- | --- | --- | --- | --- |
| Express | Mongoose | `pg` | `better-sqlite3` | JavaScript, TypeScript |
| Fastify | Mongoose | `pg` | `better-sqlite3` | JavaScript, TypeScript |
| NestJS | Mongoose | `pg` | `better-sqlite3` | JavaScript, TypeScript |

Select one option from each category with the interactive wizard, or pass `--framework`, `--database`, and `--language` to `men-pack init`.

## Generated structure

Express and Fastify projects start with:

```text
src/
  app.ts                 # Framework app and health endpoint
  config/
    database.ts          # Database connection and startup check
  server.ts              # Startup and graceful shutdown
test/
  health.test.ts
```

NestJS projects use the Nest module/controller structure:

```text
src/
  app.controller.ts
  app.module.ts
  config/
    database.ts
  server.ts
test/
  health.test.ts
```

JavaScript projects use `.js` files in place of `.ts`; TypeScript projects include `tsconfig.json` and compile into `dist/`.

All generated projects also include `package.json`, `.env.example`, `.gitignore`, `.editorconfig`, `eslint.config.mjs`, and a project README. MongoDB and PostgreSQL projects include `docker-compose.yml`; SQLite projects do not.

## Environment variables

The generated `.env.example` contains:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000` |
| `CORS_ORIGIN` | Comma-separated browser origin allowlist |
| `MONGODB_URI` | MongoDB connection string; defaults to `mongodb://127.0.0.1:27017/men_pack` |
| `DATABASE_URL` | PostgreSQL connection string; defaults to `postgresql://men_pack:dev-only-change-me@localhost:5432/men_pack` |
| `SQLITE_PATH` | SQLite file path; defaults to `./data/app.sqlite` |

Only the selected database variable is included. Copy `.env.example` to `.env` before starting the API. The generated server loads `.env`, connects to the configured database, checks the connection, and then starts listening.

Local defaults are intended for development. MongoDB Compose is unauthenticated, and PostgreSQL Compose includes a development password. Do not expose these services publicly or reuse these credentials in production.

## Generated security defaults

- Helmet security headers are enabled.
- CORS is restricted to the configured `CORS_ORIGIN` allowlist.
- Requests are rate-limited to 100 per 15 minutes.
- JSON request bodies are limited to 1 MiB for Express and Fastify.
- Framework-specific health and resource tests are included.

The default rate limiter uses in-memory state, which is not shared across replicas. Configure a shared rate-limit store for multi-instance production deployments. The scaffold does not include authentication, authorization, input schemas, or persistent CRUD implementations; add and review these for your application.

## Generated scripts

| Script | TypeScript | JavaScript |
| --- | --- | --- |
| `npm run dev` | `tsx` watch mode | Node.js watch mode |
| `npm run build` | TypeScript compilation | ESLint validation |
| `npm start` | Run `dist/server.js` | Run `src/server.js` |
| `npm test` | Run tests with `tsx` | Run tests with Node.js |
| `npm run lint` | ESLint source and tests | ESLint source and tests |

Generated projects require Node.js 20 or newer. The men-pack CLI itself requires Node.js 22 or newer.

## Framework notes

- **Express:** resource routes are mounted at `/api/<resource>`.
- **Fastify:** resource plugins are registered with the `/api/<resource>` prefix.
- **NestJS:** generated resource modules are added to the root module and use the `/api/<resource>` controller path.

The generated `/health` endpoint returns `{ "status": "ok" }`. Database health is checked during startup; the endpoint does not issue a database query on every request.
