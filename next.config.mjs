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
      // Support for DigitalOcean production backend
      {
        protocol: "https",
        hostname: "your-droplet-domain.com", // Update with your actual domain
        pathname: "/uploads/images/**",
      },
      {
        protocol: "https",
        hostname: "your-droplet-domain.com", // Update with your actual domain
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
};

export default nextConfig;
