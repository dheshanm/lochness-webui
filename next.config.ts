import { createRequire } from "module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    process.env.HOSTNAME ? `${process.env.HOSTNAME}` : `${process.env.NEXT_PUBLIC_HOSTNAME}`,
  ],
  publicRuntimeConfig: {
    version: packageJson.version,
  },
};

export default nextConfig;
