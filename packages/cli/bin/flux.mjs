#!/usr/bin/env node
/**
 * flux — the 4IM/Flux preset tool.
 *
 * Run `flux help` for the command list. Every command exits non-zero on
 * failure, so this is safe to drop into CI or a pre-commit hook.
 */
import { run } from "../lib/cli.mjs";

run(process.argv.slice(2)).catch(error => {
  console.error(`flux: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
