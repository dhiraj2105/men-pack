import fs from "node:fs";
import path from "node:path";

export type Framework = "express" | "fastify" | "nestjs";
export type Database = "mongodb" | "postgresql" | "sqlite";
export type Language = "typescript" | "javascript";

export interface ProjectOptions {
  name: string;
  framework: Framework;
  database: Database;
  language: Language;
  outputDir: string;
}

export const frameworks: Framework[] = ["express", "fastify", "nestjs"];
export const databases: Database[] = ["mongodb", "postgresql", "sqlite"];
export const languages: Language[] = ["typescript", "javascript"];

const isTypeScript = (language: Language) => language === "typescript";
const extension = (language: Language) => (isTypeScript(language) ? "ts" : "js");

const databaseSource = (database: Database, language: Language) => {
  const ts = isTypeScript(language);
  if (database === "mongodb") {
    return ts
      ? `import mongoose from "mongoose";

export async function connectDatabase(): Promise<() => Promise<void>> {
  await mongoose.connect(
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/men_pack",
  );
  return async () => mongoose.disconnect();
}
`
      : `const mongoose = require("mongoose");

async function connectDatabase() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/men_pack",
  );
  return async () => mongoose.disconnect();
}

module.exports = { connectDatabase };
`;
  }

  if (database === "postgresql") {
    return ts
      ? `import { Pool } from "pg";

export async function connectDatabase(): Promise<() => Promise<void>> {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://men_pack:dev-only-change-me@localhost:5432/men_pack",
  });
  await pool.query("SELECT 1");
  return () => pool.end();
}
`
      : `const { Pool } = require("pg");

async function connectDatabase() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://men_pack:dev-only-change-me@localhost:5432/men_pack",
  });
  await pool.query("SELECT 1");
  return () => pool.end();
}

module.exports = { connectDatabase };
`;
  }

  return ts
    ? `import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export async function connectDatabase(): Promise<() => Promise<void>> {
  const filename = process.env.SQLITE_PATH ?? "./data/app.sqlite";
  mkdirSync(dirname(filename), { recursive: true });
  const database = new Database(filename);
  database.pragma("journal_mode = WAL");
  database.prepare("SELECT 1").get();
  return async () => {
    database.close();
  };
}
`
    : `const Database = require("better-sqlite3");
const { mkdirSync } = require("node:fs");
const { dirname } = require("node:path");

async function connectDatabase() {
  const filename = process.env.SQLITE_PATH || "./data/app.sqlite";
  mkdirSync(dirname(filename), { recursive: true });
  const database = new Database(filename);
  database.pragma("journal_mode = WAL");
  database.prepare("SELECT 1").get();
  return async () => database.close();
}

module.exports = { connectDatabase };
`;
};

const expressAppSource = (language: Language) =>
  isTypeScript(language)
    ? `import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// men-pack:resource-imports
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? false }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
  app.use(express.json({ limit: "1mb" }));

  // men-pack:resource-routes
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  return app;
}
`
    : `const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// men-pack:resource-imports
function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || false }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
  app.use(express.json({ limit: "1mb" }));

  // men-pack:resource-routes
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  return app;
}

module.exports = { createApp };
`;

const fastifyAppSource = (language: Language) =>
  isTypeScript(language)
    ? `import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

// men-pack:resource-imports
export async function createApp() {
  const app = Fastify({ logger: true, bodyLimit: 1_048_576 });
  await app.register(helmet);
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? false,
  });
  await app.register(rateLimit, { max: 100, timeWindow: "15 minutes" });

  // men-pack:resource-routes
  app.get("/health", async () => ({ status: "ok" }));
  return app;
}
`
    : `const cors = require("@fastify/cors");
const helmet = require("@fastify/helmet");
const rateLimit = require("@fastify/rate-limit");
const Fastify = require("fastify");

// men-pack:resource-imports
async function createApp() {
  const app = Fastify({ logger: true, bodyLimit: 1_048_576 });
  await app.register(helmet);
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") || false,
  });
  await app.register(rateLimit, { max: 100, timeWindow: "15 minutes" });

  // men-pack:resource-routes
  app.get("/health", async () => ({ status: "ok" }));
  return app;
}

module.exports = { createApp };
`;

