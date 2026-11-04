import { CONFIG_KEYS, FLUID_DEFAULTS } from "./defaults.ts";
import type { FluidConfig, FluidPreset } from "./types.ts";

export type IssueLevel = "error" | "warn";

export type Issue = {
  level: IssueLevel;
  code: string;
  preset?: string;
  key?: string;
  message: string;
};

/** Keys that must be a positive integer; a float here breaks framebuffer sizing. */
const INTEGER_KEYS = new Set<keyof FluidConfig>([
  "SIM_RESOLUTION",
  "DYE_RESOLUTION",
  "CAPTURE_RESOLUTION",
  "PRESSURE_ITERATIONS",
  "BLOOM_ITERATIONS",
  "BLOOM_RESOLUTION",
  "SUNRAYS_RESOLUTION",
  "PARTICLE_COUNT",
]);

/** Keys expressed in turns; a value outside 0–1 is almost always a typo. */
const TURN_KEYS = new Set<keyof FluidConfig>([
  "COLOR_HUE_MIN",
  "COLOR_HUE_MAX",
  "COLOR_SATURATION",
  "COLOR_VALUE",
]);

/** `COLOR_HUE_MAX` may exceed 1: a window like 0.97–1.06 is a wrap-around red. */
const WRAPPABLE_KEYS = new Set<keyof FluidConfig>(["COLOR_HUE_MAX"]);

const PARTICLE_TIERS = new Set([4096, 8192, 16384, 32768, 65536]);

/**
 * Check a preset against the config schema.
 *
 * Errors mean it will look wrong or crash; warnings mean it is legal but
 * suspicious. Nothing here touches WebGL, so it runs in CI and in the CLI.
 */
export function validatePreset(preset: FluidPreset): Issue[] {
  const issues: Issue[] = [];
  const { id, name, config } = preset;

  if (!id) {
    issues.push({ level: "error", code: "id-missing", preset: id, message: "preset has no id" });
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    issues.push({
      level: "error",
      code: "id-format",
      preset: id,
      message: `id "${id}" is not kebab-case`,
    });
  }

  if (!name) {
    issues.push({ level: "error", code: "name-missing", preset: id, message: "preset has no name" });
  }

  for (const key of Object.keys(config) as (keyof FluidConfig)[]) {
    if (!CONFIG_KEYS.includes(key)) {
      issues.push({
        level: "error",
        code: "unknown-key",
        preset: id,
        key,
        message: `"${key}" is not a solver config key`,
      });
      continue;
    }

    const value = config[key] as unknown;
    const fallback = FLUID_DEFAULTS[key];

    /* colours are objects; check their shape before the scalar path */
    if (typeof fallback === "object" && fallback !== null) {
      if (typeof value !== "object" || value === null) {
        issues.push({
          level: "error",
          code: "type-mismatch",
          preset: id,
          key,
          message: `${key} should be a colour object, got ${typeof value}`,
        });
        continue;
      }

      const channels = value as Record<string, unknown>;
      for (const channel of ["r", "g", "b"]) {
        if (typeof channels[channel] !== "number" || !Number.isFinite(channels[channel])) {
          issues.push({
            level: "error",
            code: "color-channel",
            preset: id,
            key,
            message: `${key}.${channel} must be a finite number`,
          });
        }
      }
      continue;
    }

    if (typeof value === typeof fallback) {
      if (typeof value === "number") {
        if (!Number.isFinite(value)) {
          issues.push({
            level: "error",
            code: "not-finite",
            preset: id,
            key,
            message: `${key} is ${value}`,
          });
        } else if (value < 0) {
          issues.push({
            level: "error",
            code: "negative",
            preset: id,
            key,
            message: `${key} is negative (${value})`,
          });
        } else if (INTEGER_KEYS.has(key) && !Number.isInteger(value)) {
          issues.push({
            level: "error",
            code: "not-integer",
            preset: id,
            key,
            message: `${key} must be an integer, got ${value}`,
          });
        } else if (
          TURN_KEYS.has(key) &&
          (value < 0 || value > 1) &&
          !(WRAPPABLE_KEYS.has(key) && value <= 1.25)
        ) {
          issues.push({
            level: "warn",
            code: "out-of-range",
            preset: id,
            key,
            message: `${key} is ${value}, outside 0–1`,
          });
        }
      }
      continue;
    }

    issues.push({
      level: "error",
      code: "type-mismatch",
      preset: id,
      key,
      message: `${key} should be ${typeof fallback}, got ${typeof value}`,
    });
  }

  if (config.SIM_RESOLUTION != null && config.SIM_RESOLUTION > 512) {
    issues.push({
      level: "warn",
      code: "sim-too-high",
      preset: id,
      key: "SIM_RESOLUTION",
      message: "simulation grid above 512 costs more than it shows",
    });
  }

  if (config.PARTICLE_COUNT != null && !PARTICLE_TIERS.has(config.PARTICLE_COUNT)) {
    issues.push({
      level: "warn",
      code: "particle-tier",
      preset: id,
      key: "PARTICLE_COUNT",
      message: `${config.PARTICLE_COUNT} is not a standard tier (4k/8k/16k/32k/64k)`,
    });
  }

  if (
    config.PARTICLES === true &&
    config.PARTICLE_COUNT != null &&
    config.PARTICLE_COUNT < 2048
  ) {
    issues.push({
      level: "warn",
      code: "few-particles",
      preset: id,
      key: "PARTICLE_COUNT",
      message: "particles enabled with fewer than 2048 points",
    });
  }

  if (config.COLOR_HUE_MIN != null && config.COLOR_HUE_MAX != null) {
    const min = config.COLOR_HUE_MIN;
    const max = config.COLOR_HUE_MAX;
    /* a window may wrap past 1 (reds do); anything else inverted is a typo */
    if (max < min && max <= 1) {
      issues.push({
        level: "error",
        code: "hue-inverted",
        preset: id,
        key: "COLOR_HUE_MAX",
        message: `hue window ${min}–${max} is inverted (wrap-around needs a max above 1)`,
      });
    }
  }

  if (config.BLOOM === false && config.BLOOM_INTENSITY != null && config.BLOOM_INTENSITY > 0) {
    issues.push({
      level: "warn",
      code: "bloom-off",
      preset: id,
      key: "BLOOM_INTENSITY",
      message: "bloom intensity set while bloom is disabled",
    });
  }

  return issues;
}

/** Cross-preset checks: duplicate ids and names break the studio's pickers. */
export function validateCatalogue(presets: FluidPreset[]): Issue[] {
  const issues: Issue[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const preset of presets) {
    if (seenIds.has(preset.id)) {
      issues.push({
        level: "error",
        code: "duplicate-id",
        preset: preset.id,
        message: `more than one preset uses the id "${preset.id}"`,
      });
    }
    seenIds.add(preset.id);

    if (seenNames.has(preset.name)) {
      issues.push({
        level: "warn",
        code: "duplicate-name",
        preset: preset.id,
        message: `duplicate preset name "${preset.name}"`,
      });
    }
    seenNames.add(preset.name);

    issues.push(...validatePreset(preset));
  }

  return issues;
}

export function errorsOnly(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === "error");
}
