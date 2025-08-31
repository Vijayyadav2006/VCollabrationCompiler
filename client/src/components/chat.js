import React, { useState, useEffect } from "react";

export default function Chat({ socket, firstName, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for typing
    socket.on("user-typing", (user) => {
      if (user !== firstName) {
        setTypingUser(user);
        setTimeout(() => setTypingUser(""), 2000);
      }
    });

    return () => {
      socket.off("chat-message");
      socket.off("user-typing");
    };
  }, [socket, firstName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input) return;

    const msgObj = { user: firstName, text: input };
    socket.emit("chat-message", { roomId, ...msgObj });
    setMessages((prev) => [...prev, msgObj]);
    setInput("");
  };

  const handleTyping = () => {
    socket.emit("user-typing", { roomId, firstName });
  };

  return (
    <div style={{ padding: "1rem", height: "100%", backgroundColor: "#f5f5f5" }}>
      <ul style={{ listStyle: "none", padding: 0, overflowY: "auto", maxHeight: "70%" }}>
        {messages.map((msg, idx) => (
          <li
            key={idx}
            style={{
              padding: "0.5rem 1rem",
              background:
                msg.user === "System"
                  ? "#ffeeba"
                  : idx % 2 === 0
                  ? "#efefef"
                  : "#ddd",
              borderRadius: "5px",
              margin: "0.2rem 0",
            }}
          >
            {msg.user !== "System" && <strong>{msg.user}: </strong>}
            {msg.text}
          </li>
        ))}
      </ul>

      {typingUser && (
        <div style={{ fontStyle: "italic", margin: "0.5rem 0" }}>
          {typingUser} is typing...
        </div>
      )}

      <form onSubmit={sendMessage} style={{ display: "flex", marginTop: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          style={{
            flexGrow: 1,
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
