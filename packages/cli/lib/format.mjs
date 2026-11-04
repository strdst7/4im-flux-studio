/**
 * Terminal formatting. No colours by default so output stays readable when
 * piped to a file or a CI log; `flux --color` opts in.
 */

const enabled = process.stdout.isTTY && !process.env.NO_COLOR;

const wrap = (open, close) => text => (enabled ? `\u001b[${open}m${text}\u001b[${close}m` : String(text));

export const dim = wrap(2, 22);
export const bold = wrap(1, 22);
export const gold = wrap(33, 39);
export const red = wrap(31, 39);
export const green = wrap(32, 39);
export const yellow = wrap(33, 39);

/** Pad to width, counting only visible characters. */
export function pad(text, width) {
  const visible = String(text).replace(/\u001b\[\d+m/g, "");
  return String(text) + " ".repeat(Math.max(0, width - visible.length));
}

/**
 * A minimal two-column table. No borders — a terminal table that survives
 * narrow windows is worth more than one that looks like a spreadsheet.
 */
export function table(rows, { gap = 3 } = {}) {
  if (rows.length === 0) return "";
  const widths = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      const visible = String(cell).replace(/\u001b\[\d+m/g, "").length;
      widths[i] = Math.max(widths[i] ?? 0, visible);
    });
  }
  return rows
    .map(row =>
      row
        .map((cell, i) => (i === row.length - 1 ? String(cell) : pad(cell, widths[i] + gap)))
        .join("")
        .trimEnd()
    )
    .join("\n");
}
