import type { FluidConfig, FluidFamily } from "../types.ts";

/**
 * The two base states every family is built on top of. Families may override
 * individual keys; the variant then scales the result.
 */
export const HOUSE_BASE: Partial<FluidConfig> = {
  CURL: 26,
  SPLAT_RADIUS: 0.22,
  SPLAT_FORCE: 5200,
  DENSITY_DISSIPATION: 1.05,
  VELOCITY_DISSIPATION: 0.24,
  PRESSURE: 0.8,
  BLOOM: true,
  BLOOM_INTENSITY: 0.62,
  BLOOM_THRESHOLD: 0.55,
  SUNRAYS: true,
  SUNRAYS_WEIGHT: 0.85,
  COLOR_UPDATE_SPEED: 7,
  PARTICLES: true,
  PARTICLE_COUNT: 16384,
  PARTICLE_SIZE: 1.5,
  PARTICLE_LIFE: 6,
  PARTICLE_SPEED: 0.9,
  PARTICLE_FADE: 0.85,
  PARTICLE_COLORFUL: true,
};

export const CLASSIC_BASE: Partial<FluidConfig> = {
  CURL: 32,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  DENSITY_DISSIPATION: 1,
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE: 0.8,
  BLOOM: true,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,
  SUNRAYS: true,
  SUNRAYS_WEIGHT: 1,
  COLOR_UPDATE_SPEED: 10,
  PARTICLES: true,
  PARTICLE_COUNT: 16384,
  PARTICLE_SIZE: 1.6,
  PARTICLE_LIFE: 5,
  PARTICLE_SPEED: 1.1,
  PARTICLE_FADE: 0.9,
  PARTICLE_COLORFUL: true,
};

const GOLD: [number, number, number] = [0.78, 0.66, 0.42];

/**
 * A family is a colour identity — a hue window, a saturation ceiling, a
 * background and a particle tint — plus optional solver tweaks. Intensities
 * come from `VARIANTS`, so a family is one line, not eight.
 */
