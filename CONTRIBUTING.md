# Contributing

Short version: run `npm run verify` before you push. It builds the solver package,
typechecks everything and runs the 55 tests. CI runs the same thing plus a static
export of the studio.

## Setup

```bash
git clone https://github.com/strdst7/4im-flux-studio.git
cd 4im-flux-studio
npm install
npm run dev      # studio on :3000
npm test         # node:test, no browser required
```

Node ≥ 22.18 — the tests run as TypeScript directly, no build step. There is no linter to install and nothing to configure.

## Where things live

| Path | What belongs there |
| --- | --- |
| `packages/fluid/src/core/` | **Generated.** Never edit by hand — see below. |
| `packages/fluid/src/presets/` | Families, variants, quality tiers. Presets are generated. |
| `packages/fluid/src/validate.ts` | Schema checks. Pure — no DOM, no WebGL. |
| `packages/cli/lib/commands/` | One module per `flux` command. |
| `apps/studio/` | React, canvas lifecycle, controls, capture. |
| `tests/` | `node:test` only. No mocking library, no browser runner. |

## The one rule that surprises people

`packages/fluid/src/core/fluid.core.js` is **generated** from `script.js` by
`build-core.mjs`. Editing it directly means your change silently disappears the next
time anyone regenerates it — and CI will fail with "core is out of date".

Instead, change the transform in `build-core.mjs` and regenerate:

```bash
npm run core -w @4im/fluid
```

The transform fails loudly if an anchor it depends on has moved. If you see
`TRANSFORM FAILED`, the upstream source changed in a way the transform does not
expect — read that anchor, do not delete the check.

## Adding a preset

A family is one line and gets four intensities automatically. Read
[docs/presets.md](docs/presets.md) first; it is short and it will save you from
restating eight presets by hand.

```bash
npm run flux -- list --family your-new-family
npm test
```

## Tests

- Test behaviour, not implementation. `presets.test.ts` asserts that curl rises
  across intensities, not that `buildPreset` calls a specific helper.
- The catalogue tests must stay strict: `PRESET_COUNT`, unique ids, complete colour
  identities. They are the guard against a family shipping half-built.
- CLI tests run the real binary in a subprocess and parse its real output. Do not
  replace them with imports — the point is that the executable works.
- New validation rules need a test for the error *and* a test proving the shipped
  catalogue still passes it.

## Commits

Conventional-ish, one topic per commit, imperative mood:

```
presets: add verdigris family
cli: teach `flux diff` to compare resolved configs
studio: park the solver when the tab is hidden
```

If a commit changes `fluid.core.js`, say why in the body and mention the upstream
anchor you touched.

## Pull requests

- Keep the diff reviewable. A preset family plus its tests is a good PR; a preset
  family plus a refactor of the solver is two.
- `npm run verify` must pass.
- Screenshots help for anything that changes the studio's look. Record a short clip
  if it changes motion.
- If you change `APP.md`-level behaviour — the CLI surface, the config schema — say
  so explicitly in the description. Those are the things people depend on.

## Reporting bugs

Include the browser and GPU if it is a rendering issue (`chrome://gpu`), the Node
version if it is CLI, and the preset id if it is a look. `flux show <id> --json` is
the fastest way to attach the exact config you were looking at.

## License

By contributing you agree your work is licensed under the MIT terms in
[LICENSE](LICENSE). The solver core remains MIT © 2017 Pavel Dobryakov.
