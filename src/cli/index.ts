#!/usr/bin/env node

import { program } from "commander";
import { execInit } from "./commands/init";
import { execGenBoilerPlate } from "./generate";

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

program.version("3.0.6");
program.command("--help").description("list commands").action(showHelp);

program
  .command("init")
  .description("Initialize a new men-pack project")
  .action(execInit);

program
  .command("genbp")
  .description(
    "Generate boilerPlate for routes, controllers, models , or a full API scaffold"
  )
  .action(execGenBoilerPlate);

program.parse(process.argv);
