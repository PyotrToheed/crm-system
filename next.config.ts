import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
