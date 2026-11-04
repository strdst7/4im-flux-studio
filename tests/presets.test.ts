import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CLASSIC_FAMILIES,
  HOUSE_FAMILIES,
  FAMILIES,
  PRESETS,
  PRESET_COUNT,
  QUALITY_LEVELS,
  VARIANTS,
  buildPreset,
  getPreset,
  hasPreset,
  pickParticleCount,
  presetsForFamily,
  searchPresets,
} from "../packages/fluid/src/index.ts";

test("catalogue size matches families × variants plus signatures", () => {
  assert.equal(PRESET_COUNT, 98);
  assert.equal(PRESETS.length, FAMILIES.length * VARIANTS.length + 2);
});

test("every preset id is unique", () => {
  const ids = PRESETS.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("family and group counts are what the README claims", () => {
  assert.equal(HOUSE_FAMILIES.length, 12);
  assert.equal(CLASSIC_FAMILIES.length, 12);
  assert.equal(QUALITY_LEVELS.length, 4);
});

test("every family has exactly one preset per variant", () => {
  for (const family of FAMILIES) {
    const own = presetsForFamily(family.slug);
    assert.equal(own.length, VARIANTS.length, `${family.slug} preset count`);
    assert.deepEqual(
      own.map(p => p.variant).sort(),
      VARIANTS.map(v => v.slug).sort(),
      `${family.slug} variants`
    );
  }
});

test("getPreset falls back rather than returning undefined", () => {
  assert.equal(getPreset("does-not-exist").id, PRESETS[0].id);
  assert.equal(hasPreset("does-not-exist"), false);
});

test("searchPresets is case-insensitive and searches ids too", () => {
  assert.ok(searchPresets("champagne").length === 4);
  assert.ok(searchPresets("CHAMPAGNE").length === 4);
  assert.ok(searchPresets("neon-wild").length >= 1);
  assert.equal(searchPresets("").length, PRESET_COUNT);
  assert.equal(searchPresets("zzzznope").length, 0);
});

test("buildPreset is pure — same inputs, same output", () => {
  const family = FAMILIES[0];
  const variant = VARIANTS[0];
  assert.deepEqual(buildPreset(family, variant), buildPreset(family, variant));
});

test("balanced variants reproduce the family base exactly", () => {
  const family = HOUSE_FAMILIES[0];
  const balanced = buildPreset(family, VARIANTS[1]);
  const subtle = buildPreset(family, VARIANTS[0]);

  /* balanced multipliers are all 1, so curl must match the house base */
  assert.equal(balanced.config.CURL, 26);
  assert.notEqual(subtle.config.CURL, balanced.config.CURL);
});

test("variant intensity is monotonic in curl", () => {
  const family = CLASSIC_FAMILIES[0];
  const curls = VARIANTS.map(v => buildPreset(family, v).config.CURL);
  for (let i = 1; i < curls.length; i += 1) {
    assert.ok(curls[i] > curls[i - 1], `curl should rise at variant ${VARIANTS[i].slug}`);
  }
});

test("pickParticleCount always returns a supported tier", () => {
  const tiers = [4096, 8192, 16384, 32768, 65536];
  for (let mult = 0.1; mult <= 3; mult += 0.1) {
    assert.ok(tiers.includes(pickParticleCount(16384, mult)), `multiplier ${mult}`);
  }
});

test("every built preset carries a complete colour identity", () => {
  for (const preset of PRESETS) {
    const { config } = preset;
    assert.equal(typeof config.COLOR_HUE_MIN, "number", `${preset.id} hue min`);
    assert.equal(typeof config.COLOR_HUE_MAX, "number", `${preset.id} hue max`);
    assert.ok(config.BACK_COLOR && "r" in config.BACK_COLOR, `${preset.id} back colour`);
  }
});
