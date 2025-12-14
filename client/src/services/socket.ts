import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@shared/types";

const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:3001"
  : window.location.origin;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
  }
);

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
