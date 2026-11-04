/**
 * `flux show` — one preset, resolved against the defaults.
 */
import {
  FLUID_DEFAULTS,
  getPreset,
  hasPreset,
  resolveConfig,
} from "@4im/fluid";
import { boolFlag, stringFlag, numberFlag, colourFlag } from "../args.mjs";
import { bold, dim, gold, table } from "../format.mjs";

/** Flags that patch the resolved config before it is printed. */
function overridesFrom(flags) {
  const patch = {};
  if (flags.curl !== undefined) patch.CURL = numberFlag(flags, "curl");
  if (flags.force !== undefined) patch.SPLAT_FORCE = numberFlag(flags, "force");
  if (flags.dissipation !== undefined) patch.DENSITY_DISSIPATION = numberFlag(flags, "dissipation");
  if (flags.particles !== undefined) patch.PARTICLES = boolFlag(flags, "particles");
  if (flags.bloom !== undefined) patch.BLOOM = boolFlag(flags, "bloom");
  if (flags.color !== undefined) patch.PARTICLE_COLOR = colourFlag(stringFlag(flags, "color"));
  return patch;
}

export async function show(positionals, flags) {
  const id = positionals[0];
  if (!id) {
    console.error("flux show needs a preset id — run `flux list` to see them");
    return 1;
  }
  if (!hasPreset(id)) {
    console.error(`unknown preset "${id}"`);
    return 1;
  }

  const preset = getPreset(id);
  const quality = stringFlag(flags, "quality");
  const config = resolveConfig({ preset, quality, overrides: overridesFrom(flags) });

  if (boolFlag(flags, "json")) {
    console.log(JSON.stringify({ ...preset, resolved: config }, null, 2));
    return 0;
  }

  console.log(`${gold(preset.name)}  ${dim(preset.id)}`);
  console.log(dim(`${preset.group} · family ${preset.family} · variant ${preset.variant}`));
  if (quality) console.log(dim(`quality tier: ${quality}`));
  console.log("");

  const rows = Object.entries(config).map(([key, value]) => {
    const isDefault = JSON.stringify(value) === JSON.stringify(FLUID_DEFAULTS[key]);
    const rendered = typeof value === "object" ? JSON.stringify(value) : String(value);
    return [dim(key), isDefault ? dim(rendered) : rendered];
  });

  console.log(table(rows));
  console.log("");
  console.log(dim("dimmed values are the schema default — only the rest are this preset's doing"));
  return 0;
}

export const showHelp = `${bold("flux show")} <preset-id> [--quality low|medium|high|ultra] [--json]

Print one preset merged over the defaults. Values that differ from the default
are shown bright, so you can read a preset at a glance.

  --curl <n>          override CURL
  --force <n>         override SPLAT_FORCE
  --dissipation <n>   override DENSITY_DISSIPATION
  --color <hex>       override PARTICLE_COLOR
  --bloom / --no-bloom
  --particles / --no-particles`;
