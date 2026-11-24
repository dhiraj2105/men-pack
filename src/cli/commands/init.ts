import path from "node:path";
import {
  askDatabase,
  askFramework,
  askLanguage,
  askProjectName,
} from "./helpers/prompts.js";
import {
  buildProjectFiles,
  createProject,
  formatStack,
  normalizeOptions,
  type Database,
  type Framework,
  type Language,
} from "../project.js";

export interface InitCommandOptions {
  framework?: string;
  database?: string;
  language?: string;
  outputDir?: string;
  yes?: boolean;
  dryRun?: boolean;
  json?: boolean;
}

export const execInit = async (
  requestedName: string | undefined,
  options: InitCommandOptions,
) => {
  if (!requestedName && (options.yes || options.json)) {
    throw new Error("Provide a project name when using --yes or --json.");
  }
  if (options.json && !options.yes) {
    const missingOptions = [
      options.framework === undefined ? "--framework" : undefined,
      options.database === undefined ? "--database" : undefined,
      options.language === undefined ? "--language" : undefined,
    ].filter((option) => option !== undefined);
    if (missingOptions.length > 0) {
      throw new Error(
        `JSON mode requires ${missingOptions.join(", ")} or --yes to use defaults.`,
      );
    }
  }
  const name = requestedName ?? (await askProjectName());
  const framework =
    options.framework !== undefined
      ? (options.framework as Framework)
      : options.yes
        ? "express"
        : await askFramework();
  const database =
    options.database !== undefined
      ? (options.database as Database)
      : options.yes
        ? "mongodb"
        : await askDatabase();
  const language =
    options.language !== undefined
      ? (options.language as Language)
      : options.yes
        ? "typescript"
        : await askLanguage();

  const projectOptions = normalizeOptions({
    name,
    framework,
    database,
    language,
    outputDir: path.resolve(options.outputDir ?? process.cwd()),
  });
  if (options.dryRun) {
    const files = Object.keys(buildProjectFiles(projectOptions));
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            command: "init",
            dryRun: true,
            name: projectOptions.name,
            framework: projectOptions.framework,
            database: projectOptions.database,
            language: projectOptions.language,
            projectPath: path.resolve(projectOptions.outputDir, projectOptions.name),
            files,
          },
          null,
          2,
        ),
      );
      return;
    }
    console.log(`Would create ${projectOptions.name} (${formatStack(projectOptions)}):`);
    for (const file of files) {
      console.log(`  ${file}`);
    }
    return;
  }

  const result = createProject(projectOptions);
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          command: "init",
          dryRun: false,
          name: projectOptions.name,
          framework: projectOptions.framework,
          database: projectOptions.database,
          language: projectOptions.language,
          projectPath: result.projectPath,
          files: result.files,
        },
        null,
        2,
      ),
    );
    return;
  }
  console.log(`Created ${projectOptions.name} (${formatStack(projectOptions)}).`);
  console.log(`\n  cd ${path.relative(process.cwd(), result.projectPath) || "."}`);
  console.log("  npm install");
  console.log("  cp .env.example .env");
  if (projectOptions.database !== "sqlite") {
    console.log("  docker compose up -d");
  }
  console.log("  npm run dev");
};
