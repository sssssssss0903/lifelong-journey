import { useNavigate } from 'react-router-dom';
import './styles.css'; // ✅ 引入自定义 CSS

export default function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    // 这里可以加登录逻辑
    navigate('/home');
  }

  return (
    <div
      className="login-bg"
      style={{ backgroundImage: "url('/src/assets/bg2.png')" }}
    >
      <img
        src="/src/assets/bg1.png"
        className="login-overlay"
        alt="overlay"
      />

      <div className="login-panel">
        <div className="login-left">
          <h1 className="login-title">欢迎使用</h1>
          <h2 className="login-subtitle">Lifelong Journey</h2>
          <img src="/src/assets/map.png" alt="Map" className="login-map" />
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
