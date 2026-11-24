import fs from "node:fs";
import path from "node:path";
import {
  databases,
  frameworks,
  languages,
  type Database,
  type Framework,
  type Language,
} from "./project.js";

interface Manifest {
  menPack?: {
    framework?: unknown;
    database?: unknown;
    language?: unknown;
  };
}

interface ResourceProject {
  framework: Framework;
  database: Database;
  language: Language;
}

const isFramework = (value: unknown): value is Framework =>
  typeof value === "string" && frameworks.includes(value as Framework);
const isDatabase = (value: unknown): value is Database =>
  typeof value === "string" && databases.includes(value as Database);
const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && languages.includes(value as Language);

const getProjectConfig = (directory: string): ResourceProject => {
  const packagePath = path.join(directory, "package.json");
  if (!fs.existsSync(packagePath)) {
    throw new Error(`No package.json found in ${directory}. Run this command inside a men-pack project.`);
  }

  const manifest = JSON.parse(fs.readFileSync(packagePath, "utf8")) as Manifest;
  const config = manifest.menPack;
  if (
    !config ||
    !isFramework(config.framework) ||
    !isDatabase(config.database) ||
    !isLanguage(config.language)
  ) {
    throw new Error(
      "This project is missing men-pack stack metadata. Create it with the current men-pack init command first.",
    );
  }

  return {
    framework: config.framework,
    database: config.database,
    language: config.language,
  };
};

const getResourceName = (name: string) => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error("Resource names must be lowercase kebab-case, such as user-profiles.");
  }
  return {
    kebab: name,
    pascal: name
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(""),
  };
};

const replaceMarker = (contents: string, marker: string, insertion: string) => {
  const index = contents.indexOf(marker);
  if (index < 0 || contents.indexOf(marker, index + marker.length) >= 0) {
    throw new Error(`Cannot safely register the resource: expected one "${marker}" marker.`);
  }
  return `${contents.slice(0, index)}${insertion}${contents.slice(index)}`;
};

const expressResource = (language: Language) =>
  language === "typescript"
    ? `import { Router } from "express";

const router = Router();

router.get("/", (_request, response) => {
  response.status(200).json({ data: [] });
});

router.post("/", (request, response) => {
  response.status(201).json({ data: request.body });
});

export default router;
`
    : `const { Router } = require("express");

const router = Router();

router.get("/", (_request, response) => {
  response.status(200).json({ data: [] });
});

router.post("/", (request, response) => {
  response.status(201).json({ data: request.body });
});

module.exports = router;
`;

const fastifyResource = (language: Language) =>
  language === "typescript"
    ? `import type { FastifyInstance } from "fastify";

export default async function registerResourceRoutes(app: FastifyInstance) {
  app.get("/", async () => ({ data: [] }));
  app.post("/", async (request) => ({ data: request.body }));
}
`
    : `async function registerResourceRoutes(app) {
  app.get("/", async () => ({ data: [] }));
  app.post("/", async (request) => ({ data: request.body }));
}

module.exports = registerResourceRoutes;
`;

const nestResource = (name: string, language: Language) => {
  const pascal = name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  const className = `${pascal}Controller`;
  const moduleName = `${pascal}Module`;
  if (language === "typescript") {
    return {
      controller: `import { Body, Controller, Get, Post } from "@nestjs/common";

@Controller("api/${name}")
export class ${className} {
  @Get()
  list() {
    return { data: [] };
  }

  @Post()
  create(@Body() payload: unknown) {
    return { data: payload };
  }
}
`,
      module: `import { Module } from "@nestjs/common";
import { ${className} } from "./${name}.controller";

@Module({ controllers: [${className}] })
export class ${moduleName} {}
`,
    };
  }

  return {
    controller: `const { Body, Controller, Get, Post } = require("@nestjs/common");

class ${className} {
  list() {
    return { data: [] };
  }

  create(payload) {
    return { data: payload };
  }
}

Get()(${className}.prototype, "list", Object.getOwnPropertyDescriptor(${className}.prototype, "list"));
Post()(${className}.prototype, "create", Object.getOwnPropertyDescriptor(${className}.prototype, "create"));
Body()(${className}.prototype, "create", 0);
Controller("api/${name}")(${className});

module.exports = { ${className} };
`,
    module: `const { Module } = require("@nestjs/common");
const { ${className} } = require("./${name}.controller");

class ${moduleName} {}

Module({ controllers: [${className}] })(${moduleName});

module.exports = { ${moduleName} };
`,
  };
};

