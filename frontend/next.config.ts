import type { NextConfig } from "next";
import { config } from "process";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
