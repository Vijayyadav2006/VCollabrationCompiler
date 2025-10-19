// client/src/TypingSocket.js
import { io } from "socket.io-client";

export const connectTypingSocket = () => {
  return io("http://localhost:5002", {
    transports: ["websocket"],
  });
};
