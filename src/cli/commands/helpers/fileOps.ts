import fs from 'fs-extra';
import path from 'path';

export const createProjectStructure = (
  projectType: string,
  projectName: string
) => {
  const rootDir = process.cwd();
  const projectDir = path.join(rootDir, projectName);
  const srcDir = path.join(projectDir, 'src');

  // create dir
  fs.ensureDirSync(projectDir);
  fs.ensureDirSync(srcDir);

  // Add basic files (empty for now: biolerplate will be added later)
  const indexFile = projectType === 'TypeScript' ? 'index.ts' : 'index.js';
  fs.writeFileSync(path.join(srcDir, indexFile), '// Project entry point');

  //Add a basic package.json
  const packageJson = {
    name: 'men-pack-project',
    version: '1.0.0',
    main: `src/${indexFile}`,
    scripts: {
      start: `node src/${indexFile}`,
    },
  };
  fs.writeJsonSync(path.join(projectDir, 'package.json'), packageJson, {
    spaces: 2,
  });
};

export const addBoilerplateFiles = (
  projectType: string,
  projectName: string
) => {
  const rootDir = path.join(process.cwd(), projectName);
  const srcDir = path.join(rootDir, 'src');
  const ext = projectType === 'TypeScript' ? 'ts' : 'js';

  // create routes, controllers, model directories
  fs.ensureDirSync(path.join(srcDir, 'routes'));
  fs.ensureDirSync(path.join(srcDir, 'controllers'));
  fs.ensureDirSync(path.join(srcDir, 'models'));

  // boilerplate code
  const indexContent = `
  import express from 'express';
import routes from './routes';

const app = express();
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
  `;

  const routeContent = `
import express from 'express';
import { getHelloWorld } from '../controllers';

const router = express.Router();
router.get('/', getHelloWorld);

export default router;
  `;

  const controllerContent = `
export const getHelloWorld = (req, res) => {
  res.send('Hello, world!');
};
  `;

  fs.writeFileSync(path.join(srcDir, `index.${ext}`), indexContent);
  fs.writeFileSync(path.join(srcDir, `routes/index.${ext}`), routeContent);
  fs.writeFileSync(
    path.join(srcDir, `controllers/index.${ext}`),
    controllerContent
  );

  // Add a basic model (for demonstration purposes)
  const modelContent = `
export const sampleModel = {
  id: 1,
  name: 'Sample',
};`;
  fs.writeFileSync(path.join(srcDir, `models/index.${ext}`), modelContent);

  // Add environment variables
  fs.writeFileSync(path.join(rootDir, '.env'), 'PORT=3000');

  // Add .gitignore
  fs.writeFileSync(path.join(rootDir, '.gitignore'), 'node_modules\n.env');

  // Add README.md
  const readmeContent = `
# men-pack-project

This project was generated using men-pack CLI.

## Available Scripts
- \`npm start\`: Starts the server.
  `;
  fs.writeFileSync(path.join(rootDir, 'README.md'), readmeContent);
};

export const generateRoute = (name: string, projectType: string) => {
  const ext = projectType === 'TypeScript' ? 'ts' : 'js';
  const filePath = path.join(process.cwd(), `src/routes`, `${name}.${ext}`);

  const content = `
import express from 'express';
import { get${name}, create${name} } from '../controllers/${name}';

const router = express.Router();

router.get('/', get${name});
router.post('/', create${name});

export default router;
  `;
  fs.writeFileSync(filePath, content);
};

export const generateController = (name: string, projectType: string) => {
  const ext = projectType === 'TypeScript' ? 'ts' : 'js';

  const filePath = path.join(
    process.cwd(),
    'src/controllers',
    `${name}.${ext}`
  );
  const content = `
export const get${name} = (req, res) => {
  res.send('${name} fetched successfully!');
};

export const create${name} = (req, res) => {
  res.send('${name} created successfully!');
};
  `;
  fs.writeFileSync(filePath, content);
};

export const generateModel = (name: string, projectType: string) => {
  const ext = projectType === 'TypeScript' ? 'ts' : 'js';

  const filePath = path.join(process.cwd(), 'src/models', `${name}.${ext}`);
  const content = `
import mongoose from 'mongoose';

const ${name}Schema = new mongoose.Schema({
  field1: { type: String, required: true },
  field2: { type: Number, required: true },
});

export default mongoose.model('${name}', ${name}Schema);
  `;
  fs.writeFileSync(filePath, content);
};

export const generateFullAPI = (name: string, projectType: string) => {
  generateRoute(name, projectType);
  generateController(name, projectType);
  generateModel(name, projectType);

  const ext = projectType === 'TypeScript' ? 'ts' : 'js';

  // Add route to main index.ts
  const indexPath = path.join(process.cwd(), 'src', `index.${ext}`);
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  indexContent = indexContent.replace(
    '// ADD_ROUTES_HERE',
    `app.use('/api/${name}', require('./routes/${name}'));\n// ADD_ROUTES_HERE`
  );
  fs.writeFileSync(indexPath, indexContent);
};
