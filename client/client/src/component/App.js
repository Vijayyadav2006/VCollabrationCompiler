import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import EditorPage from './EditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor/:roomId" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" />} /> {/* Fallback for unmatched routes */}
    </Routes>
  );
}

export default App;
