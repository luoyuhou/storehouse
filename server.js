const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // 生产环境监听所有网络接口
const port = process.env.PORT || 3000;
const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log(`🔧 Environment: ${dev ? "development" : "production"}`);
console.log(`🔗 Backend URL: ${backendUrl}`);

// 创建持久化的代理实例
const socketIOProxy = createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  ws: true, // 支持 WebSocket
  logLevel: "debug",
  onError: (err, req, res) => {
    console.error("❌ Proxy Error:", err.message);
  },
  onProxyReq: (proxyReq, req, res) => {
    // console.log(`📤 Proxying: ${req.method} ${req.url} -> ${backendUrl}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // console.log(`📥 Response: ${req.url} - ${proxyRes.statusCode}`);
  },
});

const apiProxy = createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  pathRewrite: {
    "^/api": "",
  },
  logLevel: "debug",
  onError: (err, req, res) => {
    console.error("❌ API Proxy Error:", err.message);
  },
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // 跳过 Next.js 内部请求
      if (pathname.startsWith("/_next/")) {
        return handle(req, res, parsedUrl);
      }

      // 处理 Socket.IO HTTP 请求（polling）
      if (pathname.startsWith("/socket.io")) {
        // console.log(`🔌 Socket.IO HTTP request: ${req.url}`);
        return socketIOProxy(req, res);
      }

      // 处理 API 请求
      if (pathname.startsWith("/api")) {
        // console.log(`🌐 API request: ${req.url}`);
        return apiProxy(req, res);
      }

      // 其他请求交给 Next.js 处理
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("❌ Server Error:", err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // 处理 WebSocket 升级请求
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url, true);

    // console.log(`⬆️ Upgrade request: ${pathname}`);

    // Socket.IO WebSocket
    if (pathname.startsWith("/socket.io")) {
      // console.log(`🔌 WebSocket upgrade for Socket.IO: ${req.url}`);
      socketIOProxy.upgrade(req, socket, head);
    }
    // Next.js HMR - 交给 Next.js 处理，但由于自定义服务器限制，会降级到 polling
    else if (pathname.startsWith("/_next/")) {
      // Next.js 在自定义服务器下 HMR 会自动使用 polling，无需特殊处理
      socket.destroy();
    }
    // 其他未知的 WebSocket 请求
    else {
      console.log(`❌ Unknown upgrade request: ${pathname}`);
      socket.destroy();
    }
  });

  server.listen(port, hostname, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`📡 Socket.IO proxy: /socket.io/* -> ${backendUrl}/socket.io/*`);
    console.log(`🌐 API proxy: /api/* -> ${backendUrl}/*`);
  });
});
