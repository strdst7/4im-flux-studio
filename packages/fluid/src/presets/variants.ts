import type { FluidVariant } from "../types.ts";

/**
 * Four intensities, applied as multipliers over a family's base config.
 * `balanced` is deliberately all-ones: it is the family exactly as designed.
 */
export const VARIANTS: FluidVariant[] = [
  { slug: "subtle", name: "Subtle", curl: 0.5, force: 0.65, density: 1.35, bloom: 0.6, sunrays: 0.6, speed: 0.5, particles: 0.5, size: 0.85 },
  { slug: "balanced", name: "Balanced", curl: 1, force: 1, density: 1, bloom: 1, sunrays: 1, speed: 1, particles: 1, size: 1 },
  { slug: "intense", name: "Intense", curl: 1.8, force: 1.5, density: 0.85, bloom: 1.3, sunrays: 1.2, speed: 1.6, particles: 1.8, size: 1.15 },
  { slug: "wild", name: "Wild", curl: 2.8, force: 2.1, density: 0.7, bloom: 1.65, sunrays: 1.4, speed: 2.4, particles: 2.6, size: 1.3 },
];

export function getVariant(slug: string): FluidVariant | undefined {
  return VARIANTS.find(v => v.slug === slug);
}
