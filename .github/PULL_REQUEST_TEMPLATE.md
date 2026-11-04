## What this changes

<!-- One paragraph. What is different after this PR, and why. -->

## Layer

- [ ] `@4im/fluid` — solver, schema, presets, validation
- [ ] `@4im/flux-cli` — a command or flag
- [ ] `@4im/studio` — UI, canvas lifecycle, capture
- [ ] Docs / CI / repo plumbing

## Verification

- [ ] `npm run verify` passes locally
- [ ] New behaviour has a test
- [ ] Tested in Chrome and at least one other engine (Safari or Firefox) if this
      touches rendering
- [ ] Checked at both mobile and desktop widths if this touches layout

## If this touches the generated core

- [ ] I changed `build-core.mjs`, not `fluid.core.js`
- [ ] `npm run core -w @4im/fluid` regenerates cleanly
- [ ] The upstream anchor I depend on is described in the commit body

## Notes for the reviewer

<!-- Anything non-obvious: a tradeoff, a thing you tried and rejected, a number you measured. -->
