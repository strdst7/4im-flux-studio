import type { FluidPreset } from "../types.ts";
import { buildPreset } from "./build.ts";
import { FAMILIES, getFamily } from "./families.ts";
import { SIGNATURE_PRESETS } from "./signatures.ts";
import { VARIANTS } from "./variants.ts";

export { buildPreset, pickParticleCount } from "./build.ts";
export {
  CLASSIC_FAMILIES,
  CLASSIC_BASE,
  FAMILIES,
  HOUSE_BASE,
  HOUSE_FAMILIES,
  getFamily,
} from "./families.ts";
export { VARIANTS, getVariant } from "./variants.ts";
export {
  AIMIRAH_HOUSE,
  SHOWCASE_CONFIG,
  SIGNATURE_PRESETS,
  UPSTREAM_ORIGINAL,
} from "./signatures.ts";
export { DEFAULT_QUALITY_ID, QUALITY_LEVELS, getQuality } from "./quality.ts";

/**
 * The full catalogue: every family × every variant, plus the two signatures.
 *
 * 24 families × 4 intensities + 2 signatures = 98. The studio's header reads
 * this number, so it can never drift from what is actually available.
 */
export const PRESETS: FluidPreset[] = [
  ...SIGNATURE_PRESETS,
  ...FAMILIES.flatMap(family => VARIANTS.map(variant => buildPreset(family, variant))),
];

export const PRESET_COUNT = PRESETS.length;

export const HOUSE_PRESETS = PRESETS.filter(p => p.group === "house");
export const CLASSIC_PRESETS = PRESETS.filter(p => p.group === "classic");

export const DEFAULT_PRESET_ID = "aimirah-house";

export function getPreset(id: string): FluidPreset {
  return PRESETS.find(p => p.id === id) ?? PRESETS[0]!;
}

export function hasPreset(id: string): boolean {
  return PRESETS.some(p => p.id === id);
}

/** Every preset in a family, in intensity order. */
export function presetsForFamily(slug: string): FluidPreset[] {
  return PRESETS.filter(p => p.family === slug);
}

/** Case-insensitive substring search over preset names and ids. */
export function searchPresets(query: string): FluidPreset[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return PRESETS;
  return PRESETS.filter(
    p => p.name.toLowerCase().includes(needle) || p.id.toLowerCase().includes(needle)
  );
}
