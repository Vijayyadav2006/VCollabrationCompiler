import React, { useState, useEffect, useRef } from "react";
import Client from "./Client";
import { connectWs } from "./wes";
import { toast } from "react-hot-toast";


export default function Chat({ username, roomId }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typers, setTypers] = useState([]); // users typing
  const socket = useRef(null);
  const typingTimer = useRef(null);

  // Connect socket and handle events
  useEffect(() => {
    socket.current = connectWs();

    socket.current.on("connect", () => {
      console.log("Connected to server");
      socket.current.emit("joinRoom", { username, roomId });
    });

    // User joined
socket.current.on("user-joined", (user) => {
  // Add to chat messages
  setMessages((prev) => [
    ...prev,
    { username: user, message: `${user} joined the room`, system: true },
  ]);

  // Show toast
  toast.success(`${user} joined the room`);
});

// User left
socket.current.on("user-left", (user) => {
  setMessages((prev) => [
    ...prev,
    { username: user, message: `${user} left the room`, system: true },
  ]);

  toast.success(`${user} left the room`);
});


    // Incoming messages
    socket.current.on("receive-message", (messageObj) => {
      setMessages((prev) => [...prev, messageObj]);
    });

    // Typing events
    socket.current.on("typing", (user) => {
      setTypers((prev) => (prev.includes(user) ? prev : [...prev, user]));
    });

    socket.current.on("stopTyping", (user) => {
      setTypers((prev) => prev.filter((u) => u !== user));
    });

    // Cleanup
    return () => {
      if (socket.current) {
        socket.current.off("connect");
        socket.current.off("user-joined");
        socket.current.off("user-left");
        socket.current.off("receive-message");
        socket.current.off("typing");
          socket.current.off("stopTyping");
        socket.current.disconnect();
      }
    };
  }, [username, roomId]);

  // Typing indicator emit
  useEffect(() => {
    if (!socket.current) return;

    if (messageInput.trim()) {
      socket.current.emit("typing", username);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socket.current.emit("stopTyping", username);
      }, 1000);
    } else {
      socket.current.emit("stopTyping", username);
    }

    return () => clearTimeout(typingTimer.current);
  }, [messageInput, username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageObj = {
      username,
      message: messageInput,
      time: timeString,
      roomId,
    };

    if (socket.current) {
      socket.current.emit("send-message", messageObj);
      socket.current.emit("stopTyping", username);
    }

    setMessages((prev) => [...prev, messageObj]);
    setMessageInput("");
  };

  return (
    <div className="chat-container d-flex flex-column h-100">
      {/* Header */}
      <div className="chat-header p-2 border-bottom bg-light">
        <strong>
          Room: {roomId} | Chatting as: {username}
        </strong>

        
      </div>

      {/* Messages */}
      <div className="chat-messages flex-grow-1 overflow-auto p-3 d-flex flex-column">
        {messages.length === 0 && (
          <div className="text-muted text-center mt-3">No messages yet</div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.system ? "text-muted fst-italic" : ""}`}
          >
            {!msg.system && <Client username={msg.username} />}
            <div className="ms-5 d-flex justify-content-between">
              <span>{msg.message}</span>
              {msg.time && <small className="text-muted ms-2">{msg.time}</small>}
            </div>
          </div>
        ))}

        {/* Typing indicator BELOW messages */}
        {typers.length > 0 && (
          <div className="mt-auto text-sm text-gray-500 fst-italic">
            {typers
              .filter((user) => user !== username)
              .join(", ")}{" "}
            {typers.filter((u) => u !== username).length > 1 ? "are" : "is"} typing...
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="chat-input d-flex mt-2 p-2 border-top bg-white"
        style={{ gap: "5px" }}
        onSubmit={sendMessage}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
