// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    //  Don't fail builds because of ESLint errors
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // If you don't need proxying anymore, remove this
  rewrites: async () => {
    return [];
  },
};

export default nextConfig;

