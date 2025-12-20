import { NextResponse } from "next/server";

export function middleware(request: { nextUrl: { pathname: string } }) {
  // console.log("-----", request.nextUrl.pathname);
  const response = NextResponse.next();
  // 关键：允许WebSocket连接跨域
  if (request.nextUrl.pathname.startsWith("/socket.io")) {
    // console.log(1111, request.nextUrl);
    // request.nextUrl.pathname = "/chat";
    response.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return response;
}

export const config = {
  // matcher: ["/:path*", "/socket.io/:path*"], // 仅拦截WebSocket路径
  matcher: ["/socket.io/:path*"], // 仅拦截WebSocket路径
};
