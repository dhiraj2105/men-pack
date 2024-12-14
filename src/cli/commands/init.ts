import { addBoilerplateFiles, createProjectStructure } from './helpers/fileOps';
import {
  askProjectName,
  askProjectType,
  askSetupType,
} from './helpers/prompts';

export const execInit = async () => {
  console.log('Initializing project...');

  // Step 1 : Ask user for project preferences
  const { projectName } = await askProjectName();
  const { projectType } = await askProjectType();
  const { setupType } = await askSetupType();

  // Step 2 : Generate project structure
  console.log(`Creating a ${projectType} project named "${projectName}`);
  createProjectStructure(projectType, projectName);

  // Step 3 : Add boilerplate files
  if (setupType === 'Full') {
    console.log('Adding boilerplate files...');
    addBoilerplateFiles(projectType, projectName);
  }

  console.log('Project initialized done.');
};
