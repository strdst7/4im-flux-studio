/**
 * `tsc` only emits the TypeScript sources. The solver core is upstream JS that
 * we ship verbatim, so copy it next to the compiled output — the built
 * `index.js` re-exports from `./core/fluid.core.js`.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

await mkdir(join(root, "dist/core"), { recursive: true });

for (const file of ["fluid.core.js", "fluid.core.d.ts", "LICENSE", "LICENSE-fluid-simulation.txt"]) {
  await copyFile(join(root, "src/core", file), join(root, "dist/core", file));
}

console.log("copied solver core into dist/core");
