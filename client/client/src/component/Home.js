import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Room ID generated successfully! 🎉");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error("Please enter the Room ID, First Name, and Last Name");
      return;
    }
    if (isUsernameTaken(firstName)) {
      setError("Username is already taken. Please choose another one.");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username: `${firstName} ${lastName}`, email },
    });
    toast.success("You have successfully joined the room! 🎉");
  };

  const isUsernameTaken = (username) => {
    return false; // Implement actual logic if needed
  };

  const handleLogout = () => {
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-card-body">
          <img
            className="home-logo"
            src="/images/logo.png"
            alt="v_editor_logo"
          />
          <h4 className="home-title">Enter the Room ID</h4>
          <form onSubmit={joinRoom}>
            <div className="form-group">
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fas fa-door-open"></i>
                </span>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="Room ID"
                  required
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="form-control"
                  placeholder="Email (optional)"
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button type="submit" className="btn btn-primary btn-lg btn-block">
                Submit
              </button>
              <p className="mt-3">
                Don't have a Room ID?{" "}
                <span
                  className="text-primary p-2"
                  style={{ cursor: "pointer" }}
                  onClick={generateRoomId}
                >
                  New Room
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
      <button onClick={handleLogout} className="btn btn-danger logout-button">
        Logout
      </button>
    </div>
  );
}

Home.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string,
  roomId: PropTypes.string,
  error: PropTypes.string,
};

export default Home;