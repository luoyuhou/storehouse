/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "src/hooks/use-auth";

interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
});

const initSocket = (userId: string) => {
  // console.log("🔧 Initializing Socket.IO connection...", {
  //   namespace: "/chat",
  //   userId,
  //   url: window.location.origin + "/chat",
  // });

  return io("/chat", {
    // Socket.IO 路径（可选，默认为 /socket.io）
    // path: '/socket.io',

    // 传输方式：先尝试 polling，再升级到 WebSocket
    transports: ["polling", "websocket"],

    // 认证信息
    auth: {
      userId,
    },

    // 重连配置
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    // 超时配置
    timeout: 10000,

    // 自动连接
    autoConnect: true,
  });
};

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const auth = useAuth();
  const { user } = auth as unknown as { user?: { id: string } };

  useEffect(() => {
    if (!user?.id) {
      return () => {};
    }

    // 初始化 Socket.IO 客户端
    const socketInstance = initSocket(user.id);

    // 连接成功
    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Connected to Socket.IO server", {
        id: socketInstance.id,
        transport: socketInstance.io.engine.transport.name,
      });
    });

    // 连接断开
    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("❌ Disconnected from Socket.IO server:", reason);
    });

    // 连接错误
    socketInstance.on("connect_error", (error: any) => {
      console.error("🔴 Socket.IO connection error:", error.message);
      console.error("🔍 Details:", {
        type: error.type,
        description: error.description,
        context: error.context,
      });
    });

    // 重连尝试
    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnect attempt ${attemptNumber}...`);
    });

    // 重连成功
    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 Disconnecting socket...");
      socketInstance.disconnect();
    };
  }, [user?.id]);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}
