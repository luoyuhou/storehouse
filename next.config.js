/** @type {import('next').NextConfig} */
const nextConfig = {}

const env = process.env;

module.exports = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${env.BACKEND_URL}/:path*`
      }
    ]
  }
};