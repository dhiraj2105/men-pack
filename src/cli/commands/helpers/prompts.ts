import inquirer from "inquirer";
import {
  databases,
  frameworks,
  isValidProjectName,
  languages,
  type Database,
  type Framework,
  type Language,
} from "../../project.js";

export const askProjectName = async () => {
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: "input",
      name: "name",
      message: "Project name:",
      validate: (value: string) =>
        isValidProjectName(value) ||
        "Use a lowercase name of at most 214 characters; start with a letter or number.",
    },
  ]);
  return name;
};

export const askResourceName = async () => {
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: "input",
      name: "name",
      message: "Resource name (lowercase kebab-case):",
      validate: (value: string) =>
        /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) ||
        "Use lowercase kebab-case, such as user-profiles.",
    },
  ]);
  return name;
};

export const askFramework = async (): Promise<Framework> => {
  const { framework } = await inquirer.prompt<{ framework: Framework }>([
    {
      type: "list",
      name: "framework",
      message: "Choose a framework:",
      choices: frameworks,
      default: "express",
    },
  ]);
  return framework;
};

export const askDatabase = async (): Promise<Database> => {
  const { database } = await inquirer.prompt<{ database: Database }>([
    {
      type: "list",
      name: "database",
      message: "Choose a database:",
      choices: databases,
      default: "mongodb",
    },
  ]);
  return database;
};

export const askLanguage = async (): Promise<Language> => {
  const { language } = await inquirer.prompt<{ language: Language }>([
    {
      type: "list",
      name: "language",
      message: "Choose a language:",
      choices: languages,
      default: "typescript",
    },
  ]);
  return language;
};
