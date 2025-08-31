import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./register";
import 'font-awesome/css/font-awesome.min.css';


export default function Intro() {
  const navigate = useNavigate();

  // Typing animation state
  const texts = [
    "V-EDITOR",
    "VIJAY",
    "“Code. Chat. Collaborate.”",
    "“Innovation starts here 🚀”"
  ];
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  

  useEffect(() => {
    const currentText = texts[textIndex];
    let typingSpeed = 150;

    if (isDeleting) typingSpeed = 50;

    const timeout = setTimeout(() => {
      setDisplayText(prev =>
        isDeleting
          ? currentText.substring(0, prev.length - 1)
          : currentText.substring(0, prev.length + 1)
      );

      if (!isDeleting && displayText === currentText) {
        setTimeout(() => setIsDeleting(true), 1000); // pause at full text
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % texts.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex, texts]);

  return (
    <div style={{ background: "black", color: "white", fontFamily: "Arial, sans-serif" }}>
      
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
          background: "linear-gradient(135deg, #0f0f0f, #1a1a1a, #222)",
        }}
      >
        <img
          src="/images/logo.png"
          alt="V-EDITOR Logo"
          style={{ width: "120px", marginBottom: "20px" }}
        />

        <h1 style={{ fontSize: "3.5rem", marginBottom: "20px", minHeight: "4rem" }}>
          {displayText}
          <span style={{ borderRight: "3px solid white", marginLeft: "2px" }}></span>
        </h1>

        <p style={{ fontSize: "1.3rem", marginBottom: "30px", maxWidth: "600px" }}>
          The modern collaborative editor for <b>real-time coding</b>.  
          Built for developers, teams, and innovators 🚀
        </p>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/Register")}
            style={{
              padding: "12px 25px",
              background: "green",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/Login")}
            style={{
              padding: "12px 25px",
              background: "gray",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>

        <a href="#features" style={{ marginTop: "50px", color: "lightgray", textDecoration: "none" }}>
          ↓ Scroll to Learn More
        </a>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "40px" }}>Why Choose V-EDITOR?</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "25px",
    maxWidth: "1000px",
    margin: "0 auto",
  }}
>
  <div
    className="feature-card"
    style={{
      background: "#222",
      padding: "30px",
      borderRadius: "12px",
      color: "white",
      textAlign: "center",
      transition: "transform 0.3s, box-shadow 0.3s",
      cursor: "pointer",
    }}
  >
    <i className="fa fa-laptop-code" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#4caf50" }}></i>
    <p>Live Coding</p>
  </div>

  <div
    className="feature-card"
    style={{
      background: "#222",
      padding: "30px",
      borderRadius: "12px",
      color: "white",
      textAlign: "center",
      transition: "transform 0.3s, box-shadow 0.3s",
      cursor: "pointer",
    }}
  >
    <i className="fa fa-comment-dots" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#2196f3" }}></i>
    <p>Chat While Coding</p>
  </div>

  <div
    className="feature-card"
    style={{
      background: "#222",
      padding: "30px",
      borderRadius: "12px",
      color: "white",
      textAlign: "center",
      transition: "transform 0.3s, box-shadow 0.3s",
      cursor: "pointer",
    }}
  >
    <i className="fa fa-microphone" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#ff9800" }}></i>
    <p>Voice Collaboration</p>
  </div>

  <div
    className="feature-card"
    style={{
      background: "#222",
      padding: "30px",
      borderRadius: "12px",
      color: "white",
      textAlign: "center",
      transition: "transform 0.3s, box-shadow 0.3s",
      cursor: "pointer",
    }}
  >
    <i className="fa fa-robot" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#e91e63" }}></i>
    <p>AI Assistance</p>
  </div>
</div>

{/* CSS for pop effect */}
<style>
{`
  .feature-card:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  }
`}
</style>

        </div>
      </section>

      {/* How it Works Section */}
     <section style={{ padding: "80px 20px", textAlign: "center", background: "#111" }}>
  <h2 style={{ fontSize: "2.5rem", marginBottom: "40px" }}>How It Works</h2>
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px" }}>
    <div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-user-plus" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#4caf50" }}></i>
  <h3>Sign Up</h3>
  <p>Create your account in just seconds.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-users" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#2196f3" }}></i>
  <h3>Create/Join Room</h3>
  <p>Start a coding session or join your team.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-code" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#ff9800" }}></i>
  <h3>Code Together</h3>
  <p>Edit, chat, and collaborate in real time.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-comment" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#e91e63" }}></i>
  <h3>Chat & Discuss</h3>
  <p>Communicate instantly with your team.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-robot" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#9c27b0" }}></i>
  <h3>AI Assistance</h3>
  <p>Get smart coding suggestions in real time.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-sliders-h" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#00bcd4" }}></i>
  <h3>Custom Mode</h3>
  <p>Adjust editor settings to your workflow.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-brush" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#ffc107" }}></i>
  <h3>Syntax Highlighting</h3>
  <p>Color-coded code for readability.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-language" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#8bc34a" }}></i>
  <h3>21 Language Support</h3>
  <p>Code in multiple programming languages.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-bolt" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#ff5722" }}></i>
  <h3>Fast Typing</h3>
  <p>Experience smooth and responsive typing.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-microphone" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#795548" }}></i>
  <h3>Voice Collaboration</h3>
  <p>Communicate with audio in real-time.</p>
