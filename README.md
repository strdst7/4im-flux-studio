# 4IM/Flux — a real-time GPU fluid playground

<p align="center">
  <img src="docs/banner.svg" alt="4IM/Flux" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/strdst7/4im-flux-studio/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/strdst7/4im-flux-studio/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/strdst7/4im-flux-studio/actions/workflows/codeql.yml"><img alt="CodeQL" src="https://github.com/strdst7/4im-flux-studio/actions/workflows/codeql.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-c8a96a.svg" /></a>
  <img alt="Node" src="https://img.shields.io/badge/node-%E2%89%A522.18-c8a96a" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-55%20passing-c8a96a" />
  <img alt="Presets" src="https://img.shields.io/badge/presets-98-c8a96a" />
  <img alt="Dependencies" src="https://img.shields.io/badge/runtime%20deps-0-c8a96a" />
</p>

<p align="center">
  <a href="https://4im-flux.vercel.app"><b>Live studio →</b></a>
</p>

A React + TypeScript port of [Pavel Dobryakov's WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
(MIT), rebuilt as a monorepo: a typed solver package, a preset CLI, and a browser
studio. The solver is faithful to upstream — advection, vorticity confinement,
divergence, Jacobi pressure projection, dye and velocity fields on renderable float
textures. It is not a domain-warp fake.

On top of upstream: a GPGPU particle layer, 98 presets across 24 palette families,
a save-your-own preset system, image sources, still and video capture, four quality
tiers, and a CLI that validates and exports every look without opening a browser.

---

## Quick start

```bash
git clone https://github.com/strdst7/4im-flux-studio.git
cd 4im-flux-studio
npm install

npm run dev      # studio at http://localhost:3000
npm test         # 55 tests, no browser needed
npm run flux     # the preset CLI
```

Requires Node ≥ 22.18 (the tests run as TypeScript via native type stripping). No runtime dependencies outside React and Next — the CLI
is stdlib-only.

## What is in the box

| Package | What it does |
| --- | --- |
| [`@4im/fluid`](packages/fluid) | The solver, the typed config schema, the preset catalogue, and a validator. Zero runtime dependencies. |
| [`@4im/flux-cli`](packages/cli) | The `flux` command: list, show, diff, validate and export presets. |
| [`@4im/studio`](apps/studio) | The browser studio — one route, one canvas, every control exposed. |

## The preset system

A **family** is a colour identity: a hue window the solver cannot leave, a
saturation ceiling, a background and a particle tint.

```ts
{ slug: "champagne", name: "Champagne", group: "house",
  hue: [0.09, 0.13], saturation: 0.55, value: 1,
  back: [0.03, 0.03, 0.04], particle: [0.78, 0.66, 0.42] }
```

A **variant** is an intensity, applied as multipliers over the family's base config:
curl, splat force, dissipation, bloom, sunrays, colour speed, particle budget and
size.

```ts
{ slug: "wild", name: "Wild", curl: 2.8, force: 2.1, density: 0.7,
  bloom: 1.65, sunrays: 1.4, speed: 2.4, particles: 2.6, size: 1.3 }
```

**24 families × 4 intensities + 2 signatures = 98 presets**, generated, not
hand-written. Adding a family is one line; its four intensities come for free and
`flux validate` proves it is well-formed.

```bash
npm run flux -- list --family champagne
npm run flux -- show champagne-wild --quality ultra
npm run flux -- export neon-wild --target full --out my-neon.ts
```

## Using the component in your own app

`FluxCanvas` is self-contained — drop it in and drive it through the ref.

```tsx
"use client";
import { useRef } from "react";
import FluxCanvas, { type FluxCanvasHandle } from "@/components/flux/FluxCanvas";

export default function Backdrop() {
  const flux = useRef<FluxCanvasHandle>(null);

  return (
    <div className="relative h-[26rem] w-full">
      <FluxCanvas
        ref={flux}
        config={{ DENSITY_DISSIPATION: 0.92, PARTICLE_COUNT: 4096, AUTO_SPLATS: 2 }}
        adaptiveQuality
      />
      <button onClick={() => flux.current?.randomSplats(14)}>Splat</button>
    </div>
  );
}
```

Props: `config` (applied once on mount), `className`, `interactive`, `backgroundImage`
(forces the canvas transparent and sits the image behind it), `pauseWhenOffscreen`
(default `true`), `adaptiveQuality` (default `false`), `onReady`.

Handle: `sim()`, `setConfig()`, `randomSplats()`, `clear()`, `imageSplats()`,
`screenshot()`, `screenshotDataURL()`, `startRecording()`, `stopRecording()`,
`isRecording()`, `info()`.

## Performance

- **Nothing renders offscreen.** The solver parks via `IntersectionObserver` and
  on `visibilitychange`.
- **High-DPI is clamped.** `MAX_PIXEL_RATIO` caps the drawing buffer — a soft fluid
  field does not need 2×.
- **No forced layout per frame.** The core re-measures only when the
  `ResizeObserver` reports a change.
- **Adaptive quality.** With `adaptiveQuality`, two consecutive slow two-second
  windows below 30fps drop internal quality in two steps. Each step is logged.

## Repository layout

```
packages/fluid/
  src/core/          upstream script.js + the transform that generates the factory
  src/presets/       families, variants, builder, signatures, quality tiers
  src/validate.ts    schema checks — what `flux validate` and CI run
  src/runtime.ts     resolve / diff / CSS-variable helpers
packages/cli/
  bin/flux.mjs       the executable
  lib/commands/      one module per command
apps/studio/
  src/components/flux/
  src/app/           the single studio route
tests/               55 tests, node:test, no browser
docs/                CLI reference, preset authoring, architecture
```

**Never hand-edit `src/core/fluid.core.js`.** It is generated. To pick up upstream
changes, replace `src/core/script.js` and run `npm run core -w @4im/fluid`; the
transform re-applies every local extension and fails loudly if an anchor moved.

## Docs

- [CLI reference](docs/cli.md) — every command and flag
- [Authoring presets](docs/presets.md) — add a family, add an intensity
- [Architecture](docs/architecture.md) — how the layers fit together

## Provenance

The solver is Pavel Dobryakov's WebGL-Fluid-Simulation, MIT, © 2017. The upstream
licence is at `packages/fluid/src/core/LICENSE` and preserved in the generated
header. Upstream ships no particle system, no preset system and no image UI — those
were written here, in the transform's appended API block.

## License

[MIT](LICENSE) © 2026 Nur Amirah Mohd Kamil. Upstream solver MIT © 2017 Pavel Dobryakov.
