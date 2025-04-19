import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './styles.css'; // 保持和登录页样式统一

import bg1 from './assets/bg1.png';
import bg2 from './assets/bg2.png';
import mapImg from './assets/map.png';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
        alert('用户名和密码不能为空');
        return;
      }
    
    try {
      const res = await axios.post('http://localhost:3001/api/register', {
        username,
        password
      });
      alert(res.data.message);
      if (res.data.success) {
        navigate('/'); // 注册成功后跳转回登录页
      }
    } catch (err) {
      alert(err.response?.data?.message || '注册失败');
    }
  };

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${bg2})` }}>
      <img src={bg1} className="login-overlay" alt="overlay" />

      <div className="login-panel">
        <div className="login-left">
          <h1 className="login-title">欢迎加入</h1>
          <h2 className="login-subtitle">Lifelong Journey</h2>
          <img src={mapImg} alt="Map" className="login-map" />
        </div>

        <div className="login-divider" />

        <div className="login-right">
          <div className="login-slogan">
            <p>Begin your journey</p>
            <p>Start here</p>
          </div>

          <h2 className="login-header">注册</h2>

          <input
            className="login-input"
            placeholder="请输入账号"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="login-button" onClick={handleRegister}>注册</button>

          <div className="login-footer-links">
            <a href="/">返回登录</a>
          </div>
        </div>
      </div>
    </div>
  );
}