const resourceTest = (
  name: string,
  framework: Framework,
  language: Language,
) => {
  const endpoint = `/api/${name}`;
  if (framework === "express") {
    return language === "typescript"
      ? `import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app";

test("${name} resource supports listing and creating items", async () => {
  const app = createApp();
  const list = await request(app).get("${endpoint}");
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, { data: [] });

  const created = await request(app).post("${endpoint}").send({ name: "Ada" });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { data: { name: "Ada" } });
});
`
      : `const assert = require("node:assert/strict");
const { test } = require("node:test");
const request = require("supertest");
const { createApp } = require("../src/app");

test("${name} resource supports listing and creating items", async () => {
  const app = createApp();
  const list = await request(app).get("${endpoint}");
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, { data: [] });

  const created = await request(app).post("${endpoint}").send({ name: "Ada" });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { data: { name: "Ada" } });
});
`;
  }

  if (framework === "fastify") {
    return language === "typescript"
      ? `import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "../src/app";

test("${name} resource supports listing and creating items", async () => {
  const app = await createApp();
  try {
    const list = await app.inject({ method: "GET", url: "${endpoint}" });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(list.json(), { data: [] });

    const created = await app.inject({
      method: "POST",
      url: "${endpoint}",
      payload: { name: "Ada" },
    });
    assert.equal(created.statusCode, 200);
    assert.deepEqual(created.json(), { data: { name: "Ada" } });
  } finally {
    await app.close();
  }
});
`
      : `const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createApp } = require("../src/app");

test("${name} resource supports listing and creating items", async () => {
  const app = await createApp();
  try {
    const list = await app.inject({ method: "GET", url: "${endpoint}" });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(list.json(), { data: [] });

    const created = await app.inject({
      method: "POST",
      url: "${endpoint}",
      payload: { name: "Ada" },
    });
    assert.equal(created.statusCode, 200);
    assert.deepEqual(created.json(), { data: { name: "Ada" } });
  } finally {
    await app.close();
  }
});
`;
  }

  return language === "typescript"
    ? `import assert from "node:assert/strict";
import { test } from "node:test";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

test("${name} resource supports listing and creating items", async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  try {
    const list = await request(app.getHttpServer()).get("${endpoint}");
    assert.equal(list.status, 200);
    assert.deepEqual(list.body, { data: [] });

    const created = await request(app.getHttpServer())
      .post("${endpoint}")
      .send({ name: "Ada" });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body, { data: { name: "Ada" } });
  } finally {
    await app.close();
  }
});
`
    : `const assert = require("node:assert/strict");
const { test } = require("node:test");
const { Test } = require("@nestjs/testing");
const request = require("supertest");
const { AppModule } = require("../src/app.module");

test("${name} resource supports listing and creating items", async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  try {
    const list = await request(app.getHttpServer()).get("${endpoint}");
    assert.equal(list.status, 200);
    assert.deepEqual(list.body, { data: [] });

    const created = await request(app.getHttpServer())
      .post("${endpoint}")
      .send({ name: "Ada" });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body, { data: { name: "Ada" } });
  } finally {
    await app.close();
  }
});
`;
};

export const createResource = (name: string, directory: string) => {
  const { kebab, pascal } = getResourceName(name);
  const projectPath = path.resolve(directory);
  const config = getProjectConfig(projectPath);
  const ext = config.language === "typescript" ? "ts" : "js";
  const files: Record<string, string> = {};
  const appFile =
    config.framework === "nestjs"
      ? path.join(projectPath, "src", `app.module.${ext}`)
      : path.join(projectPath, "src", `app.${ext}`);
  const appContents = fs.readFileSync(appFile, "utf8");
  let updatedApp: string;

  if (config.framework === "express") {
    const resourcePath = `src/resources/${kebab}.routes.${ext}`;
    files[resourcePath] = expressResource(config.language);
    files[`test/${kebab}.test.${ext}`] = resourceTest(
      kebab,
      config.framework,
      config.language,
    );
    const importLine =
      config.language === "typescript"
        ? `import ${pascal}Routes from "./resources/${kebab}.routes";`
        : `const ${pascal}Routes = require("./resources/${kebab}.routes");`;
    updatedApp = replaceMarker(
      replaceMarker(appContents, "// men-pack:resource-imports", `${importLine}\n`),
      "// men-pack:resource-routes",
      `  app.use("/api/${kebab}", ${pascal}Routes);\n`,
    );
  } else if (config.framework === "fastify") {
    const resourcePath = `src/resources/${kebab}.routes.${ext}`;
    files[resourcePath] = fastifyResource(config.language);
    files[`test/${kebab}.test.${ext}`] = resourceTest(
      kebab,
      config.framework,
      config.language,
    );
    const importLine =
      config.language === "typescript"
        ? `import ${pascal}Routes from "./resources/${kebab}.routes";`
        : `const ${pascal}Routes = require("./resources/${kebab}.routes");`;
    updatedApp = replaceMarker(
      replaceMarker(appContents, "// men-pack:resource-imports", `${importLine}\n`),
      "// men-pack:resource-routes",
      `  await app.register(${pascal}Routes, { prefix: "/api/${kebab}" });\n`,
    );
  } else {
    const { controller, module } = nestResource(kebab, config.language);
    const moduleName = `${pascal}Module`;
    files[`src/resources/${kebab}/${kebab}.controller.${ext}`] = controller;
    files[`src/resources/${kebab}/${kebab}.module.${ext}`] = module;
    files[`test/${kebab}.test.${ext}`] = resourceTest(
      kebab,
      config.framework,
      config.language,
    );
    const importLine =
      config.language === "typescript"
        ? `import { ${moduleName} } from "./resources/${kebab}/${kebab}.module";`
        : `const { ${moduleName} } = require("./resources/${kebab}/${kebab}.module");`;
    updatedApp = replaceMarker(
      replaceMarker(
        appContents,
        "// men-pack:resource-imports",
        `${importLine}\n`,
      ),
      "/* men-pack:modules */",
      `${moduleName}, `,
    );
  }

  const targets = Object.keys(files).map((file) => path.join(projectPath, file));
  const existingTarget = targets.find((target) => fs.existsSync(target));
  if (existingTarget) {
    throw new Error(`Resource files already exist: ${existingTarget}`);
  }

  const createdFiles: string[] = [];
  try {
    for (const [file, contents] of Object.entries(files)) {
      const target = path.join(projectPath, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents, { flag: "wx" });
      createdFiles.push(target);
    }
    fs.writeFileSync(appFile, updatedApp);
  } catch (error) {
    for (const target of createdFiles) {
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
    throw error;
  }

  return {
    files: [...Object.keys(files), path.relative(projectPath, appFile)],
    endpoint: `/api/${kebab}`,
  };
};
