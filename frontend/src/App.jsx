import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("0x123456");
  const [messages, setMessages] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(false);

  const [redeemMessage, setRedeemMessage] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);
      setPoints(null);
      setRedeemMessage("");

      const response = await axios.post("http://localhost:4000/chat", {
        message,
        walletAddress,
      });

      const aiMessage = {
        role: "ai",
        content: response.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setPoints(response.data.points);
      setMessage("");
    } catch (error) {
      console.error("Frontend chat error:", error);

      const errorMessage = {
        role: "ai",
        content: "Failed to get AI reply.",
      };

      setMessages((prev) => [...prev, errorMessage]);
      setPoints(null);
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async () => {
    try {
      setRedeemLoading(true);
      setRedeemMessage("");

      const response = await axios.post("http://localhost:4000/redeem", {
        walletAddress,
        pointsToBurn: points || 0,
      });

      setRedeemMessage(response.data.message);
    } catch (error) {
      console.error("Redeem error:", error);
      setRedeemMessage("Failed to redeem points.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setMessage("");
    setPoints(null);
    setRedeemMessage("");
  };

  const totalMessages = messages.length;
  const totalUserMessages = messages.filter((m) => m.role === "user").length;
  const totalAiMessages = messages.filter((m) => m.role === "ai").length;

  return (
    <div className="app-shell">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <main className="dashboard">
        <section className="hero-card">
          <div className="badge">AI Rewards Chat</div>
          <h1>AI Chat Dashboard</h1>
          <p>
            Ask questions, get AI responses, earn points, and redeem them in a
            polished blockchain-ready experience.
          </p>
        </section>

        <section className="main-grid">
          <div className="left-column">
            <section className="chat-card">
              <div className="card-header">
                <div>
                  <h2>Start a Conversation</h2>
                  
                </div>

                <div className="header-actions">
                  <div className="status-pill">
                    <span className="status-dot"></span>
                    Backend Live
                  </div>

                  <button className="clear-btn" onClick={clearChat}>
                    Clear Chat
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                />
              </div>

              <div className="form-group">
                <label>Your Message</label>
                <textarea
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask something about blockchain, AI, rewards, or your project..."
                />
              </div>

              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={loading}
              >
                {loading ? "Generating..." : "Send Message"}
              </button>
            </section>

            <section className="result-card">
              <div className="result-top">
                <span className="result-icon">✦</span>
                <h3>Chat History</h3>
              </div>

              <div className="chat-history">
                {messages.length === 0 ? (
                  <p className="empty-text">
                    No messages yet. Start your first conversation.
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-row ${
                        msg.role === "user" ? "chat-row-user" : "chat-row-ai"
                      }`}
                    >
                      <div
                        className={`chat-bubble ${
                          msg.role === "user" ? "user-bubble" : "ai-bubble"
                        }`}
                      >
                        <span className="bubble-role">
                          {msg.role === "user" ? "You" : "AI"}
                        </span>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="sidebar">
            <section className="result-card points-card">
              <div className="result-top">
                <span className="result-icon">⟡</span>
                <h3>Points Earned</h3>
              </div>

              <div className="points-value">
                {points !== null ? points : "--"}
              </div>

              <p className="points-label">
                {points !== null ? "Points from latest chat" : "No points yet"}
              </p>

              <button
                className="redeem-btn"
                onClick={redeemPoints}
                disabled={redeemLoading || points === null || points <= 0}
              >
                {redeemLoading ? "Redeeming..." : "Redeem Points"}
              </button>

              {redeemMessage && (
                <div className="info-box success-box">{redeemMessage}</div>
              )}
            </section>

            <section className="result-card stats-card">
              <div className="result-top">
                <span className="result-icon">☰</span>
                <h3>Session Stats</h3>
              </div>

              <div className="stat-item">
                <span>Total Messages</span>
                <strong>{totalMessages}</strong>
              </div>

              <div className="stat-item">
                <span>User Messages</span>
                <strong>{totalUserMessages}</strong>
              </div>

              <div className="stat-item">
                <span>AI Messages</span>
                <strong>{totalAiMessages}</strong>
              </div>

              <div className="stat-item">
                <span>Wallet</span>
                <strong className="wallet-mini">{walletAddress}</strong>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;