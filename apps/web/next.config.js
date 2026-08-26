/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@hemdem/core"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
