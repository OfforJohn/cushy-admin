import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['picsum.photos'], // ✅ domain allowed
  },
  // ✅ Add other config options here if needed
};

export default nextConfig;
