import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login.js';
import IntroPage from './components/Intro.js';
import Register from './components/register.js'; // Ensure correct capitalization
import Chat from './components/chat';  // match lowercase filename

function App() {
  return (
    <>
      <div>
        <Toaster position='top-center' />
      </div>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/Register" element={<Register />} />   {/* Fixed */}
        <Route path="/Login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />  // use uppercase when rendering component
        <Route path="/home" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </>
  );
}

export default App;
