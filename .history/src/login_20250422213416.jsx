import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

import bg1 from './assets/bg1.png';
import bg2 from './assets/bg2.png';
import mapImg from './assets/map.png';

export default function Login({ setUsername }) { // ✅ 从 props 接收 setUsername
  const navigate = useNavigate();
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');
  alert(")");
  async function handleLogin() {
    if (!inputUsername.trim() || !password.trim()) {
      alert('用户名和密码不能为空');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3001/api/login', {
        username: inputUsername,
        password
      });

      if (res.data.success) {
        localStorage.setItem('username', res.data.username); // ✅ 本地持久化
        setUsername(res.data.username);                      // ✅ 调用全局状态更新
        navigate('/home');
      } else {
        alert('账号或密码错误');
      }
    }catch (err) {
      console.error('登录请求失败:', err);
      alert('登录失败，请检查服务是否启动');
    }
  }

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${bg2})` }}>
      <img src={bg1} className="login-overlay" alt="overlay" />

      <div className="login-panel">
        <div className="login-left">
          <h1 className="login-title">欢迎使用</h1>
          <h2 className="login-subtitle">Lifelong Journey</h2>
          <img src={mapImg} alt="Map" className="login-map" />
        </div>

        <div className="login-divider" />

        <div className="login-right">
          <div className="login-slogan">
            <p>Your journey</p>
            <p>Your map</p>
          </div>

          <h2 className="login-header">登录</h2>

          <input
            className="login-input"
            placeholder="请输入账号"
            value={inputUsername}
            onChange={e => setInputUsername(e.target.value)} // ✅ 修改：避免变量名冲突
          />
          <input
            type="password"
            className="login-input"
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <label className="login-remember">
            <input type="checkbox" className="login-checkbox" />
            记住密码
          </label>

          <button className="login-button" onClick={handleLogin}>登录</button>

          <div className="login-footer-links">
            <a href="/register">注册账号</a>
            <a href="#">忘记密码</a>
          </div>
        </div>
      </div>
    </div>
  );
}
