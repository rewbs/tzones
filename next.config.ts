import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Prevent bundling ably on server - it uses dynamic requires that break webpack
  serverExternalPackages: ['ably'],
};

export default nextConfig;
