import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // 用 HashRouter
import Login from './login';
import Home from './Home';
import Register from './Register';

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
