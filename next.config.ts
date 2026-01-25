import type { NextConfig } from "next";

// Your Vercel API URL
const VERCEL_API_URL = "https://peacepilot-api.vercel.app";

const nextConfig: NextConfig = {
  // Only use static export when building for Firebase
  // Vercel needs full Next.js with API routes, so no static export
  output: process.env.BUILD_FOR_FIREBASE === "true" ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    // Hardcode the Vercel API URL for production builds
    NEXT_PUBLIC_VERCEL_API_URL: VERCEL_API_URL,
  },
};

export default nextConfig;
