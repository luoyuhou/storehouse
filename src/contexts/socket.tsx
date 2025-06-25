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
  return io("http://127.0.0.1:3001/chat", {
    // transports: ["websocket"],
    // path: "/api-internal/socket",
    auth: { userId },
    // reconnectionAttempts: 3,
    // reconnectionDelay: 1000,
    // addTrailingSlash: false,
    // transports: ["websocket", "polling"], // 明确指定传输方式
    // autoConnect: true,
    // reconnection: true,
    // reconnectionAttempts: 5,
    // reconnectionDelay: 1000,
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

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to Socket.IO server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from Socket.IO server");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}
