export { createFluidSimulation } from "./core/fluid.core.js";

export type {
  FluidColor,
  FluidConfig,
  FluidFamily,
  FluidInfo,
  FluidPreset,
  FluidSimulation,
  FluidVariant,
  ImageSplatOptions,
  QualityLevel,
  RecordingOptions,
} from "./types.ts";

export {
  BOOLEAN_KEYS,
  COLOR_KEYS,
  CONFIG_KEYS,
  FLUID_DEFAULTS,
} from "./defaults.ts";

export {
  fluidColorToHex,
  hexToFluidColor,
  hueWindowTurns,
} from "./color.ts";

export { errorsOnly, validateCatalogue, validatePreset } from "./validate.ts";
export type { Issue, IssueLevel } from "./validate.ts";

export { diffFromDefaults, mergeConfig, presetToCssVars, resolveConfig } from "./runtime.ts";
export type { ResolveInput } from "./runtime.ts";

export {
  AIMIRAH_HOUSE,
  CLASSIC_BASE,
  CLASSIC_FAMILIES,
  CLASSIC_PRESETS,
  DEFAULT_PRESET_ID,
  DEFAULT_QUALITY_ID,
  FAMILIES,
  HOUSE_BASE,
  HOUSE_FAMILIES,
  HOUSE_PRESETS,
  PRESETS,
  PRESET_COUNT,
  QUALITY_LEVELS,
  SHOWCASE_CONFIG,
  SIGNATURE_PRESETS,
  UPSTREAM_ORIGINAL,
  VARIANTS,
  buildPreset,
  getFamily,
  getPreset,
  getQuality,
  getVariant,
  hasPreset,
  pickParticleCount,
  presetsForFamily,
  searchPresets,
} from "./presets/index.ts";
