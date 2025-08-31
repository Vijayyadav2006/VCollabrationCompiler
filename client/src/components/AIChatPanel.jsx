// AIChatPanel.jsx
export default function AIChatPanel({ isOpen, onClose }) {
  return (
    <div className={`ai-panel ${isOpen ? "open" : ""}`}>
      <div className="ai-panel-header">
        <span>Editor AI</span>
        <button onClick={onClose}>→</button>
      </div>
      <div className="ai-panel-body">
        <p className="ai-empty">🧠 Ask me anything about your code!</p>
        <div className="ai-login-warning">Please login to interact with the AI</div>
        <input type="text" className="ai-input" placeholder="Leave a message (Shift+Enter for new line)" />
      </div>
    </div>
  );
}
