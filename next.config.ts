import type { NextConfig } from "next";

// Your Vercel API URL
const VERCEL_API_URL = "https://peacepilot-api.vercel.app";

const nextConfig: NextConfig = {
  // Only use static export when building for Firebase
  // Vercel needs full Next.js with API routes, so no static export
  output: process.env.BUILD_FOR_FIREBASE === "true" ? "export" : undefined,
  // trailingSlash causes 308 redirects on API routes, which breaks CORS
  // Only use it for Firebase static export
  trailingSlash: process.env.BUILD_FOR_FIREBASE === "true",
  images: {
    unoptimized: true,
  },
  env: {
    // Hardcode the Vercel API URL for production builds
    NEXT_PUBLIC_VERCEL_API_URL: VERCEL_API_URL,
  },
};

export default nextConfig;
