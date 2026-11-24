import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createProject, databases, frameworks, languages } from "../dist/cli/project.js";
import { createResource } from "../dist/cli/resource.js";

test("generates and registers resource endpoints for every supported stack", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "men-pack-resources-"));
  try {
    for (const framework of frameworks) {
      for (const database of databases) {
        for (const language of languages) {
          const name = `${framework}-${database}-${language}`;
          const { projectPath } = createProject({
            name,
            framework,
            database,
            language,
            outputDir,
          });
          const result = createResource("user-profiles", projectPath);
          const appFile =
            framework === "nestjs"
              ? `src/app.module.${language === "typescript" ? "ts" : "js"}`
              : `src/app.${language === "typescript" ? "ts" : "js"}`;
          const app = fs.readFileSync(path.join(projectPath, appFile), "utf8");

          assert.equal(result.endpoint, "/api/user-profiles");
          assert.ok(result.files.some((file) => file.startsWith("test/user-profiles.test.")));
          assert.match(app, /user-profiles/);
          assert.throws(() => createResource("user-profiles", projectPath), /already exist/);
        }
      }
    }

    assert.throws(
      () => createResource("../unsafe", outputDir),
      /lowercase kebab-case/,
    );
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});
