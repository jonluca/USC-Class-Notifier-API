// @ts-check
import "dotenv/config";
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mui/icons-material", "@mui/material"],
  poweredByHeader: false,
  experimental: {
    largePageDataBytes: 100000000,
    optimizeServerReact: true,
    appDocumentPreloading: true,
  },
};

export default nextConfig;
