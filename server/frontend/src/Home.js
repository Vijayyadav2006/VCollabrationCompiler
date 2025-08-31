import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from the backend
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost/my_editor/register.php", {
          method: "GET",
          credentials: "include", // Include credentials for session management
        });

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setFirstName(result.firstName);
          setLastName(result.lastName);
          setEmail(result.email);
        } else {
          toast.error(result.message);
          setFirstName("");
          setLastName("");
          setEmail("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data. Please try again later.");
      }
    };

    fetchUserData();
  }, [navigate]);

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Congratulations on generating the Room ID! 🎉");
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error("Please enter the Room ID, First Name, and Last Name");
      return;
    }
    if (isUsernameTaken(`${firstName} ${lastName}`)) {
      setError("Username is already taken. Please choose another one.");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username: `${firstName} ${lastName}`, email },
    });
    toast.success("You have successfully joined the room! 🎉");
  };

  const isUsernameTaken = (username) => {
    // Implement your logic to check if the username is taken
    return false; // Placeholder
  };

  const handleLogout = () => {
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    toast.success("You have successfully logged out!");
    navigate("/login");
  };

  useEffect(() => {
    // Enable the submit button if the form is valid
    const isFormValid = roomId.trim() && firstName.trim() && lastName.trim();
    const submitButton = document.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = !isFormValid;
    }
  }, [roomId, firstName, lastName]);

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-card-body">
          <img
            className="home-logo"
            src="/images/logo.png"
            alt="v_editor_logo"
          />
          <h4 className="home-title">Enter the Room Id</h4>
          <form id="demo-form" onSubmit={joinRoom}>
            <div className="form-group">
              <div className="input-group mb-3 position-relative">
                <span className="input-group-text">
                  <i className="fas fa-door-open"></i>
                </span>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="Room Id"
                  aria-label="Room ID"
                  required
                />
                {roomId && <span className="input-overlay">{roomId}</span>}
              </div>
              <div className="input-group mb-3 position-relative">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  aria-label="First Name"
                  required
                />
                {firstName && <span className="input-overlay">{firstName}</span>}
              </div>
              <div className="input-group mb-3 position-relative">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  aria-label="Last Name"
                  required
                />
                {lastName && <span className="input-overlay">{lastName}</span>}
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
              >
                Submit
              </button>
              <p className="mt-3">
                Don't have a room id?{" "}
                <span
                  className="text-primary p-2"
                  style={{ cursor: "pointer" }}
                  onClick={generateRoomId}
                >
                  New Room
                </span>
              </p>
