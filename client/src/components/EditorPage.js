import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import ace from "ace-builds/src-noconflict/ace";
import "./ai.css";
import AIChatPanel from "./AIChatPanel";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-solid-svg-icons";


import "ace-builds/src-noconflict/mode-prolog";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-groovy";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-scala";
import "ace-builds/src-noconflict/mode-dart";
import "ace-builds/src-noconflict/mode-r";
import "ace-builds/src-noconflict/mode-perl";
import "ace-builds/src-noconflict/mode-julia";
import "ace-builds/src-noconflict/mode-golang";

import "ace-builds/src-noconflict/theme-clouds";
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/theme-tomorrow";
import $ from "jquery";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import "./style.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faTimes } from "@fortawesome/free-solid-svg-icons";

import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";

import Chat from "./chat.js";
import "./Home.js";
import { connectTypingSocket } from "./TypingSocket";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [autoRun, setAutoRun] = useState(false);
  const [lastError, setLastError] = useState("");
  const typingTimeoutRef = useRef(null);
  const autoRunIntervalRef = useRef(null);

  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef("");
  const editorRef = useRef(null);
  const [theme, setTheme] = useState("monokai");
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("c");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatFull, setChatFull] = useState(false);
  const [chatDocked, setChatDocked] = useState(true);

  const [aiOpen, setAIOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const username = location.state?.username || "";

  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const [typers, setTypers] = useState([]); // users typing
  const [messages, setMessages] = useState([]);
  const typingSocketRef = useRef(null);


//file state for multiple files
  const [files, setFiles] = useState([{ name: "main.py", code: "" }]);
const [activeFileIndex, setActiveFileIndex] = useState(0);

const addFile = () => {

  if (editorRef.current) {
    const currentCode = editorRef.current.getValue();
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === activeFileIndex ? { ...file, code: currentCode } : file
      )
    );
  }

  const extensionMap = {
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    php: "php",
    python: "py",
    node: "js",
    java: "java",
    mysql: "sql",
    groovy: "groovy",
    ruby: "rb",
    rust: "rs",
    typescript: "ts",
    prolog: "pl",
    r: "r",
    perl: "pl",
    go: "go",
  };

  const ext = extensionMap[language] || "txt";

  const newFile = {
    name: `file${files.length + 1}.${ext}`,
    code: "",
    language: language, // inherit current selected language
  };

  
  setFiles((prevFiles) => [...prevFiles, newFile]);
  setActiveFileIndex(files.length); // switch to new file
  if (editorRef.current) {
    editorRef.current.setValue("", 1);
    changeLanguage(language);
  }
};









const switchFile = (index) => {
  // Save current file's code before switching
  if (editorRef.current) {
    const currentCode = editorRef.current.getValue();
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === activeFileIndex ? { ...file, code: currentCode } : file
      )
    );
  }

  // Switch to the new file
  setActiveFileIndex(index);
  const file = files[index];
  if (editorRef.current) {
    editorRef.current.setValue(file.code, 1);
    changeLanguage(file.language);
    setSelectedLanguage(file.language); // update dropdown
  }
};



const handleEditorChange = debounce(() => {
  if (!editorRef.current) return;
  const newCode = editorRef.current.getValue();
  setFiles(prevFiles =>
    prevFiles.map((file, index) =>
      index === activeFileIndex
        ? { ...file, code: newCode, language: selectedLanguage } // store language too
        : file
    )
  );
}, 300);




useEffect(() => {
  if (editorRef.current) {
    const file = files[activeFileIndex];
    editorRef.current.setValue(file.code, 1);
    changeLanguage(file.language);
  }
}, [activeFileIndex]);


  const saveCodeToFile = () => {
  if (!editorRef.current) return;

  const code = editorRef.current.getValue(); // Get code from editor
  const blob = new Blob([code], { type: "text/plain" }); // Create a text file

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "my_code.txt"; // File name for download
  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link);

  toast.success("Code saved as my_code.txt!");
};



// Auto-save all files every 5 seconds
useEffect(() => {
  localStorage.setItem(`editor_files_${roomId}`, JSON.stringify(files));
}, [files, roomId]);


