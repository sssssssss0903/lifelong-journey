import { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));

export default function App() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (stored) setUsername(stored);
  }, []);

  return (
    <Router>
      <Suspense fallback={<div style={{ textAlign: 'center', paddingTop: '2rem' }}>加载中...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to={username ? '/home' : '/login'} />} />
          <Route path="/login" element={<Login setUsername={setUsername} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={username ? <Home username={username} /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
