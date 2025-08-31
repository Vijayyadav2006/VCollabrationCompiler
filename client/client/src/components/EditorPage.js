import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
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
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";


function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef(null);
  const editorRef = useRef(null);
  const [theme, setTheme] = useState("monokai");
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("c");
  const [typing, setTyping] = useState("");

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      socketRef.current.on("userTyping", ({ username }) => {
        if (username !== Location.state?.username) {
          setTyping(username);
          setTimeout(() => {
            setTyping("");
          }, 1500);
        }
      });

      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (editorRef.current && code !== editorRef.current.getValue()) {
          editorRef.current.setValue(code, 1); // Update the editor without cursor jumping
        }
      });
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        [
          "joined",
          "init-clients",
          "left",
          "code-change",
          "userTyping",
        ].forEach((event) => socketRef.current.off(event));
      }

      if (editorRef.current) {
        editorRef.current.off("change", debounceHandleChange);
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [roomId, navigate, Location.state?.username]);

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
      if (editorRef.current) {
        editorRef.current.off("change", debounceHandleChange);
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [theme]);

  useEffect(() => {
    const editor = editorRef.current;
    editor.setTheme(`ace/theme/${theme}`);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    changeLanguage(language);
  }, [language]);

  const handleChange = () => {
    const code = editorRef.current.getValue();
    codeRef.current = code;

    // Emit typing event
    socketRef.current.emit("userTyping", { username: Location.state?.username });

    // Emit code change event
    socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
  };

  const debounceHandleChange = debounce(handleChange, 300);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (editorRef.current) {
      editorRef.current.setTheme(`ace/theme/${newTheme}`);
    }
  };

  const changeLanguage = (language) => {
    const modeMapping = {
      c: "ace/mode/c_cpp",
      cpp: "ace/mode/c_cpp",
      php: "ace/mode/php",
      python: "ace/mode/python",
      node: "ace/mode/javascript",
      java: "ace/mode/java",
    };
    if (editorRef.current) {
      editorRef.current.session.setMode(modeMapping[language] || "ace/mode/text");
    }
  };

  const executeCode = () => {
    const code = editorRef.current.getSession().getValue();
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
        setOutput(response);
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON?.message || "An error occurred while executing the code.";
        toast.error(`Execution Error: ${errorMessage}`);
      }
    });
  };

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

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
            {clients.map((client) => (
              <div key={client.socketId} className={`client ${typing === client.username ? 'typing' : ''}`}>
                <Client username={client.username} />
                {typing === client.username && <div className="typing-indicator-box">{client.username} is typing...</div>}
              </div>
            ))}
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
        </div>
        <div className="col-md-10 d-flex flex-column h-100">
          <div className="header">V EDITOR</div>
          <div className="control-panel">
            <label htmlFor="language-select" className="language-icon">🌐 Select Language:</label>
            <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="php">PHP</option>
              <option value="python">Python</option>
              <option value="node">Node JS</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className="theme-selector">
            <button onClick={() => changeTheme('monokai')} className="btn btn-secondary">Monokai</button>
            <button onClick={() => changeTheme('twilight')} className="btn btn-secondary">Twilight</button>
            <button onClick={() => changeTheme('github')} className="btn btn-secondary">GitHub</button>
            <button onClick={() => changeTheme('solarized_dark')} className="btn btn-secondary">Solarized Dark</button>
            <button onClick={() => changeTheme('solarized_light')} className="btn btn-secondary">Solarized Light</button>
            <button onClick={() => changeTheme('terminal')} className="btn btn-secondary">Terminal</button>
            <button onClick={() => changeTheme('tomorrow')} className="btn btn-secondary">Tomorrow</button>
          </div>
          <div className="editor" id="editor"></div>
          <div className="d-flex justify-content-end p-2">
            <button className="btn btn-primary custom-run-btn" onClick={executeCode}>Run</button>
          </div>
          <div className="input-output-section">
            <textarea
              className="form-control"
              placeholder="Enter input here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            ></textarea>
            <pre className="output">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