useEffect(() => {
  const savedFiles = localStorage.getItem(`editor_files_${roomId}`);
  if (savedFiles) {
    const parsedFiles = JSON.parse(savedFiles);
    setFiles(parsedFiles);
    setActiveFileIndex(0);

    if (editorRef.current && parsedFiles.length > 0) {
      editorRef.current.setValue(parsedFiles[0].code, 1);
      changeLanguage(parsedFiles[0].language || "c");
      setSelectedLanguage(parsedFiles[0].language || "c");
    }
  }
}, [roomId]);



  // =========================
  // DEBOUNCE HANDLE CHANGE FOR ACE EDITOR + TYPING
  // =========================
const debounceHandleChange = debounce(() => {
  if (!editorRef.current || !typingSocketRef.current?.connected) return;

  const code = editorRef.current.getValue();
  codeRef.current = code;

  socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });

  // Typing event with proper error handling
  try {
    console.log(`⌨️ ${username} is typing...`);
    typingSocketRef.current.emit("typing", { username, roomId });

    // Clear previous timeout
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    
    // Set new timeout to stop typing
    typingTimer.current = setTimeout(() => {
      console.log(`💤 ${username} stopped typing`);
      typingSocketRef.current.emit("stopTyping", { username, roomId });
    }, 1500); // Increased to 1.5 seconds for better UX
  } catch (error) {
    console.error("❌ Error sending typing event:", error);
  }
}, 300); // Increased debounce time to 300ms


  // Add this useEffect to monitor typers state
  useEffect(() => {
    console.log(`👥 Current typers state updated:`, typers);
  }, [typers]);

  // =========================
  // SOCKET & CLIENTS HANDLING
  // =========================
  // Add this cleanup function before the main useEffect
const cleanupTyping = () => {
  if (typingSocketRef.current && username && roomId) {
    console.log("🧹 Cleaning up typing state for:", username);
    typingSocketRef.current.emit("forceStopTyping", { username, roomId });
  }
};

