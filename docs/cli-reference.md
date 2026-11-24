# CLI reference

Use the `men-pack` executable after installing the package globally or prefix commands with `npx men-pack`.

## `init` / `create`

Create a new API project:

```sh
men-pack init [name] [options]
men-pack create [name] [options]
```

`create` is an alias for `init`. Without options, men-pack prompts for missing values.

| Option | Choices / meaning |
| --- | --- |
| `-f, --framework <framework>` | `express`, `fastify`, or `nestjs` |
| `-d, --database <database>` | `mongodb`, `postgresql`, or `sqlite` |
| `-l, --language <language>` | `typescript` or `javascript` |
| `-o, --output-dir <directory>` | Parent directory in which to create the project; defaults to the current working directory |
| `-y, --yes` | Skip prompts and use defaults for unspecified choices: Express, MongoDB, and TypeScript |
| `--dry-run` | Print generated file names without creating a project |
| `--json` | Emit a machine-readable JSON result to stdout; do not prompt |
| `-h, --help` | Show command help |

Examples:

```sh
# Interactive
men-pack init

# Explicit stack
men-pack init catalog-api \
  --framework nestjs \
  --database mongodb \
  --language typescript

# Defaults for unspecified stack values
men-pack create internal-api --yes

# Generate under a parent directory
men-pack init worker-api -f fastify -d sqlite -l javascript -o ./apps --yes

# Preview without creating files
men-pack init preview-api -f express -d postgresql -l typescript --dry-run

# JSON output for scripts or agents
men-pack init agent-api -f fastify -d sqlite -l typescript --json
```

Names must be lowercase, begin with a letter or number, be at most 214 characters, and contain only letters, numbers, dots, underscores, or hyphens. The target directory must not already exist. men-pack fails rather than overwriting an existing project.

With `--json`, provide a project name and all three stack options, or use `--yes` to select defaults. A successful response includes `ok`, the selected stack, the absolute project path, and generated file paths. `--dry-run --json` returns the same metadata and file list without writing anything. Errors return a non-zero status and a JSON object on stderr.

See the [CLI result JSON Schema](./schemas/cli-result.schema.json) for the response formats.

## `generate` / `genbp`

Add a resource to a project previously created by men-pack:

```sh
men-pack generate [resource] [options]
men-pack genbp [resource] [options]
```

`genbp` is an alias for `generate`. If the resource name is omitted in an interactive terminal, men-pack prompts for it.

| Option | Meaning |
| --- | --- |
| `-C, --directory <directory>` | Project directory; defaults to the current working directory |
| `--json` | Emit a machine-readable JSON result to stdout; do not prompt |
| `-h, --help` | Show command help |

Resource names must be lowercase kebab-case. When `--json` is used, provide the resource name; the command never starts an interactive prompt. Successful JSON responses include `ok`, the endpoint, project path, and generated file paths.

```sh
men-pack generate users
men-pack generate user-profiles
men-pack generate user-profiles --directory ./services/billing-api --json
men-pack genbp billing-events --directory ./services/billing-api
```

The command reads framework and language metadata from the generated project's `package.json`, creates endpoint files and tests, then registers them with the app. It refuses to generate a resource if its output files already exist or if the project does not have the expected men-pack metadata and registration markers.

## General commands

```sh
men-pack --help
men-pack --version
men-pack init --help
men-pack generate --help
```

CLI errors are written to stderr and return a non-zero exit status.