const nestControllerSource = (language: Language) =>
  isTypeScript(language)
    ? `import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}
`
    : `const { Controller, Get } = require("@nestjs/common");

class AppController {
  health() {
    return { status: "ok" };
  }
}

Get("health")(
  AppController.prototype,
  "health",
  Object.getOwnPropertyDescriptor(AppController.prototype, "health"),
);
Controller()(AppController);

module.exports = { AppController };
`;

const nestModuleSource = (language: Language) =>
  isTypeScript(language)
    ? `import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
// men-pack:resource-imports

@Module({ controllers: [AppController], imports: [/* men-pack:modules */] })
export class AppModule {}
`
    : `const { Module } = require("@nestjs/common");
const { AppController } = require("./app.controller");
// men-pack:resource-imports

class AppModule {}

Module({ controllers: [AppController], imports: [/* men-pack:modules */] })(AppModule);

module.exports = { AppModule };
`;

const serverSource = (framework: Framework, language: Language) => {
  const ts = isTypeScript(language);
  const dbImport = ts
    ? 'import { connectDatabase } from "./config/database";\n'
    : 'const { connectDatabase } = require("./config/database");\n';
  const port = ts ? "Number(process.env.PORT ?? 3000)" : "Number(process.env.PORT || 3000)";

  if (framework === "express") {
    const appImport = ts
      ? 'import { createApp } from "./app";\n'
      : 'const { createApp } = require("./app");\n';
    return `${ts ? 'import "dotenv/config";\n' : 'require("dotenv").config();\n'}${dbImport}${appImport}
async function start() {
  const closeDatabase = await connectDatabase();
  const app = createApp();
  const server = app.listen(${port});
  try {
    await new Promise${ts ? "<void>" : ""}((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
  } catch (error) {
    await closeDatabase();
    throw error;
  }
  console.log(\`API listening on port \${${port}}\`);

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(async (error) => {
      if (error) {
        console.error("Failed to close the HTTP server:", error);
        process.exitCode = 1;
      }
      try {
        await closeDatabase();
      } catch (closeError) {
        console.error("Failed to close the database connection:", closeError);
        process.exitCode = 1;
      }
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start the API:", error);
  process.exitCode = 1;
});
`;
  }

  if (framework === "fastify") {
    const appImport = ts
      ? 'import { createApp } from "./app";\n'
      : 'const { createApp } = require("./app");\n';
    const appType = ts
      ? ": Awaited<ReturnType<typeof createApp>> | undefined"
      : "";
    return `${ts ? 'import "dotenv/config";\n' : 'require("dotenv").config();\n'}${dbImport}${appImport}
async function start() {
  const closeDatabase = await connectDatabase();
  let app${appType};
  try {
    app = await createApp();
    await app.listen({ port: ${port}, host: "0.0.0.0" });
  } catch (error) {
    try {
      await app?.close();
    } finally {
      await closeDatabase();
    }
    throw error;
  }
  if (!app) throw new Error("Fastify app failed to initialize.");

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await app.close();
    } finally {
      await closeDatabase();
    }
  };
  const handleShutdown = () => {
    void shutdown().catch((error) => {
      console.error("Failed to shut down the API:", error);
      process.exitCode = 1;
    });
  };
  process.once("SIGINT", handleShutdown);
  process.once("SIGTERM", handleShutdown);
}

start().catch((error) => {
  console.error("Failed to start the API:", error);
  process.exitCode = 1;
});
`;
  }

  const nestImport = ts
    ? 'import "reflect-metadata";\nimport { NestFactory } from "@nestjs/core";\nimport type { INestApplication } from "@nestjs/common";\nimport { AppModule } from "./app.module";\n'
    : 'require("reflect-metadata");\nconst { NestFactory } = require("@nestjs/core");\nconst { AppModule } = require("./app.module");\n';
  const security = ts
    ? `import helmet from "helmet";
import rateLimit from "express-rate-limit";
`
    : `const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
`;
  const appType = ts ? ": INestApplication | undefined" : "";
  return `${ts ? 'import "dotenv/config";\n' : 'require("dotenv").config();\n'}${nestImport}${dbImport}${security}
async function start() {
  const closeDatabase = await connectDatabase();
  let app${appType};
  try {
    app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.enableCors({ origin: process.env.CORS_ORIGIN?.split(",") ?? false });
    app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
    await app.listen(${port});
  } catch (error) {
    try {
      await app?.close();
    } finally {
      await closeDatabase();
    }
    throw error;
  }
  if (!app) throw new Error("NestJS app failed to initialize.");

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await app.close();
    } finally {
      await closeDatabase();
    }
  };
  const handleShutdown = () => {
    void shutdown().catch((error) => {
      console.error("Failed to shut down the API:", error);
      process.exitCode = 1;
    });
  };
  process.once("SIGINT", handleShutdown);
  process.once("SIGTERM", handleShutdown);
}

start().catch((error) => {
  console.error("Failed to start the API:", error);
  process.exitCode = 1;
});
`;
};

