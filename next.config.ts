import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  transpilePackages: ['react-datepicker'],
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
