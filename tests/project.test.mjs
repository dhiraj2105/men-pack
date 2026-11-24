import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";
import {
  buildProjectFiles,
  createProject,
  databases,
  frameworks,
  languages,
  normalizeOptions,
} from "../dist/cli/project.js";

const makeOptions = (overrides = {}) => ({
  name: "sample-api",
  framework: "express",
  database: "mongodb",
  language: "typescript",
  outputDir: os.tmpdir(),
  ...overrides,
});

test("generates valid source syntax and consistent project metadata for every stack", () => {
  for (const framework of frameworks) {
    for (const database of databases) {
      for (const language of languages) {
        const files = buildProjectFiles(makeOptions({ framework, database, language }));
        const extension = language === "typescript" ? ".ts" : ".js";

        assert.ok(files["package.json"]);
        assert.ok(files[".env.example"]);
        assert.ok(files[`src/server${extension}`]);
        assert.ok(files[`src/config/database${extension}`]);
        assert.ok(files[`test/health.test${extension}`]);
        assert.equal(Boolean(files["docker-compose.yml"]), database !== "sqlite");
        const packageJson = JSON.parse(files["package.json"]);
        assert.equal(packageJson.name, "sample-api");
        assert.match(
          packageJson.scripts.test,
          language === "typescript"
            ? /tsx --test test\/\*\.test\.ts/
            : /node --test test\/\*\.test\.js/,
        );
        assert.equal(packageJson.devDependencies["typescript-eslint"], "^8.73.0");
        assert.ok(
          packageJson.dependencies[
            framework === "fastify"
              ? "fastify"
              : framework === "nestjs"
                ? "@nestjs/core"
                : "express"
          ],
        );
        if (framework === "fastify") {
          assert.equal(packageJson.overrides["fast-json-stringify"], "7.3.9");
        }

        for (const [file, contents] of Object.entries(files)) {
          if (!file.startsWith("src/") && !file.startsWith("test/")) continue;
          if (language === "typescript" && file.endsWith(".ts")) {
            const result = ts.transpileModule(contents, {
              fileName: file,
              compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022,
                experimentalDecorators: true,
              },
              reportDiagnostics: true,
            });
            const errors = (result.diagnostics ?? []).filter(
              (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
            );
            assert.deepEqual(
              errors.map((diagnostic) =>
                ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
              ),
              [],
              `${framework}/${database}/${language}: ${file}`,
            );
          } else if (file.endsWith(".js")) {
            assert.doesNotThrow(
              () => new vm.Script(contents, { filename: file }),
              `${framework}/${database}/${language}: ${file}`,
            );
          }
        }
      }
    }
  }
});

test("rejects unsafe project names and unsupported stack selections", () => {
  assert.throws(() => buildProjectFiles(makeOptions({ name: "../outside" })), /Project name/);
  assert.throws(() => buildProjectFiles(makeOptions({ name: "Uppercase" })), /Project names must be lowercase/);
  assert.throws(() => buildProjectFiles(makeOptions({ name: "trailing." })), /Project names must be lowercase/);
  assert.throws(() => buildProjectFiles(makeOptions({ name: `a${"b".repeat(214)}` })), /Project names must be lowercase/);
  assert.throws(
    () => normalizeOptions(makeOptions({ framework: "unknown" })),
    /Unsupported framework/,
  );
  assert.throws(
    () => normalizeOptions(makeOptions({ database: "unknown" })),
    /Unsupported database/,
  );
});

test("creates a project without overwriting an existing target", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "men-pack-project-"));
  try {
    const options = makeOptions({ outputDir });
    const { projectPath } = createProject(options);
    const readmePath = path.join(projectPath, "README.md");
    const originalReadme = fs.readFileSync(readmePath, "utf8");

    assert.throws(() => createProject(options), /already exists/);
    assert.equal(fs.readFileSync(readmePath, "utf8"), originalReadme);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
