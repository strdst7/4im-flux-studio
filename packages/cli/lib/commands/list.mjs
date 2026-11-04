/**
 * `flux list` — the preset catalogue, grouped or flat.
 */
import { PRESET_COUNT, PRESETS, FAMILIES, VARIANTS } from "@4im/fluid";
import { stringFlag, boolFlag } from "../args.mjs";
import { bold, dim, gold, table } from "../format.mjs";

export async function list(positionals, flags) {
  const group = stringFlag(flags, "group");
  const family = stringFlag(flags, "family");
  const json = boolFlag(flags, "json");

  let pool = PRESETS;
  if (group) pool = pool.filter(p => p.group === group);
  if (family) pool = pool.filter(p => p.family === family);

  if (json) {
    console.log(JSON.stringify(pool, null, 2));
    return 0;
  }

  if (pool.length === 0) {
    console.error(`no presets matched (family "${family ?? "*"}", group "${group ?? "*"}")`);
    return 1;
  }

  const rows = pool.map(p => [gold(p.id), p.name, dim(p.group)]);
  console.log(table(rows));
  console.log("");
  console.log(
    dim(`${pool.length} of ${PRESET_COUNT} presets · ${FAMILIES.length} families × ${VARIANTS.length} variants`)
  );
  return 0;
}

export const listHelp = `${bold("flux list")} [--group house|classic|signature] [--family <slug>] [--json]

Print the preset catalogue. Filters compose; --json emits the raw objects so
you can pipe straight into jq.`;
