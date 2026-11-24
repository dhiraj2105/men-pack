# men-pack

**men-pack** is an interactive and automation-friendly CLI for starting Node.js backend APIs. Choose a framework, database, and language, then get a runnable project with security defaults, database startup checks, a health endpoint, tests, Docker Compose for local databases, and setup documentation.

## Requirements

- Node.js 22 or newer
- npm
- Docker Compose (optional; for local MongoDB or PostgreSQL)

## Documentation

- [Getting started](./docs/getting-started.md)
- [CLI reference](./docs/cli-reference.md)
- [Supported stacks and generated projects](./docs/supported-stacks.md)
- [Resource generation](./docs/resource-generation.md)
- [AI agent and RAG usage](./docs/ai-agents.md)
- [CI and npm publishing](./docs/ci-and-publishing.md)
- [LLM/RAG documentation index](./llms.txt)

## Quick start

```sh
npx men-pack init my-api
cd my-api
npm install
cp .env.example .env
docker compose up -d # MongoDB and PostgreSQL projects only
npm run dev
```

By default, the wizard offers Express, MongoDB, and TypeScript. The generated API listens on port `3000`; check `http://localhost:3000/health`.

## Supported stacks

| Framework | Databases | Languages |
| --- | --- | --- |
| Express | MongoDB, PostgreSQL, SQLite | TypeScript, JavaScript |
| Fastify | MongoDB, PostgreSQL, SQLite | TypeScript, JavaScript |
| NestJS | MongoDB, PostgreSQL, SQLite | TypeScript, JavaScript |

Use the SQLite project without Docker. MongoDB and PostgreSQL projects include a local-development `docker-compose.yml`. Its credentials are for local use only; configure managed services and production secrets separately.

## CLI

Run the interactive project wizard:

```sh
men-pack init
```

Pass options directly for CI and scripts:

```sh
men-pack init billing-api \
  --framework fastify \
  --database postgresql \
  --language typescript \
  --output-dir ./services \
  --yes
```

Available choices:

- `--framework`: `express`, `fastify`, or `nestjs`
- `--database`: `mongodb`, `postgresql`, or `sqlite`
- `--language`: `typescript` or `javascript`
- `--output-dir`: parent directory for the new project
- `--yes`: use Express, MongoDB, and TypeScript for unspecified choices (a name is still required)
- `--dry-run`: preview generated file names without writing files

`men-pack create` is an alias for `men-pack init`. Existing directories are never overwritten.

Generate and register a resource in a men-pack project:

```sh
men-pack generate user-profiles
```

`men-pack genbp` remains available as an alias. Resource names use lowercase kebab-case. Generated routes include `GET` and `POST` examples plus tests; the handlers are persistence-neutral starter code that you can connect to your database.

## Generated project

Generated APIs include:

- A `/health` endpoint and an HTTP-level test for it
- Resource generation with registered `GET`/`POST` routes and focused tests
- Security headers, CORS configuration, request rate limiting, and a JSON body-size limit where supported
- Startup database connectivity checks and graceful shutdown handling
- `.env.example`, a README, ESLint configuration, and scripts for development, build, test, and lint
- Docker Compose for local MongoDB or PostgreSQL

Configure `PORT` and `CORS_ORIGIN` in `.env`, along with the database URL documented in `.env.example`. `CORS_ORIGIN` accepts a comma-separated origin allowlist.

## Development

```sh
npm ci
npm run build
npm test
npm run lint
```

The test suite checks all 18 supported framework/database/language combinations, validates generated source syntax, exercises resource generation and registration, and verifies the non-interactive CLI and overwrite protection.

## Contributing

Issues and pull requests are welcome. Before opening a pull request, run the development checks above and include tests for behavioral changes.

- GitHub: [dhiraj2105/men-pack](https://github.com/dhiraj2105/men-pack)
- npm: [men-pack](https://www.npmjs.com/package/men-pack)
