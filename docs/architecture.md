# Architecture

Three layers, each usable without the one above it.

```
apps/studio  ──▶  @4im/fluid            (React, UI, capture, localStorage)
packages/cli ──▶  @4im/fluid            (terminal, no DOM)
                  ├── src/core/         generated WebGL factory  ← upstream
                  ├── src/presets/      families, variants, quality
                  ├── src/validate.ts   schema checks
                  └── src/runtime.ts    resolve / diff / CSS vars
```

`@4im/fluid` has zero runtime dependencies. The CLI has zero runtime dependencies
outside the workspace. The studio is the only thing that needs React.

## The core is generated, and stays that way

`packages/fluid/src/core/fluid.core.js` is Pavel Dobryakov's `script.js`, wrapped in
a factory and extended by `build-core.mjs`. The transform is a list of anchored
string edits:

- strip the demo page bootstrap, the dat.gui panel and the analytics call
- turn the module-level `config` into a merged factory argument
- make `generateColor()` respect `COLOR_HUE_MIN/MAX/SATURATION/VALUE`
- keep the quad buffers re-bindable after the particle pass draws
- replace the network-fetched dither texture with a procedural one
- add `simulateParticles`, `drawParticles`, `AUTO_SPLATS`, and the explicit
  `start`/`stop`/`dispose` lifecycle

Every edit is anchored on upstream text and **fails loudly** if the anchor has moved.
That is deliberate: a silent no-op transform would ship a solver with half its
extensions missing, and you would not find out until it looked wrong.

To update upstream:

```bash
# replace the vendored source
cp /path/to/upstream/script.js packages/fluid/src/core/script.js

# regenerate; this prints the line count and exits 1 on a moved anchor
npm run core -w @4im/fluid

# prove the output still builds and behaves
npm run verify
```

Review the diff of `fluid.core.js` like you would review a dependency bump, because
that is what it is.

## Why the preset layer is generated

A hand-written preset list drifts. Someone adds a family's four intensities, forgets
one, and the catalogue has a hole nobody notices until a user picks Subtle on the one
family that lacks it. Generating presets from `families × variants` makes that class
of bug impossible:

```ts
export const PRESETS = [
  ...SIGNATURE_PRESETS,
  ...FAMILIES.flatMap(family => VARIANTS.map(variant => buildPreset(family, variant))),
];
```

`PRESET_COUNT` is `PRESETS.length`. The studio header, the README badge and the
tests all read that number, so it cannot disagree with reality.

## Config resolution

Most bugs in a config-heavy app come from ambiguous precedence. There is exactly one
order, in `resolveConfig`:

```
defaults → preset → quality tier → ad-hoc overrides
```

Quality sits above the preset because picking "Low" must always mean the same frame
budget, whatever look is selected. Overrides are last because the sliders are the
user talking.

`diffFromDefaults` is the inverse: given a config, return only the keys that are not
the schema default. That is what `flux export --target diff` writes, and it is why
an exported preset is 10 lines instead of 40.

## Validation without a browser

`validate.ts` is pure: it never touches WebGL, a canvas, or the DOM. That is what
lets CI run it on every push, and what lets `flux validate` be a real gate rather
than a smoke test. The checks are structural — keys, types, integer grids, hue
windows, particle tiers — because those are the mistakes that actually happen.

## Rendering lifecycle

The solver runs on `requestAnimationFrame` but only when it should:

- `IntersectionObserver` parks it when the canvas scrolls out (`rootMargin: 150px`)
- `visibilitychange` parks it when the tab is hidden
- `ResizeObserver` triggers a re-measure; the frame loop never calls
  `getBoundingClientRect` itself
- `adaptiveQuality` samples two-second windows and drops a quality step after two
  consecutive sub-30fps results, logging each step

The canvas is never resized from the frame loop, which is what keeps a soft fluid
field from costing you a forced layout every 16ms.
