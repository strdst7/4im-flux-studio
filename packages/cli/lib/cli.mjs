/**
 * Command dispatch for `flux`.
 *
 * Adding a command is two steps: write `lib/commands/<name>.mjs` exporting a
 * handler and a `<name>Help` string, then add it to `COMMANDS`.
 */
import { parseArgs } from "./args.mjs";
import { bold, dim, gold, table } from "./format.mjs";

import { list, listHelp } from "./commands/list.mjs";
import { show, showHelp } from "./commands/show.mjs";
import { validate, validateHelp } from "./commands/validate.mjs";
import { exportPreset, exportHelp } from "./commands/export.mjs";
import { families, familiesHelp } from "./commands/families.mjs";
import { diff, diffHelp } from "./commands/diff.mjs";
import { random, randomHelp } from "./commands/random.mjs";
import { palette, paletteHelp } from "./commands/palette.mjs";

const COMMANDS = {
  list: { run: list, help: listHelp, summary: "print the preset catalogue" },
  show: { run: show, help: showHelp, summary: "one preset, resolved and explained" },
  families: { run: families, help: familiesHelp, summary: "list the palette families" },
  palette: { run: palette, help: paletteHelp, summary: "draw each family's hue window" },
  diff: { run: diff, help: diffHelp, summary: "compare two presets" },
  export: { run: exportPreset, help: exportHelp, summary: "write a preset as a module" },
  validate: { run: validate, help: validateHelp, summary: "schema-check every preset" },
  random: { run: random, help: randomHelp, summary: "pick — or synthesise — a look" },
  help: { run: help, help: help, summary: "this message" },
};

function help() {
  console.log(`${bold("flux")} ${dim("— the 4IM/Flux preset tool")}`);
  console.log("");
  console.log(
    table(
      Object.entries(COMMANDS).map(([name, command]) => [
        `  ${gold(name.padEnd(9))}`,
        dim(command.summary),
      ])
    )
  );
  console.log("");
  console.log(dim("flux help <command>   for flags and examples"));
  console.log(dim("flux <command> --json  for machine-readable output"));
  return 0;
}

export async function run(argv) {
  const { command, positionals, flags } = parseArgs(argv);

  if (command === "help" || flags.help === true) {
    const target = command === "help" ? positionals[0] : command;
    if (target && COMMANDS[target]) {
      console.log(COMMANDS[target].help);
      console.log("");
      return 0;
    }
    help();
    return 0;
  }

  const entry = COMMANDS[command];
  if (!entry) {
    console.error(`flux: unknown command "${command}"`);
    console.error(dim(`run \`flux help\` for the list`));
    process.exitCode = 1;
    return;
  }

  if (flags.version === true) {
    console.log("flux 1.0.0");
    return;
  }

  process.exitCode = await entry.run(positionals, flags);
}

export { COMMANDS };
