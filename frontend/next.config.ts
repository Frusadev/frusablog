import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ametsowou.me",
        pathname: "/v1/resources/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/v1/resources/**",
      },
    ],
  },
};

export default nextConfig;
