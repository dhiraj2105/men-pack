# Resource generation

The `generate` command (also available as `genbp`) creates and registers a starter resource in a project made with the current `men-pack init` command:

```sh
cd my-api
men-pack generate user-profiles
```

Or target a project from another directory:

```sh
men-pack generate user-profiles --directory ./services/my-api
```

Names use lowercase kebab-case: `users`, `user-profiles`, or `billing-events`.

## What it creates

men-pack reads the project's framework and language metadata from `package.json`, then adds the appropriate route or NestJS module, registers it with the app, and writes endpoint tests.

| Framework | Generated source | Route registration |
| --- | --- | --- |
| Express | `src/resources/<resource>.routes.js` or `.ts` | `app.use("/api/<resource>", ...)` |
| Fastify | `src/resources/<resource>.routes.js` or `.ts` | Plugin mounted at `/api/<resource>` |
| NestJS | `src/resources/<resource>/<resource>.controller.js` or `.ts` and module | Module registered in `AppModule`; controller path is `/api/<resource>` |

Every resource gets a test file at `test/<resource>.test.js` or `.ts`.

## Example endpoints

For:

```sh
men-pack generate users
```

The generated endpoints are:

```text
GET  /api/users
POST /api/users
```

List example:

```sh
curl -i http://localhost:3000/api/users
```

Example response:

```json
{
  "data": []
}
```

Create example:

```sh
curl -i \
  -H 'content-type: application/json' \
  -d '{"name":"Ada"}' \
  http://localhost:3000/api/users
```

The create handler returns the submitted body in a `data` field. Express and NestJS return HTTP `201`; Fastify uses its default `200` response for this generated handler.

These are persistence-neutral examples: the list handler returns an empty array, and the create handler does not save to MongoDB, PostgreSQL, or SQLite. Connect the handlers to your application's validation and persistence layer before relying on them.

## Run the generated tests

```sh
npm test
npm run lint
```

The resource tests cover both the list and create endpoints. TypeScript project builds also type-check the source under `src/`.

## Safety and compatibility

- The project must contain men-pack stack metadata and the expected registration markers.
- Resource names that are not lowercase kebab-case are rejected.
- Existing generated source or test files are not overwritten.
- Use a new resource name if files for the requested resource already exist.
- If you have removed or changed men-pack's registration markers, restore them or register the generated resource manually.
