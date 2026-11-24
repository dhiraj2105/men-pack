import path from "node:path";
import { askResourceName } from "./helpers/prompts.js";
import { createResource } from "../resource.js";

export interface GenerateCommandOptions {
  directory?: string;
  json?: boolean;
}

export const execGenerate = async (
  requestedName: string | undefined,
  options: GenerateCommandOptions,
) => {
  if (!requestedName && options.json) {
    throw new Error("Provide a resource name when using --json.");
  }
  const name = requestedName ?? (await askResourceName());
  const directory = path.resolve(options.directory ?? process.cwd());
  const result = createResource(name, directory);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          command: "generate",
          resource: name,
          endpoint: result.endpoint,
          projectPath: directory,
          files: result.files,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Created resource "${name}" with endpoint ${result.endpoint}.`);
  for (const file of result.files) {
    console.log(`  ${file}`);
  }
};
