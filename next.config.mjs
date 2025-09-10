/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/images/**",
      },
      // ADDED: Support for production Railway backend
      {
        protocol: "https",
        hostname: "parsswim-backend-production.up.railway.app",
        pathname: "/uploads/images/**",
      },
      {
        protocol: "https",
        hostname: "parsswim-backend-production.up.railway.app",
        pathname: "/images/**",
      },
    ],
    // Alternative: you can also use domains (deprecated but simpler)
    // domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Faster builds
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Development optimizations
      config.watchOptions = {
        poll: 1000, // Check for changes every second on Windows
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },

  // FIXED: Better static export configuration
  trailingSlash: false,
  output: "export",
  distDir: "out",
  // IMPORTANT: Disable server-side features for static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
