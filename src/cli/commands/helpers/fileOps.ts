import fs from "fs-extra";
import path from "path";

const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const createProjectStructure = (
  projectType: string,
  projectName: string
) => {
  const rootDir = process.cwd();
  const projectDir = path.join(rootDir, projectName);
  // const srcDir = path.join(projectDir, "src");

  // create dir
  fs.ensureDirSync(projectDir);
  // fs.ensureDirSync(srcDir);

  // Add basic files (empty for now: biolerplate will be added later)
  const indexFile = projectType === "TypeScript" ? "index.ts" : "index.js";
  fs.writeFileSync(path.join(projectDir, indexFile), "// Project entry point");

  //Add a basic package.json
  const packageJson = {
    name: `${projectName}`,
    version: "1.0.0",
    main: `${indexFile}`,
    type: "module",
    scripts: {
      start: `node ${indexFile}`,
    },
    dependencies: {
      express: "^4.21.2",
      mongodb: "^6.12.0",
      mongoose: "^8.9.0",
      dotenv: "^16.4.7",
    },
  };
  fs.writeJsonSync(path.join(projectDir, "package.json"), packageJson, {
    spaces: 2,
  });

  if (projectType === "TypeScript") {
    const tspackageJson = {
      name: `${projectName}`,
      version: "1.0.0",
      main: `${indexFile}`,
      scripts: {
        start: `node ${indexFile}`,
        build: "tsc",
      },
      dependencies: {
        dotenv: "^16.4.7",
        express: "^4.21.2",
        mongodb: "^6.12.0",
        mongoose: "^8.9.0",
      },
      devDependencies: {
        "@types/node": "^22.10.2",
        "@types/express": "^5.0.0",
        typescript: "^4.2.3",
      },
    };
    fs.writeJsonSync(path.join(projectDir, "package.json"), tspackageJson, {
      spaces: 2,
    });

    // adding tsconfig.json file for TS projects
    const tsconfigJson = `{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for legacy experimental decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node10",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    // "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    // "allowImportingTsExtensions": true,               /* Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. */
    // "resolvePackageJsonExports": true,                /* Use the package.json 'exports' field when resolving package imports. */
    // "resolvePackageJsonImports": true,                /* Use the package.json 'imports' field when resolving imports. */
    // "customConditions": [],                           /* Conditions to set in addition to the resolver-specific defaults when resolving imports. */
    // "noUncheckedSideEffectImports": true,             /* Check side effect imports. */
    // "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "allowArbitraryExtensions": true,                 /* Enable importing files with any extension, provided a declaration file is present. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    // "outDir": "./",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "verbatimModuleSyntax": true,                     /* Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting. */
    // "isolatedDeclarations": true,                     /* Require sufficient annotation on exports so other tools can trivially generate declaration files. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                         /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "strictBuiltinIteratorReturn": true,              /* Built-in iterators are instantiated with a 'TReturn' type of 'undefined' instead of 'any'. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}
`;
    fs.writeFileSync(path.join(projectDir, "tsconfig.json"), tsconfigJson);
  }
};

export const addBoilerplateFiles = (
  projectType: string,
  projectName: string
) => {
  const rootDir = path.join(process.cwd(), projectName);
  const ext = projectType === "TypeScript" ? "ts" : "js";

  // create routes, controllers, model directories
  fs.ensureDirSync(path.join(rootDir, "routes"));
  fs.ensureDirSync(path.join(rootDir, "controllers"));
  fs.ensureDirSync(path.join(rootDir, "models"));

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

  fs.writeFileSync(path.join(rootDir, `index.${ext}`), indexContent);
  fs.writeFileSync(path.join(rootDir, `routes/index.${ext}`), routeContent);

  if (projectType === "TypeScript") {
    const controllerContent = `
    export const getHelloWorld = (req:any, res:any) => {
      res.send('Hello, world!');
      };
      `;
    fs.writeFileSync(
      path.join(rootDir, `controllers/index.${ext}`),
      controllerContent
    );
  } else {
    const controllerContent = `
      export const getHelloWorld = (req, res) => {
        res.send('Hello, world!');
        };
        `;
    fs.writeFileSync(
      path.join(rootDir, `controllers/index.${ext}`),
      controllerContent
    );
  }

  // Add a basic model (for demonstration purposes)
  const modelContent = `
export const sampleModel = {
  id: 1,
  name: 'Sample',
};`;
  fs.writeFileSync(path.join(rootDir, `models/index.${ext}`), modelContent);

  // Add environment variables
  fs.writeFileSync(path.join(rootDir, ".env"), "PORT=3000");

  // Add .gitignore
  fs.writeFileSync(path.join(rootDir, ".gitignore"), "node_modules\n.env");

  // Add README.md
  const readmeContent = `
# men-pack-project

This project was generated using men-pack CLI.

## Available Scripts
- \`npm start\`: Starts the server.
  `;
  fs.writeFileSync(path.join(rootDir, "README.md"), readmeContent);
};

export const generateRoute = (name: string, projectType: string) => {
  const ext = projectType === "TypeScript" ? "ts" : "js";
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
  const ext = projectType === "TypeScript" ? "ts" : "js";

  const filePath = path.join(
    process.cwd(),
    "src/controllers",
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
  const ext = projectType === "TypeScript" ? "ts" : "js";

  const filePath = path.join(process.cwd(), "src/models", `${name}.${ext}`);
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

  const ext = projectType === "TypeScript" ? "ts" : "js";

  // Add route to main index.ts
  const indexPath = path.join(process.cwd(), "src", `index.${ext}`);
  let indexContent = fs.readFileSync(indexPath, "utf8");
  indexContent = indexContent.replace(
    "// ADD_ROUTES_HERE",
    `app.use('/api/${name}', require('./routes/${name}'));\n// ADD_ROUTES_HERE`
  );
  fs.writeFileSync(indexPath, indexContent);
};
