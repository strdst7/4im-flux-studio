# CLI reference

```
npm run flux -- <command> [args]
```

Or install it globally and drop the `--`:

```bash
npm link -w @4im/flux-cli
flux list
```

Every command accepts `--json` for machine-readable output and exits non-zero on
failure, so `flux validate` works as a CI gate and the rest work in scripts.

---

## `flux list`

Print the catalogue.

```bash
flux list                        # all 98
flux list --group house          # the 12 house families, 48 presets
flux list --family champagne     # one family, 4 intensities
flux list --json | jq length     # 98
```

| Flag | Meaning |
| --- | --- |
| `--group <house\|classic\|signature>` | Filter by group |
| `--family <slug>` | Filter by family slug |
| `--json` | Emit the raw preset objects |

## `flux show`

One preset, resolved over the defaults. Values identical to the schema default are
dimmed, so what you see bright is what the preset actually does.

```bash
flux show champagne-balanced
flux show neon-wild --quality ultra
flux show neon-wild --curl 12 --no-bloom     # preview an edit
```

| Flag | Meaning |
| --- | --- |
| `--quality <low\|medium\|high\|ultra>` | Overlay a quality tier |
| `--curl <n>` | Override `CURL` |
| `--force <n>` | Override `SPLAT_FORCE` |
| `--dissipation <n>` | Override `DENSITY_DISSIPATION` |
| `--color <hex>` | Override `PARTICLE_COLOR` |
| `--bloom` / `--no-bloom` | Override `BLOOM` |
| `--particles` / `--no-particles` | Override `PARTICLES` |
| `--json` | Preset plus the resolved config |

## `flux families`

The palette table — slug, name, group, hue window, saturation ceiling, preset count.

```bash
flux families
flux families --group classic --json
```

A **family** is a colour identity. Its four presets are generated from it, which is
why this list is 24 rows and not 96.

## `flux palette`

The same hue windows drawn as terminal gradients. The fastest way to see whether a
new family sits where you intended, and where two families overlap.

```bash
flux palette
flux palette --group house
```

## `flux diff`

Two presets, both resolved, only the keys that differ.

```bash
flux diff champagne-subtle champagne-wild
flux diff neon-balanced cyber-balanced --json
```

Useful when tuning a new family against its neighbours — it shows you the two or
three numbers that actually changed rather than 40 rows of context.

## `flux export`

Write a preset as a standalone module.

```bash
flux export neon-wild                              # neon-wild.ts, diff only
flux export neon-wild --target full --format json   # everything, as JSON
flux export neon-wild --dry-run                     # print, write nothing
```

| Flag | Meaning |
| --- | --- |
| `--format <ts\|json>` | Output format (default `ts`) |
| `--target <diff\|full>` | Only changed keys, or every key merged over the defaults |
| `--out <path>` | Where to write (default `<id>.<format>`) |
| `--dry-run` | Print to stdout |

`--target diff` is what you want when adding a preset back to the repo.
`--target full` is what you want when copying a look into a project that does not
import `@4im/fluid`.

## `flux validate`

Schema-check every preset: known keys, right types, integer grid sizes, sane hue
windows, standard particle tiers. No WebGL, no browser.

```bash
flux validate
flux validate --json
```

Errors exit 1. Warnings — a non-standard particle tier, an inverted-but-legal hue
window, bloom intensity on a preset with bloom off — do not, because they are
sometimes intentional.

## `flux random`

Pick a look at random, or invent one.

```bash
flux random                       # one of the 98
flux random --group classic       # one of the 48 classics
flux random --synth --ts          # a brand-new config, as a module
```

`--synth` builds a config that has never existed: a random hue window, curl, splat
force, dissipation, bloom, sunrays, particle tier and colours, all inside the
schema's valid ranges. Pipe it through `flux export` to turn a happy accident into a
preset.
