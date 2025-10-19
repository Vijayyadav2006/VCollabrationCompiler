import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Store messages per room
const chatHistory = {}; // { roomId: [ {username, message, timestamp}, ... ] }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("joinRoom", ({ username, roomId }) => {
    socket.join(roomId);
    socket.data.username = username;  
    socket.data.roomId = roomId;
    console.log(`${username} joined room ${roomId}`);

    // Send past chat history to this new user
    if (chatHistory[roomId]) {
      socket.emit("past-messages", chatHistory[roomId]);
    } else {
      chatHistory[roomId] = []; // Initialize if not exists
    }

    // Notify others in room
    socket.to(roomId).emit("user-joined", username);
  });

  // Send message
  socket.on("send-message", (messageObj) => {
    const { roomId } = messageObj;

    // Save message to history
    if (!chatHistory[roomId]) chatHistory[roomId] = [];
    chatHistory[roomId].push({
      username: messageObj.username,
      message: messageObj.message,
      timestamp: new Date().toISOString(),
    });

    // Emit to other users in room
    socket.to(roomId).emit("receive-message", messageObj);
  });

  // Typing indicator
  socket.on("typing", (username) => {
    const roomId = socket.data.roomId;
    if (roomId) socket.to(roomId).emit("typing", username);
  });

  socket.on("stopTyping", (username) => {
    const roomId = socket.data.roomId;
    if (roomId) socket.to(roomId).emit("stopTyping", username);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const { username, roomId } = socket.data;
    if (roomId) socket.to(roomId).emit("user-left", username);
    console.log("User disconnected:", socket.id);
  });
});

// Test route
app.get("/", (req, res) => {
  res.send("<h1>Chat Server is running</h1>");
});

server.listen(5001, () => {
  console.log("Server running at http://localhost:5001");
});
