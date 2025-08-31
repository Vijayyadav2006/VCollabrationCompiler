import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import 'font-awesome/css/font-awesome.min.css';
import GitHubLogin from "react-github-login";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState(""); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Always register
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage("Please enter a valid email.");
      return;
    }
    setLoading(true);

    const data = {
      signUp: true,
      fName: firstName,
      lName: lastName,
      email,
      password,
    };

    try {
      const response = await fetch("http://localhost/my_editor/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setLoading(false);

      if (result.success) {
        setMessage(result.message);
        navigate("/home", { state: { firstName: result.fName, email } });
      } else if (result.error === "username-taken") {
        setMessage("Username is already taken. Please choose a different username.");
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setLoading(false);
      setMessage("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    const user = {}; // decode credential if needed
    navigate("/home", { state: { firstName: user.given_name || "GoogleUser", email: user.email || "" } });
  };

  const handleGoogleLoginError = () => {
    setMessage("Google login failed. Please try again.");
  };

  const handleGitHubLoginSuccess = (response) => {
    console.log(response);
    const user = {}; // extract user info from GitHub
    navigate("/home", { state: { firstName: user.name || "GitHubUser", email: user.email || "" } });
  };

  const handleGitHubLoginFailure = () => {
    setMessage("GitHub login failed. Please try again.");
  };

  useEffect(() => {
    const inputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='password']");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => input.classList.add("typing"));
      input.addEventListener("blur", () => input.classList.remove("typing"));
    });
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("focus", () => input.classList.add("typing"));
        input.removeEventListener("blur", () => input.classList.remove("typing"));
      });
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId="1099090296175-au5rgr6ev296iocfa85g3a0601evgs2l.apps.googleusercontent.com">
      <div className="login-container">
        <div className="container">
          <h1 className="form-title">Register</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <span className="input-group-text"><i className="fas fa-user"></i></span>
              <input type="text" className="form-control" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text"><i className="fas fa-user"></i></span>
              <input type="text" className="form-control" placeholder="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text"><i className="fas fa-envelope"></i></span>
              <input type="email" className="form-control typing-effect" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text"><i className="fas fa-lock"></i></span>
              <input type="password" className="form-control typing-effect" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span><i className="fas fa-spinner fa-spin"></i> Loading...</span> : "Register"}
            </button>
          </form>

          <p className="or">----------or----------</p>

          <div className="icons" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
            <GitHubLogin
              clientId="Ov23liwzTy9pLq4DPrCx"
              onSuccess={handleGitHubLoginSuccess}
              onFailure={handleGitHubLoginFailure}
              redirectUri="http://localhost:3000/auth/github/callback"
              buttonText="Login with GitHub"
              className="btn btn-dark"
            />
          </div>

          <div className="links" style={{ marginTop: "15px", textAlign: "center" }}>
            <p>Already have an account?</p>
            <button className="btn btn-link" onClick={() => navigate("/Login")}>Sign In</button>
          </div>

          {message && <div className="alert alert-info">{message}</div>}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
