// @ts-check
import "dotenv/config";
/** @type {import('next').NextConfig} */
const nextConfig = {
  generateEtags: false,
  transpilePackages: ["@mui/icons-material", "@mui/material"],
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
    largePageDataBytes: 100000000,
    optimizeServerReact: true,
    appDocumentPreloading: true,
  },
};

export default nextConfig;
