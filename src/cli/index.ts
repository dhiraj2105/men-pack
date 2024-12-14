#!/usr/bin/env node

import { program } from 'commander';
import { execInit } from './commands/init';
import { execGenerate } from './generate';

const args = process.argv.slice(2);

const showHelp = () => {
  console.log(
    `Usage:
        men-pack [command]
        
    Commands:
        init        Initialize a new project
        --help      Show help information
        --version   Show the current version
    `
  );
};

const showVersion = () => {
  console.log('men-pack version 1.0.0');
};

// command handling
// (async () => {
//   switch (args[0]) {
//     case 'init':
//       execInit();
//       break;
//     case '--help':
//       showHelp();
//       break;
//     case '--version':
//       showVersion();
//       break;
//     default:
//       console.error(
//         `Unkown command, Use --help for a list of available commands.`
//       );
//       process.exit(1);
//   }
// })();

program.command('--version').description('version of app').action(showVersion);

program
  .command('init')
  .description('Initialize a new men-pack project')
  .action(execInit);

program
  .command('generate')
  .description('Generate routes, controllers, models , or a full API scaffold')
  .action(execGenerate);

program.parse(process.argv);
