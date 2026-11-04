/**
 * `flux diff` — what actually differs between two presets.
 */
import { getPreset, hasPreset, resolveConfig } from "@4im/fluid";
import { boolFlag } from "../args.mjs";
import { bold, dim, gold, table } from "../format.mjs";

const render = value => (typeof value === "object" ? JSON.stringify(value) : String(value));

export async function diff(positionals, flags) {
  const [leftId, rightId] = positionals;
  if (!leftId || !rightId) {
    console.error("flux diff needs two preset ids: flux diff <a> <b>");
    return 1;
  }
  for (const id of [leftId, rightId]) {
    if (!hasPreset(id)) {
      console.error(`unknown preset "${id}"`);
      return 1;
    }
  }

  const left = resolveConfig({ preset: getPreset(leftId) });
  const right = resolveConfig({ preset: getPreset(rightId) });
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();

  const changed = keys.filter(
    key => JSON.stringify(left[key]) !== JSON.stringify(right[key])
  );

  if (boolFlag(flags, "json")) {
    console.log(
      JSON.stringify(
        changed.map(key => ({ key, [leftId]: left[key], [rightId]: right[key] })),
        null,
        2
      )
    );
    return 0;
  }

  if (changed.length === 0) {
    console.log("these two presets resolve to identical configs");
    return 0;
  }

  console.log(`${gold(leftId)} → ${gold(rightId)}`);
  console.log("");
  console.log(
    table(
      changed.map(key => [dim(key), render(left[key]), "→", render(right[key])])
    )
  );
  console.log("");
  console.log(dim(`${changed.length} of ${keys.length} keys differ`));
  return 0;
}

export const diffHelp = `${bold("flux diff")} <preset-a> <preset-b> [--json]

Compare two presets after both are resolved against the defaults, and print
only the keys that differ. Useful when tuning a new family against its
neighbours.`;
