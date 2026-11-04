# Authoring presets

Presets are generated, not written out by hand. That is the whole point: 98 looks
from 24 families and 4 intensities, where adding a family is one line and its four
variants come for free.

## The three layers

**1. A base config.** Two of them — `HOUSE_BASE` and `CLASSIC_BASE` in
`packages/fluid/src/presets/families.ts`. They set the physics: curl, splat radius
and force, dissipation, bloom, sunrays, colour speed, particle defaults. The house
base is calmer and gold-leaning; the classic base is the upstream tuning.

**2. A family.** A colour identity plus optional physics tweaks:

```ts
{
  slug: "champagne",
  name: "Champagne",
  group: "house",
  hue: [0.09, 0.13],       // the solver cannot leave this window
  saturation: 0.55,
  value: 1,
  back: [0.03, 0.03, 0.04],
  particle: [0.78, 0.66, 0.42],
}
```

`hue` is in turns, 0–1. A window may exceed 1 to wrap — `[0.97, 1.06]` is an honest
red band, and the validator knows the difference between that and an inverted typo.
`base` lets a family override individual physics keys without restating the whole
base:

```ts
{ slug: "ink-wash", ..., base: { CURL: 20, DENSITY_DISSIPATION: 1.3 } }
```

**3. A variant.** An intensity, applied as multipliers on top of everything above:

```ts
{ slug: "wild", name: "Wild", curl: 2.8, force: 2.1, density: 0.7,
  bloom: 1.65, sunrays: 1.4, speed: 2.4, particles: 2.6, size: 1.3 }
```

`balanced` is deliberately all-ones: it is the family exactly as designed. The other
three scale away from it.

## Adding a family

One line in `FAMILIES`:

```ts
{ slug: "verdigris", name: "Verdigris", group: "house",
  hue: [0.42, 0.50], saturation: 0.38, value: 0.86,
  back: [0.02, 0.03, 0.03], particle: [0.45, 0.72, 0.62] }
```

Then:

```bash
npm run flux -- list --family verdigris     # 4 new presets
npm run flux -- palette                     # see the window in place
npm run flux -- show verdigris-balanced     # what it resolves to
npm test                                    # catalogue checks still pass
```

`PRESET_COUNT` is derived from the arrays, so nothing else needs updating — not the
studio header, not the README, not the tests. If you hard-code 98 anywhere, that is
a bug.

## Adding a variant

One entry in `VARIANTS`. It appears for every family at once, so the catalogue grows
by 24. That is usually not what you want unless you have thought about it; a family
with a physics `base` override is the better instrument for a one-off.

## Rules the validator enforces

`flux validate` (and CI) checks every preset:

- **Known keys only.** A typo like `SPLAT_FORCE_` is an error, not a silent no-op.
- **Types match the schema.** Numbers are numbers, booleans are booleans.
- **Grid sizes are positive integers.** `DYE_RESOLUTION: 1024.5` is an error.
- **Non-negative numbers.** Negative curl or force is an error.
- **Colour channels are finite numbers.** A `BACK_COLOR` missing `b` is an error.
- **Hue windows are not inverted.** `[0.8, 0.2]` is an error; `[0.97, 1.06]` is fine.
- **Ids are kebab-case and unique.** Duplicate ids are errors, duplicate names are
  warnings.

Warnings are for things that are legal but suspicious — a 5000-particle budget that
is not one of the five tiers, a 512 simulation grid, bloom intensity set on a preset
with bloom off.

## Tuning by eye

The studio is the instrument; the CLI is the notebook.

1. Pick a family in the studio, drag sliders until it looks right.
2. Hit **Save** — it is persisted in `localStorage` under
   `aimirah.fluid.presets.v1`.
3. Copy the config out of devtools, or use `flux diff` to see what you changed
   against the preset you started from.
4. Fold the lasting numbers back into the family definition, not into a one-off
   preset object.

If you only ever change two or three numbers, put them in the family's `base` — the
four variants will all inherit them and stay coherent.
