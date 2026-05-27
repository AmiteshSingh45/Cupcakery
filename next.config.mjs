/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local backend (development)
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
      // Production backend (Render)
      {
        protocol: "https",
        hostname: "cupcakery-backend.onrender.com",
      },
      // QR Code generation service
      {
        protocol: "https",
        hostname: "quickchart.io",
      },
    ],
  },
};

export default nextConfig;