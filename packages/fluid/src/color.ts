import type { FluidColor } from "./types.ts";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** `#abc` or `#aabbcc` → solver-space colour. Throws on anything else. */
export function hexToFluidColor(hex: string): FluidColor {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map(c => c + c)
          .join("")
      : clean;

  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`not a hex colour: ${hex}`);
  }

  const int = Number.parseInt(full, 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

/** Solver-space colour → `#rrggbb`, clamped. */
export function fluidColorToHex(color: FluidColor): string {
  const to = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(color.r)}${to(color.g)}${to(color.b)}`;
}

/**
 * Wrap-safe test for a hue window: `[0.97, 1.06]` is a valid red band even
 * though the maximum is past 1.
 */
export function hueWindowTurns([min, max]: [number, number]): number {
  return max >= min ? max - min : 1 - min + max;
}
