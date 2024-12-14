import inquirer from "inquirer";

export const askProjectName = async () => {
  return await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name",
      validate: (input) => {
        if (!input.trim()) {
          return "Project name cannot be empty.";
        }
        if (/[^a-zA-Z0-9-_]/.test(input)) {
          return "Project name can only include letters, numbers, hyphens, and underscores.";
        }
        return true;
      },
    },
  ]);
};

export const askProjectType = async () => {
  return await inquirer.prompt([
    {
      type: "list",
      name: "projectType",
      message: "Choose your project type: ",
      choices: ["TypeScript", "JavaScript"],
    },
  ]);
};

export const askSetupType = async () => {
  return await inquirer.prompt([
    {
      type: "list",
      name: "setupType",
      message: "Choose your setup type: ",
      choices: ["Basic", "Full"],
    },
  ]);
};

export const askGenerateName = async () => {
  return await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter name of feature (e.g., users): ",
    },
  ]);
};

export const askGenerateType = async () => {
  return await inquirer.prompt([
    {
      type: "list",
      name: "generateType",
      message: "What would you like to generate ? : ",
      choices: ["Controller", "Route", "Model", "Full API Scaffold"],
    },
  ]);
};
