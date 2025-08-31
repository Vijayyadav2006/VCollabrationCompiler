const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions"); 
const cors = require("cors");

const server = http.createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store users in a room
const userSocketMap = {};

// Get all connected clients in a room
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId], 
    })
  );
};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins the room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;  // Always store username

    socket.join(roomId);

    console.log(`${username} has joined room ${roomId}`);
    const clients = getAllConnectedClients(roomId);

    console.log(
      `User joined: ${username}, Socket ID: ${socket.id}, Room: ${roomId}`
    );

    // Notify all clients (including sender)
    io.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id,
    });
  });

  // Broadcast code changes
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    io.to(roomId).emit(ACTIONS.CODE_CHANGE, { code }); 
  });

  // Send initial code when a new user joins
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle user typing
  socket.on(ACTIONS.USER_TYPING, ({ roomId, username }) => {
    io.to(roomId).emit(ACTIONS.USER_TYPING, { username });
  });

  // Handle audio toggle
  socket.on(ACTIONS.TOGGLE_AUDIO, ({ socketId, isAudioEnabled }) => {
    io.to(socketId).emit(ACTIONS.TOGGLE_AUDIO, { socketId, isAudioEnabled });
  });

  // Start audio stream
  socket.on(ACTIONS.START_AUDIO, ({ roomId, socketId }) => {
    io.to(roomId).emit(ACTIONS.START_AUDIO, { socketId });
  });

  // Stop audio stream
  socket.on(ACTIONS.STOP_AUDIO, ({ roomId }) => {
    io.to(roomId).emit(ACTIONS.STOP_AUDIO);
  });

  // Handle user disconnection
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      io.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    console.log(`User disconnecting: ${userSocketMap[socket.id]}, Socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    delete userSocketMap[socket.id]; // Cleanup after full disconnection
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
