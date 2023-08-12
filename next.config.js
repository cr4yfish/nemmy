const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  mode: "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === "true",
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lemmy.**",
      },
      {
        protocol: "https",
        hostname: "**.**", // match everything, is this a good idea? One way to find out I guess
      },
    ],
  },
  reactStrictMode: false,
};

module.exports = withPWA(nextConfig);
