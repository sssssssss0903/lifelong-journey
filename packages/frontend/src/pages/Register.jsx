import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../assets/styles.css';    
import bg1 from "../assets/bg1.webp";
import bg2 from "../assets/bg2.webp";
import mapImg from '../assets/map-1900.webp';
import { Link } from 'react-router-dom';
import { register } from '../api/index.js';  // 自动从 index.js 汇总导出

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
    // 新后端 RESTful：成功 201；失败拦截器已经处理 4xx（409 用户名已用 / 400 参数错）
    await register({ username, password });
    alert('注册成功');
    navigate('/');
  } catch (err) {
    if (!err.response) alert('网络错误，请检查后端服务是否启动');
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
            
             <Link to="/">返回登录</Link> 
          </div>
        </div>
      </div>
    </div>
  );
}
