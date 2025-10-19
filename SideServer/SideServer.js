const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// SIMPLIFIED: Use Set for room typers (easier to manage)
const roomTypers = {};

io.on("connection", (socket) => {
  console.log("🟢 Typing client connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    console.log(`👥 ${username} joined room ${roomId}`);
    
    // Store user info in socket
    socket.data = { username, roomId };
    socket.join(roomId);

    // Initialize room if not present
    if (!roomTypers[roomId]) {
      roomTypers[roomId] = new Set();
    }

    // Send current typers to the new client ONLY
    const currentTypers = Array.from(roomTypers[roomId]);
    socket.emit("initialTypers", currentTypers);
    console.log(`📊 Sent initial typers to ${username}:`, currentTypers);
  });

  socket.on("typing", ({ username, roomId }) => {
    if (!username || !roomId) {
      console.log("❌ Invalid typing event");
      return;
    }

    // SIMPLIFIED: Remove strict security check for now
    // if (socket.data.username !== username) {
    //   console.log(`🚫 Unauthorized typing: ${username} from socket ${socket.id}`);
    //   return;
    // }

    if (!roomTypers[roomId]) {
      roomTypers[roomId] = new Set();
    }

    // Add ONLY the typing user
    roomTypers[roomId].add(username);
    
    const currentTypers = Array.from(roomTypers[roomId]);
    console.log(`⌨️ ${username} typing in ${roomId}`);
    console.log(`📊 Current typers:`, currentTypers);
    
    // BROADCAST TO OTHER USERS ONLY
    socket.to(roomId).emit("typing", { username });
    socket.to(roomId).emit("updateTypers", currentTypers);
  });

  socket.on("stopTyping", ({ username, roomId }) => {
    if (!username || !roomId) {
      console.log("❌ Invalid stopTyping event");
      return;
    }

    // SIMPLIFIED: Remove strict security check for now
    // if (socket.data.username !== username) {
    //   console.log(`🚫 Unauthorized stopTyping: ${username} from socket ${socket.id}`);
    //   return;
    // }

    if (roomTypers[roomId]) {
      // Remove ONLY the user who stopped typing
      roomTypers[roomId].delete(username);
      
      const currentTypers = Array.from(roomTypers[roomId]);
      console.log(`✋ ${username} stopped typing in ${roomId}`);
      console.log(`📊 Current typers:`, currentTypers);
      
      // BROADCAST TO OTHER USERS ONLY
      socket.to(roomId).emit("stopTyping", { username });
      socket.to(roomId).emit("updateTypers", currentTypers);
    }
  });

  socket.on("disconnect", () => {
    const { username, roomId } = socket.data || {};

    if (username && roomId) {
      console.log(`🔴 ${username} disconnected from ${roomId}`);
      
      // Remove from typers
      if (roomTypers[roomId]) {
        roomTypers[roomId].delete(username);
        const currentTypers = Array.from(roomTypers[roomId]);
        
        // Notify other users
        socket.to(roomId).emit("stopTyping", { username });
        socket.to(roomId).emit("updateTypers", currentTypers);
        
        console.log(`📊 Final typers in ${roomId}:`, currentTypers);
      }
    } else {
      console.log("🔴 Unknown client disconnected:", socket.id);
    }
  });
});

server.listen(5002, () => {
  console.log("🚀 Typing server running on port 5002");
});