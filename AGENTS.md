# Repository guide for coding agents

## Project purpose

men-pack is a Node.js CLI that scaffolds backend APIs for Express, Fastify, or NestJS with MongoDB, PostgreSQL, or SQLite and JavaScript or TypeScript.

## Source map

- `src/cli/index.ts`: Commander commands and process-level error output.
- `src/cli/commands/init.ts`: interactive and non-interactive project creation.
- `src/cli/project.ts`: supported stack definitions and generated project templates.
- `src/cli/resource.ts`: resource file generation and safe registration in generated projects.
- `src/cli/commands/helpers/prompts.ts`: interactive prompts.
- `tests/`: CLI behavior, project generation, and resource registration tests.
- `docs/`: user, stack, CI, and AI-agent documentation.
- `.github/workflows/ci.yml`: validation and tag-triggered npm publishing.

Generated templates live in the TypeScript source. Do not edit `dist/`; it is cleaned and rebuilt.

## Local checks

Use Node.js 22 or newer:

```sh
npm ci
npm run lint
npm test
npm run build
npm audit --audit-level=moderate
npm pack --dry-run
```

Tests exercise the supported stack matrix and the scriptable CLI. If changing generated templates, verify the generated projects as well as the CLI: run their tests, lint, and TypeScript build for all affected framework/database/language combinations.

## Change guidance

- Keep CLI behavior non-interactive when explicit values or `--json` are supplied.
- Preserve the JSON output contract for automated callers; send diagnostics to stderr and return a non-zero status on errors.
- Do not overwrite pre-existing project or resource files.
- Keep project setup and resource handlers persistence-neutral unless a feature explicitly adds database operations.
- Update the relevant `docs/` pages and README whenever a command, option, stack, or generated behavior changes.
- Add focused tests for behavior changes and ensure the CI workflow still gates publishing on successful validation and a matching version tag.
