/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/attendance",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ["leaflet"],
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
