/**
 * A dependency-free argument parser. `flux` is small enough that pulling in a
 * framework would cost more than it saves, and this keeps the package at zero
 * runtime dependencies.
 *
 * Flags may be written `--key value`, `--key=value`, or `--key` (boolean).
 * Everything that is not a flag is a positional, in order.
 */

export function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const positionals = [];
  const flags = {};

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];

    if (!token.startsWith("-")) {
      positionals.push(token);
      continue;
    }

    const body = token.replace(/^--?/, "");
    const eq = body.indexOf("=");
    if (eq >= 0) {
      flags[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }

    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith("-")) {
      flags[body] = next;
      i += 1;
    } else {
      flags[body] = true;
    }
  }

  return { command, positionals, flags };
}

export function stringFlag(flags, name) {
  const value = flags[name];
  if (value === undefined || value === true) return undefined;
  return value;
}

export function boolFlag(flags, name) {
  return flags[name] === true || flags[name] === "true";
}

export function numberFlag(flags, name) {
  const raw = stringFlag(flags, name);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`--${name} needs a number, got "${raw}"`);
  return n;
}

/**
 * Normalise a hex colour to solver space. Accepts `#abc` and `#aabbcc`; throws
 * on anything else rather than silently producing black.
 */
export function colourFlag(raw) {
  const clean = raw.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map(c => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`--color needs a hex value, got "${raw}"`);
  const int = Number.parseInt(full, 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}