const testSource = (framework: Framework, language: Language) => {
  const ts = isTypeScript(language);
  if (framework === "express") {
    return ts
      ? `import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app";

test("GET /health returns an OK status", async () => {
  const response = await request(createApp()).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});
`
      : `const assert = require("node:assert/strict");
const { test } = require("node:test");
const request = require("supertest");
const { createApp } = require("../src/app");

test("GET /health returns an OK status", async () => {
  const response = await request(createApp()).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});
`;
  }

  if (framework === "fastify") {
    return ts
      ? `import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "../src/app";

test("GET /health returns an OK status", async () => {
  const app = await createApp();
  try {
    const response = await app.inject({ method: "GET", url: "/health" });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ok" });
  } finally {
    await app.close();
  }
});
`
      : `const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createApp } = require("../src/app");

test("GET /health returns an OK status", async () => {
  const app = await createApp();
  try {
    const response = await app.inject({ method: "GET", url: "/health" });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ok" });
  } finally {
    await app.close();
  }
});
`;
  }

  return ts
    ? `import assert from "node:assert/strict";
import { test } from "node:test";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

test("GET /health returns an OK status", async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  try {
    const response = await request(app.getHttpServer()).get("/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });
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

test("GET /health returns an OK status", async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  try {
    const response = await request(app.getHttpServer()).get("/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });
  } finally {
    await app.close();
  }
});
`;
};

const packageDependencies = (framework: Framework, database: Database) => {
  const dependencies: Record<string, string> = {
    dotenv: "^16.4.7",
  };
  const devDependencies: Record<string, string> = {
    "@eslint/js": "^9.17.0",
    "@types/node": "^22.10.2",
    eslint: "^9.17.0",
    globals: "^15.13.0",
    supertest: "^7.0.0",
    tsx: "^4.19.2",
    typescript: "^5.7.2",
    "typescript-eslint": "^8.73.0",
  };

  if (framework === "express") {
    dependencies.express = "^5.1.0";
    dependencies.cors = "^2.8.5";
    dependencies.helmet = "^8.0.0";
    dependencies["express-rate-limit"] = "^7.5.0";
    devDependencies["@types/cors"] = "^2.8.17";
    devDependencies["@types/express"] = "^5.0.0";
    devDependencies["@types/supertest"] = "^6.0.2";
  } else if (framework === "fastify") {
    dependencies.fastify = "^5.3.0";
    dependencies["@fastify/cors"] = "^10.0.2";
    dependencies["@fastify/helmet"] = "^13.0.1";
    dependencies["@fastify/rate-limit"] = "^10.2.1";
  } else {
    dependencies["@nestjs/common"] = "^11.0.0";
    dependencies["@nestjs/core"] = "^11.0.0";
    dependencies["@nestjs/platform-express"] = "^11.0.0";
    dependencies["reflect-metadata"] = "^0.2.2";
    dependencies.rxjs = "^7.8.1";
    dependencies.cors = "^2.8.5";
    dependencies.helmet = "^8.0.0";
    dependencies["express-rate-limit"] = "^7.5.0";
    devDependencies["@nestjs/testing"] = "^11.0.0";
    devDependencies["@types/cors"] = "^2.8.17";
    devDependencies["@types/express"] = "^5.0.0";
    devDependencies["@types/supertest"] = "^6.0.2";
  }

  if (database === "mongodb") {
    dependencies.mongoose = "^8.9.0";
  } else if (database === "postgresql") {
    dependencies.pg = "^8.13.1";
    devDependencies["@types/pg"] = "^8.11.10";
  } else {
    dependencies["better-sqlite3"] = "^11.7.0";
    devDependencies["@types/better-sqlite3"] = "^7.6.12";
  }

  return { dependencies, devDependencies };
};

