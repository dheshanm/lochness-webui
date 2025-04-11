import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    process.env.HOSTNAME ? `${process.env.HOSTNAME}` : `${process.env.NEXT_PUBLIC_HOSTNAME}`,
  ],
};

export default nextConfig;
