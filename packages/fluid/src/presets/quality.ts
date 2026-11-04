import type { QualityLevel } from "../types.ts";

/**
 * Four budget tiers. Each remaps the keys that actually cost frame time:
 * simulation grid, dye texture, pressure iterations, bloom, sunrays and the
 * particle budget.
 */
export const QUALITY_LEVELS: QualityLevel[] = [
  {
    id: "low",
    name: "Low",
    note: "64 sim · 256 dye · 12 iterations · no bloom, sunrays or particles",
    config: {
      SIM_RESOLUTION: 64,
      DYE_RESOLUTION: 256,
      PRESSURE_ITERATIONS: 12,
      BLOOM: false,
      SUNRAYS: false,
      SHADING: false,
      PARTICLES: false,
      PARTICLE_COUNT: 4096,
    },
  },
  {
    id: "medium",
    name: "Medium",
    note: "128 sim · 512 dye · 20 iterations · bloom · 8k particles",
    config: {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      PRESSURE_ITERATIONS: 20,
      BLOOM: true,
      BLOOM_RESOLUTION: 256,
      BLOOM_ITERATIONS: 8,
      SUNRAYS: false,
      SHADING: true,
      PARTICLES: true,
      PARTICLE_COUNT: 8192,
    },
  },
  {
    id: "high",
    name: "High",
    note: "128 sim · 1024 dye · 24 iterations · bloom + sunrays · 16k particles",
    config: {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      PRESSURE_ITERATIONS: 24,
      BLOOM: true,
      BLOOM_RESOLUTION: 256,
      BLOOM_ITERATIONS: 8,
      SUNRAYS: true,
      SUNRAYS_RESOLUTION: 196,
      SHADING: true,
      PARTICLES: true,
      PARTICLE_COUNT: 16384,
    },
  },
  {
    id: "ultra",
    name: "Ultra",
    note: "256 sim · 1024 dye · 32 iterations · full effects · 65k particles",
    config: {
      SIM_RESOLUTION: 256,
      DYE_RESOLUTION: 1024,
      PRESSURE_ITERATIONS: 32,
      BLOOM: true,
      BLOOM_RESOLUTION: 512,
      BLOOM_ITERATIONS: 8,
      SUNRAYS: true,
      SUNRAYS_RESOLUTION: 196,
      SHADING: true,
      PARTICLES: true,
      PARTICLE_COUNT: 65536,
    },
  },
];

export const DEFAULT_QUALITY_ID = "high";

export function getQuality(id: string): QualityLevel {
  return QUALITY_LEVELS.find(q => q.id === id) ?? QUALITY_LEVELS[2]!;
}
