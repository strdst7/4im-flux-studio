import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PRESETS,
  errorsOnly,
  validateCatalogue,
  validatePreset,
} from "../packages/fluid/src/index.ts";
import type { FluidPreset } from "../packages/fluid/src/types.ts";

const shell = (config: FluidPreset["config"]): FluidPreset => ({
  id: "test-preset",
  name: "Test",
  group: "signature",
  family: "test",
  variant: "test",
  config,
});

test("the shipped catalogue is valid", () => {
  const issues = validateCatalogue(PRESETS);
  assert.deepEqual(errorsOnly(issues), [], "shipped presets must have no errors");
});

test("the shipped catalogue has no warnings either", () => {
  const issues = validateCatalogue(PRESETS);
  assert.deepEqual(issues, []);
});

test("unknown config keys are errors", () => {
  const issues = validatePreset(shell({ NOT_A_KEY: 1 } as never));
  assert.ok(issues.some(i => i.code === "unknown-key" && i.level === "error"));
});

test("wrong types are errors", () => {
  const issues = validatePreset(shell({ CURL: "fast" } as never));
  assert.ok(issues.some(i => i.code === "type-mismatch"));
});

test("non-integer grid sizes are errors", () => {
  const issues = validatePreset(shell({ SIM_RESOLUTION: 128.5 }));
  assert.ok(issues.some(i => i.code === "not-integer" && i.key === "SIM_RESOLUTION"));
});

test("negative and non-finite numbers are errors", () => {
  assert.ok(validatePreset(shell({ CURL: -1 })).some(i => i.code === "negative"));
  assert.ok(validatePreset(shell({ CURL: Number.NaN })).some(i => i.code === "not-finite"));
  assert.ok(
    validatePreset(shell({ CURL: Number.POSITIVE_INFINITY })).some(i => i.code === "not-finite")
  );
});

test("non-kebab-case ids are errors", () => {
  const issues = validatePreset({ ...shell({}), id: "Not Kebab" });
  assert.ok(issues.some(i => i.code === "id-format"));
});

test("a colour missing a channel is an error", () => {
  const issues = validatePreset(shell({ BACK_COLOR: { r: 0, g: 0 } } as never));
  assert.ok(issues.some(i => i.code === "color-channel"));
});

test("wrap-around hue windows are accepted", () => {
  const issues = validatePreset(shell({ COLOR_HUE_MIN: 0.97, COLOR_HUE_MAX: 1.06 }));
  assert.deepEqual(errorsOnly(issues), []);
});

test("wildly out-of-range hue is only a warning", () => {
  const issues = validatePreset(shell({ COLOR_HUE_MIN: 0, COLOR_HUE_MAX: 4 }));
  assert.equal(errorsOnly(issues).length, 0);
  assert.ok(issues.some(i => i.code === "out-of-range"));
});

test("an inverted hue window is an error", () => {
  const issues = validatePreset(shell({ COLOR_HUE_MIN: 0.8, COLOR_HUE_MAX: 0.2 }));
  assert.ok(issues.some(i => i.code === "hue-inverted"));
});

test("non-standard particle tiers warn but do not fail", () => {
  const issues = validatePreset(shell({ PARTICLE_COUNT: 5000 }));
  assert.equal(errorsOnly(issues).length, 0);
  assert.ok(issues.some(i => i.code === "particle-tier"));
});

test("duplicate ids are a catalogue-level error", () => {
  const preset = PRESETS[0];
  const issues = validateCatalogue([preset, preset]);
  assert.ok(issues.some(i => i.code === "duplicate-id"));
});

test("duplicate names are only a warning", () => {
  const [a, b] = PRESETS;
  const twin = { ...b, name: a.name, id: "different-id" };
  const issues = validateCatalogue([a, twin]);
  const dupes = issues.filter(i => i.code === "duplicate-name");
  assert.equal(dupes.length, 1);
  assert.equal(dupes[0].level, "warn");
});

test("issue codes are stable identifiers, not prose", () => {
  const issues = validateCatalogue(PRESETS);
  for (const issue of issues) {
    assert.match(issue.code, /^[a-z][a-z-]*$/);
  }
});
