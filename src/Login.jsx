import { useNavigate } from 'react-router-dom';
import './styles.css';

// 正确引入静态资源
import bg1 from './assets/bg1.png';
import bg2 from './assets/bg2.png';
import mapImg from './assets/map.png';

export default function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    navigate('/home');
  }

  return (
    <div
      className="login-bg"
      style={{ backgroundImage: `url(${bg2})` }}
    >
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

          <input className="login-input" placeholder="请输入账号" />
          <input type="password" className="login-input" placeholder="请输入密码" />

          <label className="login-remember">
            <input type="checkbox" className="login-checkbox" />
            记住密码
          </label>

          <button className="login-button" onClick={handleLogin}>登录</button>

          <div className="login-footer-links">
            <a href="#">注册账号</a>
            <a href="#">忘记密码</a>
          </div>
        </div>
      </div>
    </div>
  );
}
