import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // 用 HashRouter
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";


export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUsername={setUsername} />} />
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home username={username} />} />
      </Routes>
    </Router>
  );
}