</div>

<div style={{ maxWidth: "250px", background: "#222", padding: "25px", borderRadius: "12px", color: "white" }}>
  <i className="fa fa-play-circle" style={{ fontSize: "2.5rem", marginBottom: "15px", color: "#009688" }}></i>
  <h3>Execute Code</h3>
  <p>Run your code directly in the editor.</p>
</div>



  </div>
</section>


      {/* Testimonials */}
      <section style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "40px" }}>What Developers Say</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    maxWidth: "900px",
    margin: "0 auto",
  }}
>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “V-EDITOR made pair programming so smooth!” <br />— Veer 👨‍💻
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “Best tool for remote hackathons.” <br />— Rao 🚀
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “Feels like Google Docs but for coding!” <br />— Elvish 🎉
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “Collaboration has never been easier.” <br />— Anika 💻
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “Real-time editing is super smooth!” <br />— Karan 🔥
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “The AI assistant is a game changer!” <br />— Priya 🤖
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “Perfect for team coding sessions.” <br />— Sameer 🛠️
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “I love the integrated chat feature.” <br />— Tina 💬
  </div>
  <div style={{ background: "#222", padding: "25px", borderRadius: "12px" }}>
    “Highly recommend for hackathons!” <br />— Rajat 🚀
  </div>
</div>

        </div>
      </section>

      {/* Call to Action */}
      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background: "linear-gradient(135deg, #222, #333)",
        }}
      >
        <h2 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Ready to Code Together?</h2>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "15px 30px",
            background: "green",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          Get Started Free
        </button>
      </section>
      {/* Footer message */}
<div
  style={{
    marginTop: "20px",
    fontStyle: "italic",
    color: "#bbb",
    fontSize: "1.2rem", // bigger font
    fontFamily: "'Poppins', sans-serif", // elegant font
    letterSpacing: "0.5px",
    lineHeight: "1.5",
    textAlign: "center", // center align
  }}
>
  “Empowering developers to code, collaborate, and create amazing projects together   <i className="fa fa-rocket" style={{ color: "#bbb" }}></i>
  ”
</div>


      {/* Footer */}
     <footer style={{ padding: "20px", textAlign: "center", background: "black", color: "gray" }}>
  <p>© {new Date().getFullYear()} V-EDITOR • Code. Chat. Collaborate.</p>
  <div style={{ marginTop: "10px", display: "flex", gap: "15px", justifyContent: "center", alignItems: "center" }}>
    {/* AI Chat using Font Awesome robot icon */}
    <a href="http://localhost:5173/" style={{ color: "gray", display: "flex", alignItems: "center", textDecoration: "none", fontSize: "1.1rem" }}>
      <i className="fa fa-robot" style={{ marginRight: "5px" }}></i> AI Chat
    </a>

    {/* LinkedIn */}
    <a href="#" style={{ color: "gray", fontSize: "1.1rem" }}>
      <i className="fa fa-linkedin"></i> LinkedIn
    </a>

    {/* Instagram */}
    <a href="https://www.instagram.com/vijay_legecy?utm_source=qr&igsh=dzdqamJnZmUxbnk1" style={{ color: "gray", fontSize: "1.1rem" }}>
      <i className="fa fa-instagram"></i> Instagram
    </a>
  </div>
</footer>




    </div>
  );
}
