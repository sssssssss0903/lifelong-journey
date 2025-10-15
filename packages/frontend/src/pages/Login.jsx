import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../assets/styles.css';
import { Link } from 'react-router-dom';
import bg1 from '../assets/bg1.png';
import bg2 from '../assets/bg2.png';
import mapImg from '../assets/map.png';
import { login } from '../api/index.js';
export default function Login({ setUsername }) { // 从 props 接收 setUsername
  const navigate = useNavigate();
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');

 async function handleLogin() {
    if (!inputUsername.trim() || !password.trim()) {
      alert('用户名和密码不能为空');
      return;
    }

    try {
      const { data } = await login({ username: inputUsername, password }); //  调用封装函数

      if (data.success) {
        localStorage.setItem('username', data.username);
         localStorage.setItem('token', data.token);   
      setUsername(data.username);
    navigate('/home');
      } else {
        alert(data.message || '账号或密码错误');
      }
    } catch (err) {
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
            onChange={e => setInputUsername(e.target.value)} // 修改：避免变量名冲突
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
            <Link to="/register">注册账号</Link>
            <Link to="#">忘记密码</Link> 
          </div>
        </div>
      </div>
    </div>
  );
}
