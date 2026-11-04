# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-11-04

The first release as a monorepo. Previously a single Next.js app; now a solver
package, a CLI, and a studio that consumes both.

### Added

- **`@4im/fluid`** — the solver, config schema, preset catalogue and validator,
  extracted into a package with zero runtime dependencies.
- **`@4im/flux-cli`** — the `flux` command with `list`, `show`, `families`,
  `palette`, `diff`, `export`, `validate` and `random`. Stdlib only.
- **Preset generation** — 24 families × 4 intensities, composed rather than written
  out, so a family is one line and cannot ship with a missing variant.
- **`validatePreset` / `validateCatalogue`** — structural checks that run in CI
  without a browser: unknown keys, type mismatches, non-integer grid sizes, inverted
  hue windows, non-standard particle tiers.
- **`resolveConfig`** — one explicit precedence order: defaults → preset → quality
  tier → overrides.
- **`diffFromDefaults`** — export only what a preset changes, not all 40 keys.
- **`presetToCssVars`** — tint surrounding chrome from the same numbers the solver
  uses.
- **55 tests** across preset composition, config resolution, validation and the CLI
  binary, using `node:test` only.
- **CI** on Node 20/22/24: typecheck, tests, preset validation, static export, and a
  job that fails if the generated solver core is stale.
- **CodeQL** (`security-and-quality`) on push, PR and weekly.
- **Tag-triggered releases** that attach the studio as a static archive.

### Changed

- The preset system is now `families.ts` + `variants.ts` + `build.ts` instead of one
  hand-written 346-line array. The catalogue is byte-for-byte the same 98 presets.
- `FLUID_DEFAULTS` is `as const satisfies FluidConfig`, so the schema and the defaults
  cannot drift apart.
- `hexToFluidColor` validates its input and throws instead of silently returning
  black.
- Colours are exported as `#rrggbb` via `fluidColorToHex` with clamping.
- The core generator resolves its paths relative to itself, so `npm run core` works
  from a fresh clone instead of only from the author's machine.
- The studio imports from the workspace package rather than a `@/lib/fluid` path.

### Fixed

- `COLOR_HUE_MAX` above 1 is accepted for wrap-around windows (`0.97–1.06` is a red
  band), while a genuinely inverted window (`0.8 → 0.2`) is reported as an error.
- A colour object missing a channel is reported as `color-channel` rather than
  slipping through the scalar type check.
- Duplicate preset names are a warning rather than an error, because two families may
  legitimately share a word; duplicate ids remain fatal.

### Removed

- `push-github.mjs` — repo scaffolding, not part of the project.
- The `aimirah` naming in file paths; the preset id `aimirah-house` is kept for
  compatibility with saved presets in `localStorage`.

[Unreleased]: https://github.com/strdst7/4im-flux-studio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/strdst7/4im-flux-studio/releases/tag/v1.0.0
