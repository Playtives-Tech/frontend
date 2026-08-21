import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  async redirects() {
    return [
      {
        source: '/profile/verification/:path*',
        destination: '/profile',
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
