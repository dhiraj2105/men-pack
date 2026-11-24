#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { program } from "commander";
import { execGenerate } from "./commands/generate.js";
import { execInit } from "./commands/init.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(currentDirectory, "../../package.json"), "utf8"),
) as { version: string };

program
  .name("men-pack")
  .description("Scaffold production-ready Node.js APIs")
  .version(packageJson.version);

program
  .command("init [name]")
  .alias("create")
  .description("Create a backend API project")
  .option("-f, --framework <framework>", "express, fastify, or nestjs")
  .option("-d, --database <database>", "mongodb, postgresql, or sqlite")
  .option("-l, --language <language>", "typescript or javascript")
  .option("-o, --output-dir <directory>", "parent directory for the new project")
  .option("-y, --yes", "use defaults for any unspecified options")
  .option("--dry-run", "show the files that would be generated")
  .option("--json", "write a machine-readable JSON result to stdout")
  .action(execInit);

program
  .command("generate [resource]")
  .alias("genbp")
  .description("Generate and register a resource in the current men-pack project")
  .option("-C, --directory <directory>", "men-pack project directory")
  .option("--json", "write a machine-readable JSON result to stdout")
  .action(execGenerate);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (process.argv.includes("--json")) {
    console.error(JSON.stringify({ ok: false, error: message }));
    process.exitCode = 1;
    return;
  }
  console.error(`men-pack: ${message}`);
  process.exitCode = 1;
});
