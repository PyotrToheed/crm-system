import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    PRISMA_CLIENT_ENGINE_TYPE: "binary",
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
