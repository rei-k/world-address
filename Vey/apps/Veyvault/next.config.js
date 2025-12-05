/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  // Support for TypeScript paths
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
