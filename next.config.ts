import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  outputFileTracingExcludes: {
    "*": [".env", ".env.*", ".env.local", ".env.production"],
  },
};

export default nextConfig;
