import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/styles.css';

//  首屏 LCP 图走 public 稳定路径，跟 index.html 的 <link rel=preload> 命中同一缓存
//  (不再走 src/assets import 让 Vite hash，否则 preload URL 和 img src URL 不一致)
const bg1 = '/bg1.webp';
const bg2 = '/bg2.webp';
//  非 LCP 图（地图）保持 hash，享受长缓存
import mapLarge from '../assets/map-1900.webp';
import mapMedium from '../assets/map-1200.webp';
import mapSmall from '../assets/map-800.webp';

import { login } from '../api/index.js';

export default function Login({ setUsername }) {
  const navigate = useNavigate();
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!inputUsername.trim() || !password.trim()) {
      alert('用户名和密码不能为空');
      return;
    }

    try {
      // 新后端 RESTful：登录成功 201，失败由 axios 拦截器 throw（401 → message 已挂 err.message）
      const { data } = await login({ username: inputUsername, password });
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      setUsername(data.username);
      navigate('/home');
    } catch (err) {
      // 拦截器已经 alert 过 4xx；这里兜底网络错误
      if (!err.response) alert('登录失败，请检查服务是否启动');
    }
  }

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${bg2})` }}>
      {/*  主体叠加图（LCP 主图） */}
      <img
        src={bg1}
        className="login-overlay"
        alt="overlay"
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />

      <div className="login-panel">
        <div className="login-left">
          <h1 className="login-title">欢迎使用</h1>
          <h2 className="login-subtitle">Lifelong Journey</h2>

          {/*  地图图像立即加载 + 响应式 + 高优先级 */}
          <picture className="login-map">
            <source srcSet={mapSmall} type="image/webp" media="(max-width: 800px)" />
            <source srcSet={mapMedium} type="image/webp" media="(max-width: 1400px)" />
            {/* 只有 bg1 overlay 是 LCP 主图，标 high；map 让渡为 auto 避免抢带宽 */}
            <img
              src={mapLarge}
              alt="Map"
              fetchPriority="auto"
              loading="eager"
              decoding="async"
              width="863"
              height="471"
              style={{ width: '100%', height: 'auto' }}
            />
          </picture>
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
            onChange={e => setInputUsername(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <label className="login-remember">
            <input type="checkbox" className="login-checkbox" />记住密码
          </label>

          <button className="login-button" onClick={handleLogin}>
            登录
          </button>

          <div className="login-footer-links">
            <Link to="/register">注册账号</Link>
            <Link to="#">忘记密码</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
