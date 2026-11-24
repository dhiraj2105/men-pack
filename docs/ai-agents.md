# AI agent and RAG usage

men-pack can be called by coding agents and other automation without terminal prompts. The CLI writes structured JSON when passed `--json`; project creation and resource generation remain local filesystem operations.

## Agent-safe CLI usage

Use explicit stack choices and a controlled output directory:

```sh
npx men-pack init agent-api \
  --framework fastify \
  --database postgresql \
  --language typescript \
  --output-dir ./generated \
  --json
```

Success is one JSON object on stdout. Example shape:

```json
{
  "ok": true,
  "command": "init",
  "dryRun": false,
  "name": "agent-api",
  "framework": "fastify",
  "database": "postgresql",
  "language": "typescript",
  "projectPath": "/path/to/generated/agent-api",
  "files": ["package.json", "README.md", "src/server.ts"]
}
```

The `files` array is illustrative, not exhaustive. Treat it as a list of generated relative paths.

For automation:

1. Use `men-pack init ... --dry-run --json` to inspect the proposed paths first.
2. Verify the destination is appropriate for the task. men-pack refuses to overwrite an existing project directory.
3. Run `men-pack init ... --json` with an explicit project name and stack. Alternatively, pass `--yes` to use Express, MongoDB, and TypeScript defaults.
4. Parse stdout as JSON and check `ok` and `projectPath`; do not parse human-oriented output.
5. After reviewing the result, install dependencies and run the generated project tests.

The resource command also supports JSON:

```sh
npx men-pack generate user-profiles \
  --directory ./generated/agent-api \
  --json
```

Its JSON response includes `ok`, `endpoint`, `projectPath`, and generated file paths. `--json` never prompts. For `init`, supply a project name and all stack choices, or add `--yes`. For `generate`, supply the resource name. Failures return a non-zero process status and a JSON error object on stderr.

The [CLI result JSON Schema](./schemas/cli-result.schema.json) describes successful `init` and `generate` results and JSON-mode errors.

## Safe automation practices

- Keep stdout available for JSON and use stderr for diagnostics.
- Do not pass credentials in command-line arguments. Configure local environment variables or `.env` files separately, and do not send secrets to an LLM or RAG index.
- Use a unique output directory. Review generated files before running dependency installation or code from a new stack.
- Resource handlers are examples: GET returns an empty list and POST echoes the submitted body. They do not persist data, validate schemas, or add authentication.
- Do not expose the generated development database services or reuse their credentials in production.
- Ask for human approval before publishing packages, pushing changes, or other external side effects.

## RAG and documentation indexing

Use [`../llms.txt`](../llms.txt) as a compact documentation index. For more detail, ingest these canonical pages:

- [Getting started](./getting-started.md)
- [CLI reference](./cli-reference.md)
- [Supported stacks](./supported-stacks.md)
- [Resource generation](./resource-generation.md)
- [CI and npm publishing](./ci-and-publishing.md)

The root [`AGENTS.md`](../AGENTS.md) describes the repository layout and the checks expected when changing men-pack itself.