const generatedFiles = (options: ProjectOptions): Record<string, string> => {
  const { framework, database, language, name } = options;
  const ext = extension(language);
  const ts = isTypeScript(language);
  const deps = packageDependencies(framework, database);
  const sourceFiles: Record<string, string> = {
    [`src/config/database.${ext}`]: databaseSource(database, language),
    [`src/server.${ext}`]: serverSource(framework, language),
  };

  if (framework === "express") {
    sourceFiles[`src/app.${ext}`] = expressAppSource(language);
  } else if (framework === "fastify") {
    sourceFiles[`src/app.${ext}`] = fastifyAppSource(language);
  } else {
    sourceFiles[`src/app.controller.${ext}`] = nestControllerSource(language);
    sourceFiles[`src/app.module.${ext}`] = nestModuleSource(language);
  }

  const scripts = {
    start: ts ? "node dist/server.js" : "node src/server.js",
    dev: ts ? "tsx watch src/server.ts" : "node --watch src/server.js",
    build: ts ? "tsc" : "eslint src test",
    test: ts ? "tsx --test test/*.test.ts" : "node --test test/*.test.js",
    lint: "eslint src test",
  };
  const packageJson = {
    name,
    version: "1.0.0",
    private: true,
    engines: { node: ">=20" },
    ...(framework === "fastify"
      ? { overrides: { "fast-json-stringify": "7.3.9" } }
      : {}),
    menPack: { framework, database, language },
    scripts,
    dependencies: Object.fromEntries(
      Object.entries(deps.dependencies).sort(([a], [b]) => a.localeCompare(b)),
    ),
    devDependencies: Object.fromEntries(
      Object.entries(deps.devDependencies).sort(([a], [b]) => a.localeCompare(b)),
    ),
  };

  const files: Record<string, string> = {
    "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
    ".env.example": envExample(database),
    ".gitignore": "node_modules/\ndist/\n.env\n*.sqlite\n*.sqlite-shm\n*.sqlite-wal\ncoverage/\n",
    ".editorconfig": "root = true\n\n[*]\ncharset = utf-8\nend_of_line = lf\ninsert_final_newline = true\nindent_style = space\nindent_size = 2\n",
    "eslint.config.mjs": eslintConfig(),
    "README.md": projectReadme(name, framework, database, language),
    ...sourceFiles,
    [`test/health.test.${ext}`]: testSource(framework, language),
  };

  if (ts) {
    files["tsconfig.json"] = `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "CommonJS",
          moduleResolution: "Node",
          rootDir: "./src",
          outDir: "./dist",
          strict: true,
          esModuleInterop: true,
          experimentalDecorators: framework === "nestjs",
          emitDecoratorMetadata: framework === "nestjs",
          forceConsistentCasingInFileNames: true,
          skipLibCheck: true,
        },
        include: ["src/**/*.ts"],
        exclude: ["node_modules", "dist", "test"],
      },
      null,
      2,
    )}\n`;
  }

  if (database !== "sqlite") {
    files["docker-compose.yml"] = dockerCompose(database);
  }

  return files;
};

