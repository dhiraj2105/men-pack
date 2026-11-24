import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const directory = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(directory, "../dist/cli/index.js");

test("creates a project with non-interactive CLI options", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "men-pack-cli-"));
  try {
    const result = spawnSync(
      process.execPath,
      [
        cliPath,
        "create",
        "cli-api",
        "--framework",
        "fastify",
        "--database",
        "postgresql",
        "--language",
        "javascript",
        "--output-dir",
        outputDir,
        "--yes",
      ],
      { encoding: "utf8" },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /fastify \+ postgresql \+ javascript/);
    const projectPath = path.join(outputDir, "cli-api");
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectPath, "package.json"), "utf8"),
    );
    assert.equal(packageJson.dependencies.fastify, "^5.3.0");
    assert.ok(fs.existsSync(path.join(projectPath, "docker-compose.yml")));
    assert.ok(fs.existsSync(path.join(projectPath, "src/server.js")));

    const generateResult = spawnSync(
      process.execPath,
      [cliPath, "genbp", "user-profiles", "--directory", projectPath],
      { encoding: "utf8" },
    );
    assert.equal(generateResult.status, 0, generateResult.stderr);
    assert.ok(
      fs.existsSync(path.join(projectPath, "src/resources/user-profiles.routes.js")),
    );
    assert.match(
      fs.readFileSync(path.join(projectPath, "src/app.js"), "utf8"),
      /user-profiles/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("dry-run lists generated files without writing to disk", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "men-pack-dry-run-"));
  try {
    const result = spawnSync(
      process.execPath,
      [
        cliPath,
        "init",
        "preview-api",
        "--framework",
        "express",
        "--database",
        "sqlite",
        "--language",
        "typescript",
        "--output-dir",
        outputDir,
        "--dry-run",
      ],
      { encoding: "utf8" },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /src\/server\.ts/);
    assert.equal(fs.existsSync(path.join(outputDir, "preview-api")), false);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("reports invalid options and does not create a project", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "men-pack-invalid-"));
  try {
    const result = spawnSync(
      process.execPath,
      [
        cliPath,
        "init",
        "invalid-api",
        "--framework",
        "unknown",
        "--yes",
        "--output-dir",
        outputDir,
      ],
      { encoding: "utf8" },
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unsupported framework/);
    assert.equal(fs.existsSync(path.join(outputDir, "invalid-api")), false);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("provides prompt-free JSON results for automated callers", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "men-pack-json-"));
  try {
    const initResult = spawnSync(
      process.execPath,
      [
        cliPath,
        "init",
        "agent-api",
        "--framework",
        "nestjs",
        "--database",
        "sqlite",
        "--language",
        "typescript",
        "--output-dir",
        outputDir,
        "--json",
      ],
      { encoding: "utf8" },
    );

    assert.equal(initResult.status, 0, initResult.stderr);
    const initResponse = JSON.parse(initResult.stdout);
    assert.equal(initResponse.ok, true);
    assert.equal(initResponse.command, "init");
    assert.equal(initResponse.framework, "nestjs");
    assert.equal(initResponse.database, "sqlite");
    const projectPath = path.join(outputDir, "agent-api");

    const generateResult = spawnSync(
      process.execPath,
      [
        cliPath,
        "generate",
        "user-profiles",
        "--directory",
        projectPath,
        "--json",
      ],
      { encoding: "utf8" },
    );
    assert.equal(generateResult.status, 0, generateResult.stderr);
    const generateResponse = JSON.parse(generateResult.stdout);
    assert.equal(generateResponse.ok, true);
    assert.equal(generateResponse.endpoint, "/api/user-profiles");
    assert.ok(generateResponse.files.includes("src/app.module.ts"));

    const incompleteResult = spawnSync(
      process.execPath,
      [cliPath, "init", "incomplete-api", "--json", "--output-dir", outputDir],
      { encoding: "utf8" },
    );
    assert.equal(incompleteResult.status, 1);
    assert.equal(JSON.parse(incompleteResult.stderr).ok, false);
    assert.equal(fs.existsSync(path.join(outputDir, "incomplete-api")), false);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
