/**
 * `flux validate` — schema and catalogue checks, no WebGL required.
 */
import { PRESETS, errorsOnly, validateCatalogue } from "@4im/fluid";
import { boolFlag } from "../args.mjs";
import { bold, dim, green, gold, red, table, yellow } from "../format.mjs";

export async function validate(_positionals, flags) {
  const issues = validateCatalogue(PRESETS);
  const errors = errorsOnly(issues);
  const warnings = issues.filter(i => i.level === "warn");

  if (boolFlag(flags, "json")) {
    console.log(JSON.stringify({ ok: errors.length === 0, errors, warnings }, null, 2));
    return errors.length === 0 ? 0 : 1;
  }

  if (issues.length > 0) {
    console.log(
      table(
        issues.map(issue => [
          issue.level === "error" ? red("error") : yellow("warn"),
          gold(issue.preset ?? "-"),
          dim(issue.key ?? "-"),
          issue.message,
        ])
      )
    );
    console.log("");
  }

  if (errors.length > 0) {
    console.log(red(`${errors.length} error(s), ${warnings.length} warning(s)`));
    return 1;
  }

  console.log(green("all presets valid") + dim(` · ${PRESETS.length} checked · ${warnings.length} warning(s)`));
  return 0;
}

export const validateHelp = `${bold("flux validate")} [--json]

Check every preset against the config schema: known keys, right types, integer
grid sizes, sane hue windows, standard particle tiers. Exits 1 on any error,
which is what makes it usable as a CI gate.`;