const envExample = (database: Database) => {
  const databaseVariable =
    database === "mongodb"
      ? "MONGODB_URI=mongodb://127.0.0.1:27017/men_pack"
      : database === "postgresql"
        ? "DATABASE_URL=postgresql://men_pack:dev-only-change-me@localhost:5432/men_pack"
        : "SQLITE_PATH=./data/app.sqlite";
  return `PORT=3000
CORS_ORIGIN=http://localhost:3000
${databaseVariable}
`;
};

const dockerCompose = (database: Database) => {
  if (database === "mongodb") {
    return `services:
  mongodb:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
`;
  }
  return `services:
  postgres:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_USER: men_pack
      POSTGRES_PASSWORD: dev-only-change-me
      POSTGRES_DB: men_pack
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
};

const eslintConfig = () => `import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["**/*.ts"],
    languageOptions: { globals: globals.node },
  },
];
`;

const projectReadme = (
  name: string,
  framework: Framework,
  database: Database,
  language: Language,
) => `# ${name}

Backend API starter generated with men-pack.

- Framework: ${framework}
- Database: ${database}
- Language: ${language}
- Node.js: 20 or newer

## Get started

\`\`\`sh
npm install
cp .env.example .env
\`\`\`

Start the database with Docker Compose when using MongoDB or PostgreSQL:

\`\`\`sh
docker compose up -d
\`\`\`

Start the API in development:

\`\`\`sh
npm run dev
\`\`\`

The health endpoint is available at [http://localhost:3000/health](http://localhost:3000/health).

## Scripts

- \`npm run dev\`: start with automatic reload
- \`npm run build\`: validate and compile the project
- \`npm start\`: start the production build
- \`npm test\`: run API tests
- \`npm run lint\`: lint source and tests

Use \`men-pack generate <resource>\` from this directory to create and register a \`GET\`/\`POST\` resource scaffold with focused tests. The generated handlers are examples; connect them to your persistence layer.

Set \`CORS_ORIGIN\` to a comma-separated allowlist of browser origins. Do not use the development database credentials in production.
`;

export const validateProjectName = (name: string) => {
  if (!isValidProjectName(name)) {
    throw new Error(
      "Project names must be lowercase, start with a letter or number, be at most 214 characters, and contain only letters, numbers, dots, underscores, or hyphens.",
    );
  }
};

export const isValidProjectName = (name: string) =>
  name.length <= 214 &&
  /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9_-])?$/.test(name) &&
  name !== "." &&
  name !== "..";

export const buildProjectFiles = (options: ProjectOptions) => {
  validateProjectName(options.name);
  return generatedFiles(options);
};

export const createProject = (options: ProjectOptions) => {
  const files = buildProjectFiles(options);
  const projectPath = path.resolve(options.outputDir, options.name);
  if (fs.existsSync(projectPath)) {
    throw new Error(`The target path already exists: ${projectPath}`);
  }

  fs.mkdirSync(options.outputDir, { recursive: true });
  fs.mkdirSync(projectPath);
  try {
    for (const [filePath, contents] of Object.entries(files)) {
      const target = path.join(projectPath, filePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents, { flag: "wx" });
    }
  } catch (error) {
    fs.rmSync(projectPath, { recursive: true, force: true });
    throw error;
  }

  return { projectPath, files: Object.keys(files) };
};

export const formatStack = (options: Pick<ProjectOptions, "framework" | "database" | "language">) =>
  `${options.framework} + ${options.database} + ${options.language}`;

export const normalizeOptions = (options: ProjectOptions): ProjectOptions => {
  validateProjectName(options.name);
  if (!frameworks.includes(options.framework)) {
    throw new Error(`Unsupported framework: ${options.framework}`);
  }
  if (!databases.includes(options.database)) {
    throw new Error(`Unsupported database: ${options.database}`);
  }
  if (!languages.includes(options.language)) {
    throw new Error(`Unsupported language: ${options.language}`);
  }
  return options;
};

