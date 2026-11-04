/**
 * `flux random` — a random splat of settings.
 *
 * Two modes: pick one of the existing presets (default), or synthesise a new
 * config entirely from the schema — hue window, curl, force, dissipation,
 * particle budget — and emit it as a starting point.
 */
import { FLUID_DEFAULTS, PRESETS, diffFromDefaults, resolveConfig } from "@4im/fluid";
import { boolFlag, stringFlag, numberFlag } from "../args.mjs";
import { bold, dim, gold } from "../format.mjs";
import { renderTs } from "./export.mjs";

const pick = list => list[Math.floor(Math.random() * list.length)];
const between = (min, max, step = 0) => {
  const raw = min + Math.random() * (max - min);
  return step ? Math.round(raw / step) * step : raw;
};

/** A brand-new look, built only from the schema. */
export function synthesise() {
  const hueMin = Number(between(0, 1, 0.01).toFixed(2));
  const span = Number(between(0.03, 0.18, 0.01).toFixed(2));
  const particleTiers = [4096, 8192, 16384, 32768, 65536];

  return diffFromDefaults({
    ...FLUID_DEFAULTS,
    COLOR_HUE_MIN: hueMin,
    COLOR_HUE_MAX: Number((hueMin + span).toFixed(2)),
    COLOR_SATURATION: Number(between(0.25, 1, 0.05).toFixed(2)),
    COLOR_VALUE: Number(between(0.75, 1, 0.05).toFixed(2)),
    CURL: Math.round(between(10, 60)),
    SPLAT_FORCE: Math.round(between(3000, 9000, 100)),
    SPLAT_RADIUS: Number(between(0.12, 0.35, 0.01).toFixed(2)),
    DENSITY_DISSIPATION: Number(between(0.85, 1.45, 0.05).toFixed(2)),
    VELOCITY_DISSIPATION: Number(between(0.14, 0.32, 0.02).toFixed(2)),
    BLOOM_INTENSITY: Number(between(0.3, 1.2, 0.05).toFixed(2)),
    SUNRAYS_WEIGHT: Number(between(0.4, 1.3, 0.05).toFixed(2)),
    PARTICLE_COUNT: pick(particleTiers),
    PARTICLE_COLOR: {
      r: Number(between(0.4, 1, 0.05).toFixed(2)),
      g: Number(between(0.4, 1, 0.05).toFixed(2)),
      b: Number(between(0.3, 1, 0.05).toFixed(2)),
    },
    BACK_COLOR: {
      r: Number(between(0, 0.05, 0.005).toFixed(3)),
      g: Number(between(0, 0.05, 0.005).toFixed(3)),
      b: Number(between(0, 0.06, 0.005).toFixed(3)),
    },
  });
}

export async function random(_positionals, flags) {
  const group = stringFlag(flags, "group");

  if (boolFlag(flags, "synth")) {
    const config = synthesise();
    if (boolFlag(flags, "json")) {
      console.log(JSON.stringify(config, null, 2));
      return 0;
    }
    if (boolFlag(flags, "ts")) {
      process.stdout.write(
        renderTs(
          {
            id: "synthesised",
            name: "Synthesised · Random",
            group: "signature",
            family: "random",
            variant: "synth",
            config,
          },
          "diff"
        )
      );
      return 0;
    }
    console.log(gold("synthesised look"));
    console.log(JSON.stringify(config, null, 2));
    return 0;
  }

  const pool = group ? PRESETS.filter(p => p.group === group) : PRESETS;
  const preset = pick(pool);
  const quality = stringFlag(flags, "quality");
  const config = resolveConfig({ preset, quality });

  if (boolFlag(flags, "json")) {
    console.log(JSON.stringify({ ...preset, resolved: config }, null, 2));
    return 0;
  }

  console.log(`${gold(preset.name)}  ${dim(preset.id)}`);
  console.log(dim(`quality ${quality ?? "preset default"} · ${preset.group}`));
  return 0;
}

export const randomHelp = `${bold("flux random")} [--group house|classic|signature] [--synth] [--json] [--ts]

Pick a preset at random, or with --synth generate a brand-new config from the
schema — a hue window, curl, force, dissipation and particle budget that have
never existed before. --ts emits it as a ready-to-paste module.`;