// =========================
// SOCKET & CLIENTS HANDLING
// =========================
useEffect(() => {
  const init = async () => {
    // ==========================
    // CONNECT TO TYPING SERVER
    // ==========================
    typingSocketRef.current = connectTypingSocket();
    console.log("✅ Connected to Typing Server on :5002");

    // Join the same room on typing server
    typingSocketRef.current.emit("join-room", { roomId, username });

   // Replace your typing event handlers with this DEBUG version:

typingSocketRef.current.on("updateTypers", (allTypers) => {
  console.log("🔄 UPDATE_TYPERS - Full list:", allTypers, "My username:", username);
  console.log("🔍 Before filter - All typers:", allTypers);
  const uniqueTypers = [...new Set(allTypers)].filter(typer => typer && typer !== username);
  console.log("✅ After filter - Displaying typers:", uniqueTypers);
  setTypers(uniqueTypers);
});

typingSocketRef.current.on("typing", ({ username: typingUser }) => {
  console.log("⌨️ TYPING EVENT - From:", typingUser, "My username:", username, "Should show?", typingUser !== username);
  if (typingUser && typingUser !== username) {
    setTypers((prev) => {
      if (prev.includes(typingUser)) {
        console.log("ℹ️ User already in typers list:", typingUser);
        return prev;
      }
      const newTypers = [...prev, typingUser];
      console.log("➕ Added typer:", typingUser, "New list:", newTypers);
      return [...new Set(newTypers)];
    });
  } else {
    console.log("🚫 Ignoring self-typing or invalid user");
  }
});

typingSocketRef.current.on("stopTyping", ({ username: stoppedUser }) => {
  console.log("🛑 STOP_TYPING - From:", stoppedUser, "My username:", username, "Should remove?", stoppedUser !== username);
  if (stoppedUser && stoppedUser !== username) {
    setTypers((prev) => {
      const newTypers = prev.filter((u) => u !== stoppedUser);
      console.log("➖ Removed typer:", stoppedUser, "New list:", newTypers);
      return [...new Set(newTypers)];
    });
  } else {
    console.log("🚫 Ignoring self-stop-typing or invalid user");
  }
});

typingSocketRef.current.on("initialTypers", (activeTypers) => {
  console.log("📋 INITIAL_TYPERS - Received:", activeTypers, "My username:", username);
  const uniqueTypers = [...new Set(activeTypers)].filter(typer => typer && typer !== username);
  console.log("🏁 Initial typers to display:", uniqueTypers);
  setTypers(uniqueTypers);
});



    socketRef.current = await initSocket();
    console.log(`✅ Socket connected for user: ${username} in room: ${roomId}`);

    const handleErrors = (err) => {
      console.log("Error", err);
      toast.error("Socket connection failed, Try again later");
      navigate("/");
    };

    socketRef.current.on("connect_error", handleErrors);
    socketRef.current.on("connect_failed", handleErrors);

    socketRef.current.emit(ACTIONS.JOIN, { roomId, username });

   
    
    socketRef.current.on(
      ACTIONS.JOINED,
      ({ clients, username: joinedUser, socketId }) => {
        if (joinedUser !== username) {
          toast.success(`${joinedUser} joined the room.`);
        }

        // Remove duplicate users by username
        const uniqueClients = clients.filter((client, index, self) => 
          index === self.findIndex(c => c.username === client.username)
        );

        setClients(uniqueClients); // FIXED: Use uniqueClients instead of clients
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      }
    );

    socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username: leftUser }) => {
      toast.success(`${leftUser} left the room`);
      setClients((prev) => prev.filter((client) => client.socketId !== socketId));
    });

    socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      if (editorRef.current && code !== editorRef.current.getValue()) {
        editorRef.current.setValue(code, 1);
      }
    });
  };

  init();

  return () => {
    cleanupTyping(); // Add this line
    
    if (socketRef.current) {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.disconnect();
    }

    if (typingSocketRef.current) {
      typingSocketRef.current.off("typing");
      typingSocketRef.current.off("stopTyping");
      typingSocketRef.current.off("initialTypers");
      typingSocketRef.current.off("updateTypers"); // Add this line
      typingSocketRef.current.disconnect();
    }

    if (editorRef.current) {
      editorRef.current.off("change", debounceHandleChange);
      editorRef.current.destroy();
      editorRef.current = null;
    }

    // Clear intervals and timeouts
    if (autoRunIntervalRef.current) {
      clearInterval(autoRunIntervalRef.current);
    }
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, [roomId, navigate, username]);

  // =========================
  // ACE EDITOR SETUP
  // =========================
  useEffect(() => {
    const editor = ace.edit("editor");
    editor.setTheme(`ace/theme/${theme}`);
    editor.session.setMode("ace/mode/c_cpp");
    editor.setOptions({
      fontSize: "14px",
      fontFamily: "Courier New, monospace",
      cursorStyle: "slim",
      showPrintMargin: false,
      wrap: true,
      indentedSoftWrap: false,
      animatedScroll: true,
    });

    editor.renderer.setPadding(10);
    editor.renderer.setScrollMargin(8, 8);

    editorRef.current = editor;

    editor.on("change", debounceHandleChange);

    return () => {
      editor.off("change", debounceHandleChange);
      editor.destroy();
      editorRef.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setTheme(`ace/theme/${theme}`);
      document.body.className = `theme-${theme}`;
    }
  }, [theme]);

  useEffect(() => {
    changeLanguage(language);
  }, [language]);

  // =========================
  // THEME & LANGUAGE FUNCTIONS
  // =========================
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (editorRef.current) editorRef.current.setTheme(`ace/theme/${newTheme}`);
  };

  const changeLanguage = (language) => {
    const modeMapping = {
      c: "ace/mode/c_cpp",
      cpp: "ace/mode/c_cpp",
      php: "ace/mode/php",
      python: "ace/mode/python",
      node: "ace/mode/javascript",
      java: "ace/mode/java",
      mysql: "ace/mode/sql",
      groovy: "ace/mode/groovy",
      csharp: "ace/mode/csharp",
      ruby: "ace/mode/ruby",
      rust: "ace/mode/rust",
      typescript: "ace/mode/typescript",
      julia: "ace/mode/julia",
      r: "ace/mode/r",
      perl: "ace/mode/perl",
      go: "ace/mode/golang",
      prolog: "ace/mode/prolog",
    };
    if (editorRef.current) {
      editorRef.current.session.setMode(modeMapping[language] || "ace/mode/text");
    }
  };

  // =========================
  // CODE EXECUTION
  // =========================
  const executeCode = () => {
    const code = editorRef.current.getValue();
    if (!code.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }


    
    $.ajax({
  url: "http://localhost/my_editor/compiler.php",
  method: "POST",
  data: {
    language: language,
    code: code,
    input: userInput,
  },
  success: function (response) {
    setOutput(response.output);
    setLastError("");
    
    // Example: set annotations if errors exist
    if (response.error) {
      editorRef.current.getSession().setAnnotations([{
        row: response.line - 1,   // make sure your server sends 'line'
        column: 0,
        text: response.error,     // make sure server sends 'error' text
        type: "error"
      }]);
    } else {
      editorRef.current.getSession().clearAnnotations();
    }
  },
  error: function (xhr) {
    const errorMessage =
      xhr.responseJSON?.message || "An error occurred while executing the code.";
    setLastError(errorMessage);
    editorRef.current.getSession().clearAnnotations();
  },
});

  };

  useEffect(() => {
    if (autoRun) {
      autoRunIntervalRef.current = setInterval(() => {
        executeCode();
      }, 4000);
      return () => clearInterval(autoRunIntervalRef.current);
    }
  }, [autoRun, language, userInput]);

  if (!location.state) return <Navigate to="/" />;

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID is copied");
    } catch {
      toast.error("Unable to copy the room ID");
    }
  };

  
  const leaveRoom = async () => {
    navigate("/");
  };


  function removeFile(index) {
  if (files.length === 1) return; // always keep at least one file
  const newFiles = files.filter((_, i) => i !== index);
  setFiles(newFiles);

  if (activeFileIndex === index) {
    setActiveFileIndex(0);
    if (editorRef.current) editorRef.current.setValue(newFiles[0].code, 1);
  } else if (activeFileIndex > index) {
    setActiveFileIndex((prev) => prev - 1);
  }
}


  return (
    <div className={`container-fluid vh-100 theme-${theme}`}>
      <div className="row h-100">
        <div className="col-md-2 d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center">
            <img
              src="\images\logo.png"
              alt="Logo"
              className="img-fluid mx-auto"
              style={{ maxWidth: "150px", marginTop: "-43px" }}
            />
            <hr style={{ marginTop: "-3rem" }} />
          </div>
        
        <div className="d-flex flex-column flex-grow-1 overflow-auto">
  <span className="mb-2">Members</span>

  {clients
    .filter((client, index, self) => 
      index === self.findIndex(c => c.username === client.username)
    )
    .map((client) => (
      <div
        key={client.socketId}
        className="d-flex align-items-center mb-2"
        style={{ gap: "5px" }}
      >
        <Client username={client.username} />
        {typers.includes(client.username) && client.username !== username && (
          <span style={{ fontSize: "0.8rem", color: "gray" }}>
            typing...
          </span>
        )}
      </div>
    ))
  }
</div>

         
          <div className="room-info">
                  <h6>Room: {roomId}</h6>
                  <small>Users Online: {clients.length}</small><br></br>
                  <small>User Name :{username}</small>
                </div>

                

          <hr />
          <div className="mt-auto mb-3">
            <button className="btn btn-success w-100 mb-2" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger w-100" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>

          <section>
            {/* Floating Chat Button */}
            <button
              onClick={() => {
                setChatOpen(true);
                setChatDocked(true); // default open in half screen
                setChatFull(false);
              }}
              className="chat-float-btn"
            >
              <i className="fa fa-comments" title="Chat"></i>
            </button>

            {/* Chat Popup */}
            {chatOpen && (
              <div
                className={`chat-popup ${
                  chatFull ? "fullscreen" : chatDocked ? "halfscreen" : ""
                }`}
              >
                {/* Header */}
                <div className="chat-popup-header">
                  <span>Chat</span>
                  <div>
                    {/* Toggle Fullscreen */}
                    <button
                      className="chat-popup-btn"
                      onClick={() => {
                        setChatFull(!chatFull);
                        setChatDocked(!chatDocked);
                      }}
                    >
                      {chatFull ? "➖ Half" : "⛶ Full"}
                    </button>

                    {/* Close */}
                    <button
                      className="chat-popup-btn"
                      onClick={() => setChatOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                   
                {/* Body */}
                <div className="chat-popup-body">
<Chat 
  username={Location.state?.username} 
  roomId={roomId} 
/>

                </div>
              </div>
            )}
          </section>
        </div>

        {/* Main Editor Panel */}
        <div className="col-md-10 d-flex flex-column h-100">
          <div className="header">V EDITOR</div>
        
            
          <div className="control-panel">
            {/* AI Helper Floating Button */}

            {/* Floating AI Helper Button */}
            {!aiOpen && (
              <div className="ai-helper-button" onClick={() => setAIOpen(true)}>
                <span>AI✨</span>
              </div>
            )}

            {aiOpen && (
              <div className="ai-popup">
                {/* Header with title and close button */}
                <div className="ai-popup-header">
                  <span></span>
                  <button
                    className="ai-popup-close"
                    onClick={() => setAIOpen(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>

                {/* Iframe */}
                <iframe
                  src="http://localhost:5173/"
                  title="AI Chat"
                  className={`ai-popup-iframe ${
                    isFullscreen ? "fullscreen" : ""
                  }`}
                />

                {/* Expand/Collapse Button */}
                <button
                  className="ai-toggle-btn"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? "Slide Right" : "Slide Left"}
                </button>
              </div>
            )}

            <div>
              <label htmlFor="language-select" className="language-icon">
                🌐 Select Language:
              </label>
              <br></br>

              <select
                id="language-select"
                  value={files[activeFileIndex]?.language || language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="php">PHP</option>
                <option value="python">Python</option>
                <option value="node">JAVASCRIPT</option>
                <option value="java">Java</option>
                <option value="mysql">MySQL</option>
                <option value="groovy">Groovy</option>
                <option value="ruby">Ruby</option>
                <option value="rust">Rust</option>
                <option value="typescript">TypeScript</option>
                <option value="prolog">PROLOG</option>
                <option value="r">R</option>
                <option value="perl">Perl</option>
                <option value="go">Go</option>
              </select>
            </div>


          <div className="file-tabs">
  {files.map((file, index) => (
    <div key={index} className={`tab-wrapper ${activeFileIndex === index ? "active" : ""}`}>
      <button
        className="tab-btn"
        onClick={() => switchFile(index)}
      >
        {file.name}
      </button>
      <button
        className="remove-tab-btn"
        onClick={(e) => {
          e.stopPropagation(); // prevent switching file
          removeFile(index);
        }}
      >
        ×
      </button>
    </div>
  ))}
  <button className="tab-btn add-tab" onClick={addFile}>
    + Add File
  </button>
</div>


            <div className="theme-selector">
              <button
                onClick={() => changeTheme("monokai")}
                className="btn btn-secondary"
              >
                Monokai
              </button>
              <button
                onClick={() => changeTheme("twilight")}
                className="btn btn-secondary"
              >
                Twilight
              </button>
              <button
                onClick={() => changeTheme("github")}
                className="btn btn-secondary"
              >
                GitHub
              </button>
              <button
                onClick={() => changeTheme("solarized_dark")}
                className="btn btn-secondary"
              >
                Solarized Dark
              </button>
              <button
                onClick={() => changeTheme("solarized_light")}
                className="btn btn-secondary"
              >
                Solarized Light
              </button>
              <button
                onClick={() => changeTheme("terminal")}
                className="btn btn-secondary"
              >
                Terminal
              </button>
              <button
                onClick={() => changeTheme("tomorrow")}
                className="btn btn-secondary"
              >
                Tomorrow
              </button>
              <button
                onClick={() => changeTheme("clouds")}
                className="btn btn-secondary"
              >
                Clouds
              </button>
              <button
                onClick={() => changeTheme("eclipse")}
                className="btn btn-secondary"
              >
                Eclipse
              </button>
              <button
                onClick={() => changeTheme("idle_fingers")}
                className="btn btn-secondary"
              >
                Idle Fingers
              </button>
            </div>

            <div className="editor" id="editor"></div>
              <div className="mb-2">
                
  <label>
    <input
      type="radio"
      name="autorun"
      checked={autoRun === true}
      onChange={() => setAutoRun(true)}
    />{" "}
    Auto Run ON
  </label>
  <label style={{ marginLeft: "10px" }}>
    <input
      type="radio"
      name="autorun"
      checked={autoRun === false}
      onChange={() => setAutoRun(false)}
    />{" "}
    Auto Run OFF
  </label>
</div>

            <div className="d-flex justify-content-end p-2">
              <button
                className="btn btn-primary custom-run-btn"
                onClick={executeCode}
              >
                Run
              </button>
           <button
  className="btn btn-info btn-sm d-flex align-items-center"
  onClick={() => {
    navigator.clipboard.writeText(editorRef.current.getValue());
    toast.success("Code copied to clipboard!");
  }}
  title="Copy Code"
>
  <FontAwesomeIcon icon={faCopy} style={{ marginRight: "4px" }} />
  Copy
</button>

              <button
    className="btn btn-success btn-sm d-flex align-items-center"
    onClick={saveCodeToFile}
    title="Save Code"
  >
    <FontAwesomeIcon icon={faSave} style={{ marginRight: "4px" }} />
    Save
  </button>

            </div>

       


            <div className="input-output-section">
              <textarea
                className="form-control"
                placeholder="Enter input here..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              >
              </textarea>
              
              <pre className="output">{output}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// This is the last line of your component file
export default EditorPage;
