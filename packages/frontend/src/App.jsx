import { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Login 同步加载：99% 用户首次落地是 Login 页，lazy 会让 Suspense fallback 顶 200-400ms
// 推迟 LCP；Login 组件本身只有几 KB，不值得 lazy
import Login from './pages/Login';

// Home / Register 保持 lazy：Home 拖着 amap/echarts 重型依赖，Register 是低频路径
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
