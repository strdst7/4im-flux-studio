/**
 * `flux palette` — the hue windows, as a text gradient.
 *
 * Prints one row per family so you can see at a glance whether the house range
 * is actually gold and where the classics collide.
 */
import { FAMILIES } from "@4im/fluid";
import { boolFlag, stringFlag } from "../args.mjs";
import { bold, dim, gold, table } from "../format.mjs";

const BAR = 40;

function renderWindow(hue, saturation, value, width = BAR) {
  const [from, to] = hue;
  const span = to - from || 0.0001;
  const cells = [];

  for (let i = 0; i < width; i += 1) {
    const t = i / (width - 1);
    const h = (((from + span * t) % 1) + 1) % 1;
    cells.push(h);
  }

  if (!process.stdout.isTTY || process.env.NO_COLOR) {
    return "░".repeat(width);
  }

  return cells
    .map(h => {
      const [r, g, b] = hslToRgb(h * 360, saturation, Math.min(0.5, value * 0.5));
      return `\u001b[48;2;${r};${g};${b}m \u001b[0m`;
    })
    .join("");
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map(n => Math.round((n + m) * 255));
}

export async function palette(_positionals, flags) {
  const group = stringFlag(flags, "group");
  const pool = group ? FAMILIES.filter(f => f.group === group) : FAMILIES;

  if (boolFlag(flags, "json")) {
    console.log(
      JSON.stringify(
        pool.map(f => ({ slug: f.slug, name: f.name, hue: f.hue, saturation: f.saturation })),
        null,
        2
      )
    );
    return 0;
  }

  console.log(table(pool.map(f => [gold(f.slug.padEnd(14)), renderWindow(f.hue, f.saturation, f.value)])));
  console.log("");
  console.log(dim("each row is that family's permitted hue window — the solver cannot leave it"));
  return 0;
}

export const paletteHelp = `${bold("flux palette")} [--group house|classic] [--json]

Draw every family's hue window as a text gradient. Fastest way to check that a
new family sits where you think it does.`;
