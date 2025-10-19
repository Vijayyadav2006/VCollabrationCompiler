import React, { useState, useEffect, useRef } from "react";
import Client from "./Client";
import { connectWs } from "./wes";

export default function Chat({ username, roomId }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typers, setTypers] = useState([]);
  const [notifications, setNotifications] = useState([]); // join/leave popups
  const socket = useRef(null);
  const typingTimer = useRef(null);

  // Helper to show temporary notification
  const showNotification = (text) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000); // show for 3 sec
  };

  // Socket setup
  useEffect(() => {
    socket.current = connectWs();

    socket.current.on("connect", () => {
      socket.current.emit("joinRoom", { username, roomId });
    });

    socket.current.on("user-joined", (user) => {
      setMessages((prev) => [
        ...prev,
        { username: user, message: `${user} joined the room`, system: true },
      ]);
      showNotification(`${user} joined the room`);
    });

    socket.current.on("user-left", (user) => {
      setMessages((prev) => [
        ...prev,
        { username: user, message: `${user} left the room`, system: true },
      ]);
      showNotification(`${user} left the room`);
    });

    socket.current.on("receive-message", (messageObj) => {
      setMessages((prev) => [...prev, messageObj]);
    });

    socket.current.on("typing", (user) => {
      setTypers((prev) => (prev.includes(user) ? prev : [...prev, user]));
    });

    socket.current.on("stopTyping", (user) => {
      setTypers((prev) => prev.filter((u) => u !== user));
    });

    return () => {
      if (socket.current) {
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

    socket.current.emit("send-message", messageObj);
    socket.current.emit("stopTyping", username);

    setMessages((prev) => [...prev, messageObj]);
    setMessageInput("");
  };

  return (
    <div className="chat-container d-flex flex-column h-100 position-relative">
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

        {/* Typing indicator */}
        {typers.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 fst-italic">
            {typers
              .filter((user) => user !== username)
              .join(", ")}{" "}
            {typers.filter((u) => u !== username).length > 1 ? "are" : "is"} typing...
          </div>
        )}
      </div>

      {/* Chat Input */}
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

      {/* Join/Leave Notifications */}
      <div className="position-absolute top-2 end-2 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-gray-800 text-white px-4 py-2 rounded shadow animate-fade-in"
          >
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
