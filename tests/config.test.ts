import { test } from "node:test";
import assert from "node:assert/strict";

import { BOOLEAN_KEYS, COLOR_KEYS, CONFIG_KEYS, FLUID_DEFAULTS } from "../packages/fluid/src/defaults.ts";
import { fluidColorToHex, hexToFluidColor, hueWindowTurns } from "../packages/fluid/src/color.ts";
import { diffFromDefaults, presetToCssVars, resolveConfig } from "../packages/fluid/src/runtime.ts";
import { getPreset } from "../packages/fluid/src/presets/index.ts";
import type { FluidConfig } from "../packages/fluid/src/types.ts";

test("config keys are derived, not hand-listed", () => {
  assert.equal(CONFIG_KEYS.length, Object.keys(FLUID_DEFAULTS).length);
  assert.ok(CONFIG_KEYS.includes("SIM_RESOLUTION"));
  assert.ok(CONFIG_KEYS.includes("AUTO_SPLATS"));
});

test("boolean and colour keys partition correctly", () => {
  assert.ok(BOOLEAN_KEYS.includes("BLOOM"));
  assert.ok(!BOOLEAN_KEYS.includes("CURL"));
  assert.deepEqual(COLOR_KEYS.sort(), ["BACK_COLOR", "PARTICLE_COLOR"]);
});

test("hex round-trips through solver space", () => {
  assert.deepEqual(hexToFluidColor("#000000"), { r: 0, g: 0, b: 0 });
  assert.deepEqual(hexToFluidColor("#ffffff"), { r: 1, g: 1, b: 1 });
  assert.equal(fluidColorToHex(hexToFluidColor("#c8a96a")), "#c8a96a");
});

test("short hex expands", () => {
  assert.deepEqual(hexToFluidColor("#fff"), hexToFluidColor("#ffffff"));
});

test("malformed hex is rejected, not silently black", () => {
  assert.throws(() => hexToFluidColor("nope"), /not a hex colour/);
  assert.throws(() => hexToFluidColor("#12345"), /not a hex colour/);
});

test("solver colours clamp on the way out", () => {
  assert.equal(fluidColorToHex({ r: -1, g: 2, b: 0.5 }), "#00ff80");
});

test("hue windows handle wrap-around", () => {
  assert.equal(hueWindowTurns([0.1, 0.2]).toFixed(2), "0.10");
  /* 0.97 → 1.06 is a legitimate red band */
  assert.ok(hueWindowTurns([0.97, 1.06]) > 0);
});

test("resolveConfig layers defaults, preset, quality and overrides in order", () => {
  const base = resolveConfig();
  assert.deepEqual(base, FLUID_DEFAULTS);

  const preset = resolveConfig({ preset: "champagne-balanced" });
  assert.equal(preset.CURL, 26);

  const low = resolveConfig({ preset: "champagne-balanced", quality: "low" });
  assert.equal(low.DYE_RESOLUTION, 256);
  assert.equal(low.BLOOM, false);

  /* an override beats both layers */
  const overridden = resolveConfig({
    preset: "champagne-balanced",
    quality: "low",
    overrides: { BLOOM: true, CURL: 999 },
  });
  assert.equal(overridden.BLOOM, true);
  assert.equal(overridden.CURL, 999);
});

test("resolveConfig returns a complete config", () => {
  const config = resolveConfig({ preset: "neon-wild" }) as FluidConfig;
  for (const key of CONFIG_KEYS) {
    assert.notEqual(config[key], undefined, `${key} is unresolved`);
  }
});

test("diffFromDefaults drops anything that matches the schema", () => {
  const diff = diffFromDefaults({ ...FLUID_DEFAULTS, CURL: 42 });
  assert.deepEqual(diff, { CURL: 42 });
});

test("diffFromDefaults keeps a changed colour and drops an unchanged one", () => {
  const diff = diffFromDefaults({
    BACK_COLOR: { r: 0.5, g: 0, b: 0 },
    PARTICLE_COLOR: FLUID_DEFAULTS.PARTICLE_COLOR,
  });
  assert.deepEqual(Object.keys(diff), ["BACK_COLOR"]);
});

test("presetToCssVars emits usable custom properties", () => {
  const vars = presetToCssVars(getPreset("champagne-balanced"));
  assert.ok(vars["--preset-accent"].startsWith("hsl("));
  assert.ok(vars["--preset-back"].startsWith("rgb("));
  for (const [key, value] of Object.entries(vars)) {
    assert.match(key, /^--preset-/, `${key} should be a custom property`);
    assert.equal(typeof value, "string");
  }
});
