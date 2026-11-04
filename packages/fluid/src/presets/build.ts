import type { FluidConfig, FluidFamily, FluidPreset, FluidVariant } from "../types.ts";
import { CLASSIC_BASE, HOUSE_BASE } from "./families.ts";

const PARTICLE_COUNTS = [4096, 8192, 16384, 32768, 65536] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Snap a scaled particle budget to the nearest supported tier. */
export function pickParticleCount(base: number, multiplier: number): number {
  const target = base * multiplier;
  return PARTICLE_COUNTS.reduce((best, candidate) =>
    Math.abs(candidate - target) < Math.abs(best - target) ? candidate : best
  );
}

/**
 * Compose one preset from a family and a variant.
 *
 * Order matters: base family config, then the family's own overrides, then the
 * colour identity, then the variant multipliers on top of all of it.
 */
export function buildPreset(family: FluidFamily, variant: FluidVariant): FluidPreset {
  const base: Partial<FluidConfig> = {
    ...(family.group === "house" ? HOUSE_BASE : CLASSIC_BASE),
    ...(family.base ?? {}),
  };

  const particleBase = base.PARTICLE_COUNT ?? 16384;

  return {
    id: `${family.slug}-${variant.slug}`,
    name: `${family.name} · ${variant.name}`,
    group: family.group,
    family: family.slug,
    variant: variant.slug,
    config: {
      ...base,
      COLOR_HUE_MIN: family.hue[0],
      COLOR_HUE_MAX: family.hue[1],
      COLOR_SATURATION: family.saturation,
      COLOR_VALUE: family.value,
      BACK_COLOR: { r: family.back[0], g: family.back[1], b: family.back[2] },
      PARTICLE_COLOR: {
        r: family.particle[0],
        g: family.particle[1],
        b: family.particle[2],
      },
      CURL: (base.CURL ?? 30) * variant.curl,
      SPLAT_FORCE: (base.SPLAT_FORCE ?? 6000) * variant.force,
      DENSITY_DISSIPATION: (base.DENSITY_DISSIPATION ?? 1) * variant.density,
      BLOOM_INTENSITY: clamp((base.BLOOM_INTENSITY ?? 0.8) * variant.bloom, 0, 2),
      SUNRAYS_WEIGHT: clamp((base.SUNRAYS_WEIGHT ?? 1) * variant.sunrays, 0, 2),
      COLOR_UPDATE_SPEED: (base.COLOR_UPDATE_SPEED ?? 10) * variant.speed,
      PARTICLE_COUNT: pickParticleCount(particleBase, variant.particles),
      PARTICLE_SIZE: (base.PARTICLE_SIZE ?? 1.6) * variant.size,
    },
  };
}
