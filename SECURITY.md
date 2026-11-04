# Security policy

## Supported versions

The `main` branch is the supported version. This is a static site and a local CLI;
there are no deployed services holding data.

## Reporting a vulnerability

Open a [private security advisory](https://github.com/strdst7/4im-flux-studio/security/advisories/new)
rather than a public issue.

Please include the version or commit, a minimal reproduction, and what an attacker
could achieve. Expect an initial response within a few days.

## Scope

In scope:

- XSS or injection through preset names, saved presets in `localStorage`, or the
  image-source loader
- Denial of service through pathological preset configs (for example, a config that
  forces an enormous framebuffer allocation)
- Supply-chain issues in the dependency set

Likely out of scope:

- A WebGL driver crash caused by a valid config — that is a browser bug; report it
  upstream, but do tell us if a config makes it easy to trigger
- Anything requiring the user to paste hostile JavaScript into their own console

## Practises in this repo

- `@4im/fluid` and the CLI have **zero runtime dependencies**. Only the studio pulls
  React and Next.
- Saved presets are parsed defensively and a malformed entry is ignored rather than
  trusted.
- User-supplied images go through `createObjectURL` and are never sent anywhere.
- CodeQL (`security-and-quality`) runs on every push to `main` and weekly.
- Dependabot groups and labels updates; nothing auto-merges.
