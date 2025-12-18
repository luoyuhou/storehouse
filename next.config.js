/** @type {import('next').NextConfig} */
const nextConfig = {};

const env = process.env;

module.exports = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // HTTP API 代理
      {
        source: "/api/:path*",
        destination: `${env.BACKEND_URL}/:path*`,
      },
      // Socket.IO 代理 - 关键配置
      {
        source: "/socket.io/:path*",
        destination: `${env.BACKEND_URL}/socket.io/:path*`,
      },
    ];
  },

  // 可选：自定义服务器配置
  async headers() {
    return [
      {
        source: "/socket.io/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        ],
      },
    ];
  },
};
