/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
  images: {
    domains: ["arcadesticklabs.co.uk"],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "django-backend",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "arcadesticklabs.co.uk",
        pathname: "/media/**",
      },
    ],
  },
};

module.exports = nextConfig;