export const FAMILIES: FluidFamily[] = [
  /* ------------------------------------------------------------- house */
  { slug: "champagne", name: "Champagne", group: "house", hue: [0.09, 0.13], saturation: 0.55, value: 1, back: [0.03, 0.03, 0.04], particle: GOLD },
  { slug: "old-gold", name: "Old Gold", group: "house", hue: [0.1, 0.14], saturation: 0.68, value: 0.95, back: [0.04, 0.03, 0.02], particle: [0.82, 0.68, 0.38] },
  { slug: "vellum", name: "Vellum", group: "house", hue: [0.09, 0.13], saturation: 0.22, value: 1, back: [0.05, 0.05, 0.05], particle: [0.95, 0.93, 0.89] },
  { slug: "ink-wash", name: "Ink Wash", group: "house", hue: [0.1, 0.13], saturation: 0.45, value: 0.7, back: [0.02, 0.02, 0.03], particle: [0.6, 0.52, 0.34], base: { CURL: 20, DENSITY_DISSIPATION: 1.3, BLOOM_INTENSITY: 0.5 } },
  { slug: "brass", name: "Brass", group: "house", hue: [0.12, 0.15], saturation: 0.6, value: 0.95, back: [0.03, 0.03, 0.03], particle: [0.85, 0.72, 0.45] },
  { slug: "amber", name: "Amber", group: "house", hue: [0.06, 0.1], saturation: 0.85, value: 1, back: [0.04, 0.02, 0.01], particle: [0.9, 0.6, 0.25] },
  { slug: "bronze", name: "Bronze", group: "house", hue: [0.07, 0.1], saturation: 0.7, value: 0.85, back: [0.03, 0.02, 0.02], particle: [0.75, 0.55, 0.35] },
  { slug: "platinum", name: "Platinum", group: "house", hue: [0.55, 0.65], saturation: 0.15, value: 1, back: [0.03, 0.03, 0.035], particle: [0.92, 0.93, 0.95] },
  { slug: "sepia", name: "Sepia", group: "house", hue: [0.07, 0.1], saturation: 0.5, value: 0.75, back: [0.035, 0.03, 0.025], particle: [0.7, 0.58, 0.42], base: { CURL: 18, DENSITY_DISSIPATION: 1.35 } },
  { slug: "ivory-smoke", name: "Ivory Smoke", group: "house", hue: [0.09, 0.14], saturation: 0.25, value: 1, back: [0.04, 0.04, 0.04], particle: [0.9, 0.88, 0.84], base: { CURL: 34, VELOCITY_DISSIPATION: 0.16 } },
  { slug: "copper-leaf", name: "Copper Leaf", group: "house", hue: [0.02, 0.05], saturation: 0.75, value: 0.95, back: [0.03, 0.02, 0.02], particle: [0.85, 0.55, 0.35] },
  { slug: "midnight-gold", name: "Midnight Gold", group: "house", hue: [0.1, 0.14], saturation: 0.8, value: 0.8, back: [0.015, 0.015, 0.02], particle: [0.8, 0.66, 0.4], base: { BLOOM_INTENSITY: 0.9, SUNRAYS_WEIGHT: 1.1 } },

  /* ----------------------------------------------------------- classic */
  { slug: "aurora", name: "Aurora", group: "classic", hue: [0.35, 0.65], saturation: 0.9, value: 1, back: [0, 0, 0], particle: [0.5, 1, 0.8] },
  { slug: "neon", name: "Neon", group: "classic", hue: [0.75, 1.05], saturation: 1, value: 1, back: [0, 0, 0], particle: [1, 0.4, 0.9], base: { BLOOM_INTENSITY: 1.1, CURL: 38 } },
  { slug: "fire", name: "Fire", group: "classic", hue: [0, 0.07], saturation: 1, value: 1, back: [0.02, 0, 0], particle: [1, 0.5, 0.15], base: { DENSITY_DISSIPATION: 0.92, CURL: 30 } },
  { slug: "ice", name: "Ice", group: "classic", hue: [0.5, 0.62], saturation: 0.7, value: 1, back: [0, 0.01, 0.02], particle: [0.7, 0.9, 1], base: { SUNRAYS_WEIGHT: 1.2 } },
  { slug: "toxic", name: "Toxic", group: "classic", hue: [0.22, 0.35], saturation: 1, value: 1, back: [0, 0.01, 0], particle: [0.6, 1, 0.2] },
  { slug: "lava", name: "Lava", group: "classic", hue: [0.97, 1.06], saturation: 1, value: 1, back: [0.02, 0, 0], particle: [1, 0.35, 0.1], base: { DENSITY_DISSIPATION: 0.9, VELOCITY_DISSIPATION: 0.28, CURL: 24 } },
  { slug: "ocean", name: "Ocean", group: "classic", hue: [0.5, 0.6], saturation: 0.95, value: 0.95, back: [0, 0.01, 0.03], particle: [0.35, 0.7, 1] },
  { slug: "ultraviolet", name: "Ultraviolet", group: "classic", hue: [0.72, 0.82], saturation: 1, value: 1, back: [0.01, 0, 0.03], particle: [0.7, 0.4, 1] },
  { slug: "candy", name: "Candy", group: "classic", hue: [0.85, 0.99], saturation: 0.85, value: 1, back: [0.02, 0.01, 0.02], particle: [1, 0.6, 0.8] },
  { slug: "spectrum", name: "Spectrum", group: "classic", hue: [0, 1], saturation: 1, value: 1, back: [0, 0, 0], particle: [1, 1, 1], base: { COLOR_UPDATE_SPEED: 14 } },
  { slug: "ember", name: "Ember", group: "classic", hue: [0.02, 0.09], saturation: 0.9, value: 0.9, back: [0.02, 0.01, 0], particle: [1, 0.65, 0.3], base: { DENSITY_DISSIPATION: 1.2, BLOOM_INTENSITY: 0.7 } },
  { slug: "cyber", name: "Cyber", group: "classic", hue: [0.45, 0.78], saturation: 1, value: 1, back: [0, 0.01, 0.02], particle: [0.3, 0.9, 1], base: { BLOOM_INTENSITY: 1.2, SUNRAYS_WEIGHT: 1.25, CURL: 40 } },
];

export const HOUSE_FAMILIES = FAMILIES.filter(f => f.group === "house");
export const CLASSIC_FAMILIES = FAMILIES.filter(f => f.group === "classic");

export function getFamily(slug: string): FluidFamily | undefined {
  return FAMILIES.find(f => f.slug === slug);
}
