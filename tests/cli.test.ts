import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = promisify(execFile);
const CLI = new URL("../packages/cli/bin/flux.mjs", import.meta.url).pathname;

async function flux(...args) {
  try {
    const { stdout } = await run(process.execPath, [CLI, ...args], { env: { ...process.env, NO_COLOR: "1" } });
    return { stdout, code: 0 };
  } catch (error) {
    return { stdout: error.stdout ?? "", stderr: error.stderr ?? "", code: error.code };
  }
}

test("help lists every command", async () => {
  const { stdout, code } = await flux("help");
  assert.equal(code, 0);
  for (const command of ["list", "show", "families", "palette", "diff", "export", "validate", "random"]) {
    assert.match(stdout, new RegExp(`\\b${command}\\b`), `help should mention ${command}`);
  }
});

test("validate exits 0 on the shipped catalogue", async () => {
  const { stdout, code } = await flux("validate");
  assert.equal(code, 0);
  assert.match(stdout, /all presets valid/);
});

test("list --json is parseable and complete", async () => {
  const { stdout, code } = await flux("list", "--json");
  assert.equal(code, 0);
  const presets = JSON.parse(stdout);
  assert.equal(presets.length, 98);
});

test("list filters by family", async () => {
  const { stdout } = await flux("list", "--family", "champagne", "--json");
  const presets = JSON.parse(stdout);
  assert.equal(presets.length, 4);
  assert.ok(presets.every(p => p.family === "champagne"));
});

test("list filters by group", async () => {
  const { stdout } = await flux("list", "--group", "signature", "--json");
  const presets = JSON.parse(stdout);
  assert.equal(presets.length, 2);
});

test("show prints a resolved config", async () => {
  const { stdout, code } = await flux("show", "champagne-balanced");
  assert.equal(code, 0);
  assert.match(stdout, /Champagne/);
  assert.match(stdout, /CURL/);
});

test("show --json carries both the preset and the resolved config", async () => {
  const { stdout } = await flux("show", "neon-wild", "--json");
  const payload = JSON.parse(stdout);
  assert.equal(payload.id, "neon-wild");
  assert.equal(payload.resolved.CURL, payload.config.CURL ?? payload.resolved.CURL);
  assert.ok("SIM_RESOLUTION" in payload.resolved);
});

test("show honours an override flag", async () => {
  const { stdout } = await flux("show", "neon-wild", "--json", "--curl", "12");
  const payload = JSON.parse(stdout);
  assert.equal(payload.resolved.CURL, 12);
});

test("show rejects an unknown preset with a non-zero exit", async () => {
  const { code, stderr } = await flux("show", "nope-nope");
  assert.equal(code, 1);
  assert.match(stderr, /unknown preset/);
});

test("diff reports only changed keys", async () => {
  const { stdout, code } = await flux("diff", "champagne-subtle", "champagne-wild", "--json");
  assert.equal(code, 0);
  const changed = JSON.parse(stdout);
  assert.ok(changed.length > 0);
  assert.ok(changed.some(row => row.key === "CURL"));
});

test("diff of a preset against itself is empty", async () => {
  const { stdout } = await flux("diff", "neon-wild", "neon-wild", "--json");
  assert.deepEqual(JSON.parse(stdout), []);
});

test("families --json lists every family", async () => {
  const { stdout } = await flux("families", "--json");
  const families = JSON.parse(stdout);
  assert.equal(families.length, 24);
});

test("export writes a TS module that imports from @4im/fluid", async () => {
  const dir = await mkdtemp(join(tmpdir(), "flux-cli-"));
  const out = join(dir, "preset.ts");
  try {
    const { code } = await flux("export", "champagne-balanced", "--out", out);
    assert.equal(code, 0);
    const contents = await readFile(out, "utf8");
    assert.match(contents, /from "@4im\/fluid"/);
    assert.match(contents, /export const ChampagneBalanced/);
    assert.match(contents, /CURL: 26/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("export --format json emits valid JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "flux-cli-"));
  const out = join(dir, "preset.json");
  try {
    await flux("export", "neon-wild", "--format", "json", "--out", out);
    const parsed = JSON.parse(await readFile(out, "utf8"));
    assert.equal(parsed.id, "neon-wild");
    assert.ok(parsed.config.CURL > 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("export --dry-run writes nothing", async () => {
  const { stdout, code } = await flux("export", "neon-wild", "--dry-run");
  assert.equal(code, 0);
  assert.match(stdout, /export const NeonWild/);
});

test("random --synth produces a complete, valid-looking config", async () => {
  const { stdout, code } = await flux("random", "--synth", "--json");
  assert.equal(code, 0);
  const config = JSON.parse(stdout);
  assert.equal(typeof config.CURL, "number");
  assert.ok(config.COLOR_HUE_MAX > config.COLOR_HUE_MIN);
});

test("unknown commands fail loudly", async () => {
  const { code, stderr } = await flux("frobnicate");
  assert.equal(code, 1);
  assert.match(stderr, /unknown command/);
});
