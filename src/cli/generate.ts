import {
  generateController,
  generateFullAPI,
  generateModel,
  generateRoute,
} from './commands/helpers/fileOps';
import {
  askGenerateName,
  askGenerateType,
  askProjectType,
} from './commands/helpers/prompts';

export const execGenerate = async () => {
  console.log(' Welcome to the generate tool !');

  // Step 1 : ask user what to generate
  const { generateType } = await askGenerateType();
  const { name } = await askGenerateName();

  const { projectType } = await askProjectType();

  //  Step 2 : generate based on user input
  switch (generateType) {
    case 'Route':
      generateRoute(name, projectType);
      break;
    case 'Controller':
      generateController(name, projectType);
      break;
    case 'Model':
      generateModel(name, projectType);
      break;
    case 'Full API Scaffold':
      generateFullAPI(name, projectType);
      break;
    default:
      console.log('Invalid choice!');
  }
};
