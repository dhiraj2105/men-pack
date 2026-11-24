# Getting started

## Requirements

- Node.js 22 or newer and npm.
- Docker Compose is optional. It is used by the generated MongoDB and PostgreSQL development configurations. SQLite runs locally without Docker.

## Run the CLI

Use `npx` to run the published CLI without installing it globally:

```sh
npx men-pack init my-api
```

Or install it globally:

```sh
npm install --global men-pack
men-pack init
```

The interactive wizard asks for a project name, framework, database, and language. The default choices are Express, MongoDB, and TypeScript.

## Start the generated API

After creating a project:

```sh
cd my-api
npm install
cp .env.example .env
docker compose up -d
npm run dev
```

Skip `docker compose up -d` for SQLite projects. It starts the local MongoDB or PostgreSQL service for the other database choices. The API listens on port `3000`; verify it at <http://localhost:3000/health>. The endpoint returns:

```json
{
  "status": "ok"
}
```

The server checks its database connection before listening. If the database is unavailable, the server reports a startup error rather than accepting requests.

## Create a project without prompts

Pass all stack choices explicitly to make project creation suitable for scripts and CI:

```sh
npx men-pack init billing-api \
  --framework fastify \
  --database postgresql \
  --language typescript \
  --output-dir ./services \
  --yes
```

The project is created at `./services/billing-api`. Continue with:

```sh
cd services/billing-api
npm install
cp .env.example .env
docker compose up -d
npm run dev
```

`--yes` allows omitted stack options to use defaults, but a project name is still required. Use `--dry-run` to list generated files without writing to disk:

```sh
npx men-pack init preview-api \
  --framework express \
  --database sqlite \
  --language javascript \
  --dry-run
```

## Add a resource

From the root of a project created by men-pack:

```sh
npx men-pack generate user-profiles
```

This registers `GET /api/user-profiles` and `POST /api/user-profiles`, adds focused endpoint tests, and prints the generated paths. See [Resource generation](./resource-generation.md) for framework-specific details.
