import type { NextConfig } from "next";

/**
 * `STATIC_EXPORT=1 npm run build` emits a plain static site into `out/`,
 * ready to drop on any host. Normal dev/build behaviour is unchanged.
 */
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT
    ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true } }
    : {}),
  /* @4im/fluid ships TypeScript sources, so Next has to compile it. */
  transpilePackages: ["@4im/fluid"],
};

export default nextConfig;
