import { FLUID_DEFAULTS } from "./defaults.ts";
import { getQuality } from "./presets/quality.ts";
import { getPreset } from "./presets/index.ts";
import type { FluidConfig, FluidPreset } from "./types.ts";

export type ResolveInput = {
  preset?: string | FluidPreset;
  quality?: string;
  overrides?: Partial<FluidConfig>;
};

/**
 * Layer a preset, a quality tier and ad-hoc overrides into one config.
 *
 * Later layers win, so the order is: defaults → preset → quality → overrides.
 * Quality sits above the preset because picking "Low" should always mean the
 * same budget, whatever look is selected.
 */
export function resolveConfig(input: ResolveInput = {}): FluidConfig {
  const { preset, quality, overrides } = input;

  const presetConfig =
    typeof preset === "string" ? getPreset(preset).config : (preset?.config ?? {});

  const qualityConfig = quality ? getQuality(quality).config : {};

  return {
    ...FLUID_DEFAULTS,
    ...presetConfig,
    ...qualityConfig,
    ...(overrides ?? {}),
  } as FluidConfig;
}

/** Only the keys that differ from the schema defaults — useful for saving. */
export function diffFromDefaults(config: Partial<FluidConfig>): Partial<FluidConfig> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    const fallback = (FLUID_DEFAULTS as Record<string, unknown>)[key];
    if (fallback === undefined) continue;

    if (typeof value === "object" && value !== null) {
      const a = value as Record<string, number>;
      const b = fallback as Record<string, number>;
      if (a.r !== b.r || a.g !== b.g || a.b !== b.b) out[key] = value;
      continue;
    }

    if (value !== fallback) out[key] = value;
  }

  return out as Partial<FluidConfig>;
}

/**
 * A preset as CSS custom properties. Handy for tinting surrounding chrome —
 * the swatch in a gallery, a caption rule — from the same numbers the solver
 * is using.
 */
export function presetToCssVars(preset: FluidPreset): Record<string, string> {
  const config = preset.config;
  const hueMin = config.COLOR_HUE_MIN ?? 0;
  const hueMax = config.COLOR_HUE_MAX ?? 1;
  const midHue = ((hueMin + hueMax) / 2) % 1;
  const sat = Math.round((config.COLOR_SATURATION ?? 1) * 100);
  const light = Math.round((config.COLOR_VALUE ?? 1) * 52);
  const back = config.BACK_COLOR ?? { r: 0, g: 0, b: 0 };

  return {
    "--preset-accent": `hsl(${(midHue * 360).toFixed(1)} ${sat}% ${light}%)`,
    "--preset-back": `rgb(${Math.round(back.r * 255)} ${Math.round(back.g * 255)} ${Math.round(
      back.b * 255
    )})`,
    "--preset-hue-min": String(hueMin),
    "--preset-hue-max": String(hueMax),
  };
}

/** Concatenate overrides for an imperative handle call. */
export function mergeConfig(...parts: (Partial<FluidConfig> | undefined)[]): Partial<FluidConfig> {
  return Object.assign({}, ...parts.filter(Boolean));
}
