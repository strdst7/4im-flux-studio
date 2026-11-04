/**
 * `flux families` — the family table, with a terminal swatch per palette.
 */
import { FAMILIES, VARIANTS, presetsForFamily } from "@4im/fluid";
import { boolFlag, stringFlag } from "../args.mjs";
import { bold, dim, gold, table } from "../format.mjs";

/** 24-bit colour is near-universal; fall back to plain text when piped. */
function swatch([h, s, v]) {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return "    ";
  const hue = (((h[0] + h[1]) / 2) % 1) * 360;
  const r = hslToRgb(hue, s, Math.min(0.56, v * 0.56));
  return `\u001b[48;2;${r[0]};${r[1]};${r[2]}m    \u001b[0m`;
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

export async function families(_positionals, flags) {
  const group = stringFlag(flags, "group");
  const pool = group ? FAMILIES.filter(f => f.group === group) : FAMILIES;

  if (boolFlag(flags, "json")) {
    console.log(JSON.stringify(pool, null, 2));
    return 0;
  }

  const rows = pool.map(f => [
    swatch(f.hue),
    gold(f.slug),
    f.name,
    dim(f.group),
    dim(`hue ${f.hue[0].toFixed(2)}–${f.hue[1].toFixed(2)}`),
    dim(`sat ${f.saturation.toFixed(2)}`),
    dim(`${presetsForFamily(f.slug).length} presets`),
  ]);

  console.log(table(rows));
  console.log("");
  console.log(
    dim(`${pool.length} families × ${VARIANTS.length} intensities = ${pool.length * VARIANTS.length} presets`)
  );
  return 0;
}

export const familiesHelp = `${bold("flux families")} [--group house|classic] [--json]

List every palette family with its hue window and saturation ceiling. A family
is a colour identity; the four intensities in \`flux list\` are generated from it.`;
